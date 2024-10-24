const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Admin = require('../models/admin')
const helper = require('./tests_helper')

let firstAdminLoggedIn = null
let firstStudentLoggedIn = null
let secondCourse = null

beforeEach(async () => {
  const users = await helper.initizliaseDatabase()
  firstAdminLoggedIn = users.firstAdminLoggedIn
  firstStudentLoggedIn = users.firstStudentLoggedIn
  secondCourse = users.secondCourse
})

after(() => {
  sequelize.close()
})

describe('When there are initially some admins saved', async () => {
  test('a valid admin can login', async () => {
    const admin = helper.initialAdmins[0]

    const loginData = {
      email: admin.email,
      password: admin.password
    }

    const response = await api
      .post('/login/admin')
      .send(loginData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.email, admin.email)
    assert.strictEqual(response.body.name, admin.name)
    assert(response.body.token)
  })

  test('all admins are returned as json', async () => {
    await api
      .get('/admins')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
  })

  test('admins cannot be retrieved without a token', async () => {
    await api
      .get('/admins')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('admins cannot be retrieved with an invalid token', async () => {
    const invalidToken = 'Bearer invalidtoken'
    await api
      .get('/admins')
      .set('Authorization', invalidToken)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('an admin can delete their own account', async () => {
    await api
      .delete(`/admins/${firstAdminLoggedIn.id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(204)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length - 1)
  })

  test('an admin cannot delete another admin account', async () => {
    await api
      .delete(`/admins/${helper.initialAdmins[1].id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(401)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
  })

  test('an admin cannot delete an admin account without a token', async () => {
    await api
      .delete(`/admins/${helper.initialAdmins[0].id}`)
      .expect(401)
  })

  test('an admin cannot delete an admin account with an invalid token', async () => {
    const invalidToken = 'Bearer invalidtoken'

    await api
      .delete(`/admins/${helper.initialAdmins[0].id}`)
      .set('Authorization', invalidToken)
      .expect(401)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
  })

  test('an admin can update their own account', async () => {
    const updatedAdmin = {
      firstName: 'Updated',
      lastName: 'Admin',
      email: 'new@email.com',
      password: 'newpassword'
    }

    await api
      .put(`/admins/${firstAdminLoggedIn.id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .send(updatedAdmin)
      .expect(200)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
    assert(admins.map(a => a.email).includes(updatedAdmin.email))
  })

  test('an admin can update the courses a student is enrolled in', async () => {
    const studentId = firstStudentLoggedIn.id

    const updatedStudent = {
      id: studentId,
      courses: [secondCourse.id]
    }

    await api.put(`/admins/student/${studentId}`)
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .send(updatedStudent)
      .expect(200)
  })
})