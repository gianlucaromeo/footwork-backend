const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Student = require('../models/student')
const Admin = require('../models/admin')
const helper = require('./tests_helper')

let adminToken = null

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

  await Student.destroy({ where: {} })

  await Promise.all(
    helper.initialStudents.map(student =>
      api.post('/students')
        .send(student)
        .expect(201)
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

  adminToken = adminLoginResponse.body.token
})

after(() => {
  sequelize.close()
})

describe('When there are initially some students saved', async () => {
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

  test('all students are returned as json to an admin', async () => {
    await api
      .get('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const students = await Student.findAll()
    assert.strictEqual(students.length, helper.initialStudents.length)
  })

  test('a student can delete their own account', async () => {
    const student = helper.initialStudents[0]

    const loginData = {
      email: student.email,
      password: student.password
    }

    const loginResponse = await api
      .post('/login/student')
      .send(loginData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const studentToken = loginResponse.body.token
    const studentId = loginResponse.body.id

    await api
      .delete(`/students/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(204)

    const students = await Student.findAll()
    assert.strictEqual(students.length, helper.initialStudents.length - 1)
    assert(!students.map(s => s.id).includes(loginResponse.body.id))
  })
})