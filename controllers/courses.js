const coursesRouter = require('express').Router()
const Admin = require('../models/admin')
const Student = require('../models/student')
const Course = require('../models/course')

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

const findStudent = async (id) => {
  return await Student.findOne({ where: { id: id } })
}

coursesRouter.get('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const courses = await Course.findAll()
  return res.json(courses)
})

coursesRouter.post('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const course = req.body

  if (!course.name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const newCourse = await Course.create(course)
  return res.status(201).json(newCourse)
})

coursesRouter.get('/student/all', async (req, res) => {
  const studentId = req.userId
  const student = await findStudent(studentId)

  if (!student) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const courses = await Course.findAll({
    include: {
      model: Student,
      where: { id: studentId },
    }
  })

  return res.json(courses)
})

module.exports = coursesRouter