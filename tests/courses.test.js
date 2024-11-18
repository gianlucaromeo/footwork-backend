const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Course = require('../models/course')
const helper = require('./helper')

beforeEach(async () => {
  await helper.initializeDatabase()
})

after(() => {
  sequelize.close()
})

describe('When there are initially some courses saved', async () => {
  test('an admin can create a course', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    const fs = require('fs')
    const path = require('path')
    const coverImagePath = path.join(__dirname, 'test-cover.png')
    const coverImageFile = fs.readFileSync(coverImagePath)

    const newCourse = {
      name: 'New Course',
      coverImage: coverImageFile,
    }

    await api
      .post('/courses')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .field('name', newCourse.name)
      .field('folder', '/tests')
      .attach('coverImage', coverImagePath)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const coursesAtEnd = await Course.findAll()
    assert.strictEqual(coursesAtEnd.length, helper.initialCourses.length + 1)

    const courseNames = coursesAtEnd.map(course => course.name)
    assert(courseNames.includes('New Course'))
  })

  test('a user can get all courses they are enrolled in', async () => {
    const firstStudent = helper.initialStudents[0]

    const firstStudentLoggedInResponse = await api
      .post('/login/student')
      .send({ email: firstStudent.email, password: firstStudent.password })
      .expect(200)

    const response = await api
      .get('/courses/student/all')
      .set('Authorization', `Bearer ${firstStudentLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 1)
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
      .set('Authorization', 'Bearer invalid token')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('All courses can be fetched without token', async () => {
    const response = await api
      .get('/courses/all')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialCourses.length)
  })
})