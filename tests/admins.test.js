const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Admin = require('../models/admin')
const helper = require('./tests_helper')

let firstAdminLoggedIn = null

beforeEach(async () => {
  await Admin.destroy({ where: {} })

  await Promise.all(
    helper.initialAdmins.map(admin =>
      api.post('/admins')
        .send(admin)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    )
  )

  const adminLoginResponse = await api
    .post('/login/admin')
    .send({
      email: helper.initialAdmins[0].email,
      password: helper.initialAdmins[0].password
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  firstAdminLoggedIn = adminLoginResponse.body
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
})