const { beforeEach, after, describe, test } = require('node:test')
const assert = require('assert')
const { sequelize } = require('../db/db')
const helper = require('./tests_helper')

const Choreography = require('../models/choreography')
const Course = require('../models/course')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

let firstAdminLoggedIn = null
let initialChoreographies = null

beforeEach(async () => {
  const dbData = await helper.initizliaseDatabase()
  firstAdminLoggedIn = dbData.firstAdminLoggedIn
  initialChoreographies = dbData.initialChoreographies
})

after(() => {
  sequelize.close()
})

describe('when there are initially some choreographies', () => {
  test('an admin can retrieve all the choreographies', async () => {
    const response = await api
      .get('/choreographies/admin/all')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      response.body.length,
      initialChoreographies.length
    )
  })

  test('an admin can create a new choreography', async () => {
    const courses = await Course.findAll({ where: {} })

    const newChoreography = {
      title: 'New Choreography',
      courseId: courses[0].id,
      imageUrl: 'https://example.com/image.jpg',
    }

    const response = await api
      .post('/choreographies')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .send(newChoreography)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.title, newChoreography.title)
    assert.strictEqual(response.body.courseId, newChoreography.courseId)

    const choreographies = await Choreography.findAll()
    assert.strictEqual(choreographies.length, initialChoreographies.length + 1)
  })
})

