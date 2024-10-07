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
  },
  {
    'name': 'Course 2',
  }
]

const initizliaseDatabase = async () => {
  const Admin = require('../models/admin')
  const Student = require('../models/student')
  const Course = require('../models/course')
  const Enrollment = require('../models/enrollment')
  const Choreography = require('../models/choreography')

  await Enrollment.destroy({ where: {} })
  await Choreography.destroy({ where: {} })
  await Course.destroy({ where: {} })
  await Student.destroy({ where: {} })
  await Admin.destroy({ where: {} })

  const app = require('../app')
  const supertest = require('supertest')
  const api = supertest(app)

  let firstAdminLoggedIn = null
  let firstStudentLoggedIn = null
  let firstCourse = null

  await Promise.all(
    initialAdmins.map(admin =>
      api.post('/admins')
        .send(admin)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    )
  )


  await Promise.all(
    initialStudents.map(student =>
      api.post('/students')
        .send(student)
        .expect(201)
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

  const firstStudentLoggedInRepsonse = await api
    .post('/login/student')
    .send({
      email: initialStudents[0].email,
      password: initialStudents[0].password
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  firstStudentLoggedIn = firstStudentLoggedInRepsonse.body


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

  const firstEnrollment = {
    studentId: firstStudentLoggedIn.id,
    courseId: firstCourse.id
  }

  await api
    .post('/enrollments')
    .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
    .send(firstEnrollment)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const initialEnrollments = [
    firstEnrollment,
  ]

  const newChoreography = {
    title: 'Choreography 1',
    courseId: firstCourse.id
  }

  await api
    .post('/choreographies')
    .set('Authorization', `Bearer ${firstAdminLoggedIn.token}`)
    .send(newChoreography)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const initialChoreographies = [
    newChoreography
  ]

  return {
    firstAdminLoggedIn,
    firstStudentLoggedIn,
    firstCourse,
    initialEnrollments,
    initialChoreographies
  }
}

module.exports = {
  initialStudents,
  initialAdmins,
  initialCourses,
  initizliaseDatabase
}