const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Student = require('../models/student')
const Admin = require('../models/admin')
const Course = require('../models/course')
const helper = require('./tests_helper')

let adminToken = null

let firstStudentLoggedIn = null

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

  const firstStudentLoggedInRepsonse = await api
    .post('/login/student')
    .send({
      email: helper.initialStudents[0].email,
      password: helper.initialStudents[0].password
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  firstStudentLoggedIn = firstStudentLoggedInRepsonse.body

  await Course.destroy({ where: {} })

  await Promise.all(
    helper.initialCourses.map(course =>
      api.post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(course)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    )
  )
})

after(() => {
  sequelize.close()
})

describe('When there are initially some courses saved', async () => {
  test('an admin can create a course', async () => {
    const newCourse = {
      name: 'New Course',
    }

    await api
      .post('/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newCourse)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const coursesAtEnd = await Course.findAll()
    assert.strictEqual(coursesAtEnd.length, helper.initialCourses.length + 1)

    const courseNames = coursesAtEnd.map(course => course.name)
    assert(courseNames.includes('New Course'))
  })
})