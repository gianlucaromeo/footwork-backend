const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Student = require('../models/student')
const helper = require('./helper')

beforeEach(async () => {
  await helper.initializeDatabase()
})

after(() => {
  sequelize.close()
})

describe('When there are initially some students saved', async () => {
  test('a valid student can login and receive a token', async () => {
    const student = helper.initialStudents[0]

    const response = await api
      .post('/login/student')
      .send({ email: student.email, password: student.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.email, student.email)
    assert.strictEqual(response.body.name, student.name)
    assert(response.body.token)
  })

  test('all students are returned as json to an admin', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    const getAllStudentsResponse = await api
      .get('/students')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const fetchedStudents = getAllStudentsResponse.body
    const studentsInDb = await Student.findAll()

    assert.strictEqual(fetchedStudents.length, studentsInDb.length)
  })

  test('a student can delete their own account', async () => {
    const firstStudent = helper.initialStudents[0]

    const firstStudentLoggedInResponse = await api
      .post('/login/student')
      .send({ email: firstStudent.email, password: firstStudent.password })
      .expect(200)

    await api
      .delete(`/students/${firstStudentLoggedInResponse.body.id}`)
      .set('Authorization', `Bearer ${firstStudentLoggedInResponse.body.token}`)
      .expect(204)

    const studentsInDb = await Student.findAll()

    assert.strictEqual(studentsInDb.length, helper.initialStudents.length - 1)

    assert(!studentsInDb.map(s => s.id).includes(firstStudentLoggedInResponse.id)
    )
  })

  test('a student can update their own account', async () => {
    const firstStudent = helper.initialStudents[0]

    const firstStudentLoggedInResponse = await api
      .post('/login/student')
      .send({ email: firstStudent.email, password: firstStudent.password })
      .expect(200)

    const updatedStudent = {
      ...firstStudentLoggedInResponse.body,
      email: 'new@email.com',
      password: 'NewPassword1?'
    }

    await api
      .put(`/students/${firstStudentLoggedInResponse.body.id}`)
      .set('Authorization', `Bearer ${firstStudentLoggedInResponse.body.token}`)
      .send(updatedStudent)
      .expect(200)

    const studentsInDb = await Student.findAll()
    assert.strictEqual(studentsInDb.length, helper.initialStudents.length)
    assert(studentsInDb.map(s => s.email).includes(updatedStudent.email))
  })
})