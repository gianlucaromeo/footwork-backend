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
let initialChoreographies = null

beforeEach(async () => {
  const dbData = await helper.initizliaseDatabase()
  firstAdminLoggedIn = dbData.firstAdminLoggedIn
  firstStudentLoggedIn = dbData.firstStudentLoggedIn
  initialVideos = dbData.initialVideos
  secondStudentLoggedIn = dbData.secondStudentLoggedIn
  initialChoreographies = dbData.initialChoreographies
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

    assert(secondStudentVideosResponse.body.length === 1)
  })
})

const path = require('path')
const fs = require('fs')

describe('Video Upload API', () => {
  test('an admin can upload a video and cover image', async () => {
    const videoFilePath = path.join(__dirname, 'test-video.mp4')
    const coverImagePath = path.join(__dirname, 'test-cover.png')
    const videoFile = fs.readFileSync(videoFilePath)
    const coverImageFile = fs.readFileSync(coverImagePath)

    const response = await api
      .post('/videos')
      .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
      .field('title', 'Test Video')
      .field('choreographyId', initialChoreographies[0].id)
      .field('folder', '/tests')
      .attach('video', videoFile, { contentType: 'video/mp4', filename: 'test-video.mp4' })
      .attach('coverImage', coverImageFile, { contentType: 'image/png', filename: 'test-cover.png' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert(response.body.title === 'Test Video')
    assert(response.body.coverImageUrl !== undefined)
    assert(response.body.videoUrl !== undefined)
  })
})