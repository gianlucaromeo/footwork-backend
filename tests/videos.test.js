const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const helper = require('./tests_helper')

const { sequelize } = require('../db/db')

let firstAdminLoggedIn = null
let firstStudentLoggedIn = null
let secondStudentLoggedIn = null
let initialVideos = null

beforeEach(async () => {
  const dbData = await helper.initizliaseDatabase()
  firstAdminLoggedIn = dbData.firstAdminLoggedIn
  firstStudentLoggedIn = dbData.firstStudentLoggedIn
  initialVideos = dbData.initialVideos
  secondStudentLoggedIn = dbData.secondStudentLoggedIn
})

after(async () => {
  await sequelize.close()
})

describe('When there are initially some videos saved', () => {
  test('an admin can get all videos', async () => {
    const response = await api
      .get('/videos/admin/all')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.length === initialVideos.length)
  })

  test('a student can get all the videos of the courses they are enrolled in', async () => {
    const response = await api
      .get('/videos/student/all')
      .set('Authorization', `Bearer ${firstStudentLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.length === 1)

    const secondStudentVideosResponse = await api
      .get('/videos/student/all')
      .set('Authorization', `Bearer ${secondStudentLoggedIn.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(secondStudentVideosResponse.body.length === 0)
  })
})