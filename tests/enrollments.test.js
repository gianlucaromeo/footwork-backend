const { beforeEach, after, describe, test } = require('node:test')
const assert = require('assert')
const { sequelize } = require('../db/db')
const helper = require('./tests_helper')

const app = require('../app')
const supertest = require('supertest')
const Enrollment = require('../models/enrollment')
const api = supertest(app)

let firstAdminLoggedIn = null
let initialEnrollments = null

beforeEach(async () => {
  const dbData = await helper.initizliaseDatabase()
  initialEnrollments = dbData.initialEnrollments
  firstAdminLoggedIn = dbData.firstAdminLoggedIn
})

after(() => {
  sequelize.close()
})

describe('when there are initially some enrollments', () => {
  test('an admin can retrieve all the enrollments', async () => {
    const response = await api
      .get('/enrollments')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialEnrollments.length)
  })

  test('an admin can create a new enrollment', async () => {
    const students = await api
      .get('/students')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const courses = await api
      .get('/courses')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newEnrollment = {
      studentId: students.body[0].id,
      courseId: courses.body[1].id
    }

    const response = await api
      .post('/enrollments')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .send(newEnrollment)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.studentId, newEnrollment.studentId)
    assert.strictEqual(response.body.courseId, newEnrollment.courseId)

    const enrollments = await Enrollment.findAll({ where: {} })

    assert.strictEqual(enrollments.length, initialEnrollments.length + 1)
  })
})

