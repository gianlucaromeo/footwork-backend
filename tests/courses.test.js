const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Course = require('../models/course')
const helper = require('./tests_helper')


let firstAdminLoggedIn = null
let firstStudentLoggedIn = null

beforeEach(async () => {
  const dbData = await helper.initizliaseDatabase()
  firstAdminLoggedIn = dbData.firstAdminLoggedIn
  firstStudentLoggedIn = dbData.firstStudentLoggedIn
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
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .send(newCourse)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const coursesAtEnd = await Course.findAll()
    assert.strictEqual(coursesAtEnd.length, helper.initialCourses.length + 1)

    const courseNames = coursesAtEnd.map(course => course.name)
    assert(courseNames.includes('New Course'))
  })

  test('a user can get all courses they are enrolled in', async () => {
    const response = await api
      .get('/courses/student/all')
      .set('Authorization', `Bearer ${firstStudentLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 2)
  })

  test('a user cannot get all their courses without token', async () => {
    await api
      .get('/courses/student/all')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('a user cannot get all their courses with invalid token', async () => {
    await api
      .get('/courses/student/all')
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})