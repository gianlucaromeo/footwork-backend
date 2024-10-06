const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Student = require('../models/student')
const helper = require('./tests_helper')

beforeEach(async () => {
  await Student.destroy({ where: {} })

  await Promise.all(
    helper.initialStudents.map(student =>
      api.post('/students')
        .send(student)
        .expect(201)
    )
  )
})

after(() => {
  console.log(app.sequelize)
  sequelize.close()
})

describe('When there are initially some students saved', () => {
  test('a valid student can login', async () => {
    const student = helper.initialStudents[0]

    const loginData = {
      email: student.email,
      password: student.password
    }

    const response = await api
      .post('/login/student')
      .send(loginData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.email, student.email)
    assert.strictEqual(response.body.name, student.name)
    assert(response.body.token)
  })

  test('all students are returned as json', async () => {
    // TODO Only admins should be able to access this endpoint
    await api
      .get('/students')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const students = await Student.findAll()
    assert.strictEqual(students.length, helper.initialStudents.length)
  })
})