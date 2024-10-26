const initialStudents = [
  {
    'firstName': 'Student 1',
    'lastName': 'Last Name 1',
    'email': 'student1@1.com',
    'password': 'Password1'
  },
  {
    'firstName': 'Student 2',
    'lastName': 'Last Name 2',
    'email': 'student2@2.com',
    'password': 'Password2'
  }
]

const initialAdmins = [
  {
    'firstName': 'Admin 1',
    'lastName': 'Last Name 1',
    'email': 'admin1@1.com',
    'password': 'Password1'
  },
  {
    'firstName': 'Admin 2',
    'lastName': 'Last Name 2',
    'email': 'admin2@2.com',
    'password': 'Password2'
  }
]

const initialCourses = [
  {
    'name': 'Course 1',
    'imageUrl': 'https://example.com/image.jpg',
  },
  {
    'name': 'Course 2',
    'imageUrl': 'https://example.com/image.jpg',
  }
]

const initizliaseDatabase = async () => {
  const Admin = require('../models/admin')
  const Student = require('../models/student')
  const Course = require('../models/course')
  const Enrollment = require('../models/enrollment')
  const Choreography = require('../models/choreography')
  const Video = require('../models/video')

  await Enrollment.destroy({ where: {} })
  await Video.destroy({ where: {} })
  await Choreography.destroy({ where: {} })
  await Course.destroy({ where: {} })
  await Student.destroy({ where: {} })
  await Admin.destroy({ where: {} })

  const app = require('../app')
  const supertest = require('supertest')
  const api = supertest(app)

  let firstAdminLoggedIn = null
  let firstStudentLoggedIn = null
  let secondStudentLoggedIn = null
  let firstCourse = null
  let secondCourse = null

  await Promise.all(
    initialAdmins.map(admin =>
      api.post('/admins')
        .send(admin)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    )
  )

  const adminLoginResponse = await api
    .post('/login/admin')
    .send({
      email: initialAdmins[0].email,
      password: initialAdmins[0].password
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  firstAdminLoggedIn = adminLoginResponse.body

  await Promise.all(
    initialCourses.map(course =>
      api.post('/courses')
        .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
        .send(course)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    )
  )

  const allCoursesResponse = await api
    .get('/courses/admin/all').
    set('Authorization', `Bearer ${firstAdminLoggedIn.token}`).
    expect(200).
    expect('Content-Type', /application\/json/)

  firstCourse = allCoursesResponse.body[0]
  secondCourse = allCoursesResponse.body[1]

  await Promise.all(
    initialStudents.map(student =>
      api.post('/students')
        .send({
          student: student,
          courses: [firstCourse.id],
        })
        .expect(201)
    )
  )

  const firstStudentLoggedInRepsonse = await api
    .post('/login/student')
    .send({
      email: initialStudents[0].email,
      password: initialStudents[0].password
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  firstStudentLoggedIn = firstStudentLoggedInRepsonse.body

  const secondStudentLoggedInRepsonse = await api
    .post('/login/student')
    .send({
      email: initialStudents[1].email,
      password: initialStudents[1].password
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  secondStudentLoggedIn = secondStudentLoggedInRepsonse.body

  const firstEnrollment = {
    studentId: firstStudentLoggedIn.id,
    courseId: firstCourse.id
  }

  const secondEnrollment = {
    studentId: secondStudentLoggedIn.id,
    courseId: firstCourse.id
  }

  const initialEnrollments = [
    firstEnrollment,
    secondEnrollment
  ]

  const newChoreography = {
    title: 'Choreography 1',
    courseId: firstCourse.id,
    imageUrl: 'https://example.com/image.jpg'
  }

  const coreographiesResponse = await api
    .post('/choreographies')
    .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
    .send(newChoreography)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const firstChoreography = coreographiesResponse.body

  const initialChoreographies = [
    firstChoreography
  ]

  const path = require('path')
  const fs = require('fs')
  const videoFilePath = path.join(__dirname, 'test-video.mp4')
  const coverImagePath = path.join(__dirname, 'test-cover.png')
  const videoFile = fs.readFileSync(videoFilePath)
  const coverImageFile = fs.readFileSync(coverImagePath)

  const newVideo = {
    title: 'Video 1',
    choreographyId: coreographiesResponse.body.id,
  }

  const videosResponse = await api
    .post('/videos')
    .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
    .field('title', newVideo.title)
    .field('choreographyId', newVideo.choreographyId)
    .field('folder', '/tests')
    .attach('video', videoFile, { contentType: 'video/mp4', filename: 'test-video.mp4' })
    .attach('coverImage', coverImageFile, { contentType: 'image/png', filename: 'test-cover.png' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const firstVideo = videosResponse.body

  const initialVideos = [
    firstVideo
  ]

  return {
    firstAdminLoggedIn,
    firstStudentLoggedIn,
    secondStudentLoggedIn,
    firstCourse,
    secondCourse,
    initialEnrollments,
    initialChoreographies,
    initialVideos
  }
}

module.exports = {
  initialStudents,
  initialAdmins,
  initialCourses,
  initizliaseDatabase
}