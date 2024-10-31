const { beforeEach, after, describe, test } = require('node:test')
const assert = require('assert')
const { sequelize } = require('../db/db')
const helper = require('./helper')

const Student = require('../models/student')
const Course = require('../models/course')

const app = require('../app')
const supertest = require('supertest')
const Enrollment = require('../models/enrollment')
const api = supertest(app)

beforeEach(async () => {
  await helper.initializeDatabase()
})

after(() => {
  sequelize.close()
})

describe('when there are initially some enrollments', () => {
  test('an admin can retrieve all the enrollments', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    const response = await api
      .get('/enrollments')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialEnrollments.length)
  })

  test('an admin can create a new enrollment', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInRepsonse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)

    const students = await Student.findAll({ where: {} })
    const courses = await Course.findAll({ where: {} })

    const newEnrollment = {
      studentId: students[0].id,
      courseId: courses[1].id,
    }

    const response = await api
      .post('/enrollments')
      .set('Authorization', `Bearer ${firstAdminLoggedInRepsonse.body.token}`)
      .send(newEnrollment)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.studentId, newEnrollment.studentId)
    assert.strictEqual(response.body.courseId, newEnrollment.courseId)

    const enrollments = await Enrollment.findAll({})
    assert.strictEqual(enrollments.length, helper.initialEnrollments.length + 1)
  })
})

