const enrollmentsRouter = require('express').Router()
const Admin = require('../models/admin')
const Student = require('../models/student')
const Course = require('../models/course')
const Enrollment = require('../models/enrollment')

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

const findStudent = async (id) => {
  return await Student.findOne({ where: { id: id } })
}

const findCourse = async (id) => {
  return await Course.findOne({ where: { id: id } })
}

enrollmentsRouter.get('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const enrollments = await Enrollment.findAll()
  return res.json(enrollments)
})

enrollmentsRouter.post('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const student = await findStudent(req.body.studentId)
  const course = await findCourse(req.body.courseId)

  if (!student || !course) {
    return res.status(400).json({ error: 'Student or course not found' })
  }

  if (!course.name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const existingEnrollment = await Enrollment.findOne({
    where: {
      studentId: student.id,
      courseId: course.id,
    },
  })

  if (existingEnrollment) {
    console.log('Enrollment already exists')
    return res.status(400).json({ error: 'Enrollment already exists' })
  }

  const enrollment = await Enrollment.create({
    studentId: student.id,
    courseId: course.id,
  })

  return res.status(201).json(enrollment)
})

enrollmentsRouter.delete('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const studentId = req.body.studentId
  const courseId = req.body.courseId

  if (!studentId || !courseId) {
    return res.status(400).json({ error:
      'Both studentId and courseId are required'
    })
  }

  const enrollment = await Enrollment.findOne({ where: {
    studentId: studentId,
    courseId: courseId,
  } })

  if (!enrollment) {
    return res.status(400).json({ error: 'Enrollment not found' })
  }

  await Enrollment.destroy({ where: {
    studentId: studentId,
    courseId: courseId,
  } })
  return res.status(204).end()
})

module.exports = enrollmentsRouter