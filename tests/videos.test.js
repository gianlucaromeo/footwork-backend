const { describe, test, beforeEach, after } = require('node:test')
const assert = require('assert')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const helper = require('./helper')

const { sequelize } = require('../db/db')

beforeEach(async () => {
  await helper.initializeDatabase()
})

after(async () => {
  await sequelize.close()
})

describe('When there are initially some videos saved', () => {
  test('an admin can get all videos', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/videos/admin/all')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.length === helper.initialVideos.length)
  })

  test('a student can get all the videos of the courses they are enrolled in', async () => {
    const firstStudent = helper.initialStudents[0]

    const firstStudentLoggedInResponse = await api
      .post('/login/student')
      .send({ email: firstStudent.email, password: firstStudent.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/videos/student/all')
      .set('Authorization', `Bearer ${firstStudentLoggedInResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.length === 1)
  })
})

describe('Video Upload API', () => {
  test('an admin can upload a video and cover image', async () => {
    const firstAdmin = helper.initialAdmins[0]

    const firstAdminLoggedInResponse = await api
      .post('/login/admin')
      .send({ email: firstAdmin.email, password: firstAdmin.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const path = require('path')
    const fs = require('fs')

    const videoFilePath = path.join(__dirname, 'test-video.mp4')
    const coverImagePath = path.join(__dirname, 'test-cover.png')
    const videoFile = fs.readFileSync(videoFilePath)
    const coverImageFile = fs.readFileSync(coverImagePath)

    const response = await api
      .post('/videos')
      .set('Authorization', `Bearer ${firstAdminLoggedInResponse.body.token}`)
      .field('title', 'Test Video')
      .field('choreographyId', helper.initialChoreographies[0].id)
      .field('folder', '/tests')
      .attach('video', videoFile, {
        contentType: 'video/mp4',
        filename: 'test-video.mp4',
      })
      .attach('coverImage', coverImageFile, {
        contentType: 'image/png',
        filename: 'test-cover.png',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert(response.body.title === 'Test Video')
    assert(response.body.coverImageUrl !== undefined)
    assert(response.body.videoUrl !== undefined)
  })
})