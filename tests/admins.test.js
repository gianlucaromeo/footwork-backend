const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Admin = require('../models/admin')
const helper = require('./tests_helper')

beforeEach(async () => {
  await Admin.destroy({ where: {} })

  await Promise.all(
    helper.initialAdmins.map(admin =>
      api.post('/admins')
        .send(admin)
        .expect(201)
    )
  )
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
    // TODO Only admins should be able to access this endpoint
    await api
      .get('/admins')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const admins = await Admin.findAll()
    assert.strictEqual(admins.length, helper.initialAdmins.length)
  })
})