const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Admin = require('../models/admin')
const helper = require('./helper')


beforeEach(async () => {
  await helper.initializeDatabase()
})

after(() => {
  sequelize.close()
})

describe('When there are initially some admins saved', async () => {
  test('a valid admin can login', async () => {
    const admin = helper.initialAdmins[0]

    const response = await api
      .post('/login/admin')
      .send({ email: admin.email, password: admin.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.email, admin.email)
    assert.strictEqual(response.body.name, admin.name)
    assert(response.body.token)
  })

  test('all admins are returned as json', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    await api
      .get('/admins')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const admins = await Admin.findAll({})
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
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    await api
      .delete(`/admins/${firstAdminLoggedInResponse.body.id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .expect(204)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length - 1)
  })

  test('an admin cannot delete another admin account', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    await api
      .delete(`/admins/${firstAdminLoggedInResponse.body.id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.token}`)
      .expect(401)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
  })

  test('an admin cannot delete an admin account without a token', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    await api
      .delete(`/admins/${firstAdminLoggedInResponse.body.id}`)
      .expect(401)
  })

  test('an admin cannot delete an admin account with an invalid token', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    const invalidToken = 'Bearer invalidtoken'

    await api
      .delete(`/admins/${firstAdminLoggedInResponse.body.id}`)
      .set('Authorization', invalidToken)
      .expect(401)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
  })

  test('an admin can update their own account', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    const updatedAdmin = {
      firstName: 'Updated',
      lastName: 'Admin',
      email: 'new@email.com',
      password: 'newpassword'
    }

    await api
      .put(`/admins/${firstAdminLoggedInResponse.body.id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .send(updatedAdmin)
      .expect(200)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
    assert(admins.map(a => a.email).includes(updatedAdmin.email))
  })

  test('an admin can update the courses a student is enrolled in', async () => {
    const firstStudent = helper.initialStudents[0]
    const secondCourse = helper.initialCourses[1]

    const updatedStudent = {
      id: firstStudent.id,
      courses: [secondCourse.id]
    }

    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    await api.put(`/admins/student/${firstStudent.id}`)
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .send(updatedStudent)
      .expect(200)
  })
})