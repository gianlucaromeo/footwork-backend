const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Student = require('../models/student')
const helper = require('./tests_helper')

let firstAdminLoggedIn = null
let firstStudentLoggedIn = null

beforeEach(async () => {
  const users = await helper.initizliaseDatabase()
  firstAdminLoggedIn = users.firstAdminLoggedIn
  firstStudentLoggedIn = users.firstStudentLoggedIn
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
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const students = await Student.findAll()
    assert.strictEqual(students.length, helper.initialStudents.length)
  })

  test('a student can delete their own account', async () => {
    await api
      .delete(`/students/${firstStudentLoggedIn.id}`)
      .set('Authorization', `Bearer ${firstStudentLoggedIn.token}`)
      .expect(204)

    const students = await Student.findAll()
    assert.strictEqual(students.length, helper.initialStudents.length - 1)
    assert(!students.map(s => s.id).includes(firstStudentLoggedIn.id))
  })

  test('a student can update their own account', async () => {
    const updatedStudent = {
      ...firstStudentLoggedIn,
      email: 'new@email.com',
      password: 'newpassword'
    }

    await api
      .put(`/students/${firstStudentLoggedIn.id}`)
      .set('Authorization', `Bearer ${firstStudentLoggedIn.token}`)
      .send(updatedStudent)
      .expect(200)

    const students = await Student.findAll()
    assert.strictEqual(students.length, helper.initialStudents.length)
    assert(students.map(s => s.email).includes(updatedStudent.email))
  })
})