const { beforeEach, after, describe, test } = require('node:test')
const assert = require('assert')
const { sequelize } = require('../db/db')
const helper = require('./helper')

const Choreography = require('../models/choreography')
const Course = require('../models/course')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

beforeEach(async () => {
  await helper.initializeDatabase()
})

after(() => {
  sequelize.close()
})

describe('when there are initially some choreographies', () => {
  test('an admin can retrieve all the choreographies', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/choreographies/admin/all')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      response.body.length,
      helper.initialChoreographies.length
    )
  })

  test('an admin can create a new choreography', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const courses = await Course.findAll({ where: {} })

    const fs = require('fs')
    const path = require('path')
    const coverImagePath = path.join(__dirname, 'test-cover.png')
    const coverImageFile = fs.readFileSync(coverImagePath)

    const newChoreography = {
      title: 'New Choreography',
      courseId: courses[0].id,
      coverImage: coverImageFile,
    }

    const response = await api
      .post('/choreographies')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .field('title', newChoreography.title)
      .field('courseId', newChoreography.courseId)
      .field('folder', '/tests')
      .attach('coverImage', coverImagePath)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.title, newChoreography.title)

    // Fix: courseId is returned as a String even though it is an Integer
    assert.strictEqual(
      response.body.courseId,
      newChoreography.courseId.toString()
    )

    const choreographies = await Choreography.findAll({})
    assert.strictEqual(choreographies.length, helper.initialChoreographies.length + 1)
  })
})

