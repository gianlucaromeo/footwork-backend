const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const { sequelize } = require('../db/db')
const Course = require('../models/course')
const helper = require('./tests_helper')


let firstAdminLoggedIn = null

beforeEach(async () => {
  const users = await helper.initizliaseDatabase()
  firstAdminLoggedIn = users.firstAdminLoggedIn
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
})