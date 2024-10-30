const testImageUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'

const testVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

const initialCourses = [
  {
    id: 1,
    name: 'Course 1',
    imageUrl: testImageUrl,
  },
  {
    id: 2,
    name: 'Course 2',
    imageUrl: testImageUrl,
  },
]

const initialStudents = [
  {
    id: 1,
    firstName: 'First Name 1',
    lastName: 'Last Name 1',
    email: 'student@1.com',
    emailConfirmed: true,
    registrationToken: '123456789',
    password: 'Password1?',
    verifiedByAdmin: true,
  },
  {
    id: 2,
    firstName: 'First Name 2',
    lastName: 'Last Name 2',
    email: 'student@2.com',
    emailConfirmed: true,
    registrationToken: '987654321',
    password: 'Password2?',
    verifiedByAdmin: true,
  }
]

const initialEnrollments = [
  {
    studentId: 1,
    courseId: 1,
  },
  {
    studentId: 2,
    courseId: 2,
  }
]

const initialChoreographies = [
  {
    id: 1,
    title: 'Choreography 1',
    imageUrl: testImageUrl,
    courseId: 1,
  },
  {
    id: 2,
    title: 'Choreography 2',
    imageUrl: testImageUrl,
    courseId: 2,
  }
]

const initialVideos = [
  {
    id: 1,
    coverImageUrl: testImageUrl,
    videoUrl: testVideoUrl,
    title: 'Video 1',
    choreographyId: 1,
  },
  {
    id: 2,
    coverImageUrl: testImageUrl,
    videoUrl: testVideoUrl,
    title: 'Video 2',
    choreographyId: 2,
  }
]

const initialAdmins = [
  {
    id: 1,
    firstName: 'Admin 1',
    lastName: 'Last Name 1',
    email: 'admin@1.com',
    emailConfirmed: true,
    registrationToken: '123456789',
    password: 'Password1?',
  },
  {
    id: 2,
    firstName: 'Admin 2',
    lastName: 'Last Name 2',
    email: 'admin@2.com',
    emailConfirmed: true,
    registrationToken: '987654321',
    password: 'Password2?',
  }
]

const initializeDatabase = async () => {
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

  const bcrypt = require('bcrypt')
  const saltRounds = 10

  // Create admins
  await Promise.all(initialAdmins.map(async admin => {
    const passwordHash = await bcrypt.hash(admin.password, saltRounds)
    admin.passwordHash = passwordHash
    await Admin.create(admin)
  }))

  // Create courses
  await Course.bulkCreate(initialCourses)

  // Create students
  await Promise.all(initialStudents.map(async student => {
    const passwordHash = await bcrypt.hash(student.password, saltRounds)
    student.passwordHash = passwordHash
    await Student.create(student)
  }))

  // Create enrollments
  await Enrollment.bulkCreate(initialEnrollments)

  // Create choreographies
  await Choreography.bulkCreate(initialChoreographies)

  // Create videos
  await Video.bulkCreate(initialVideos)
}

module.exports = {
  initializeDatabase,
  initialCourses,
  initialStudents,
  initialAdmins,
  testImageUrl,
  testVideoUrl,
  initialEnrollments,
  initialChoreographies,
  initialVideos,
}