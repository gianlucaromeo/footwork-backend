const studentsRouter = require('express').Router()
const { isEmail } = require('validator')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const Student = require('../models/student')
const Admin = require('../models/admin')
const Enrollment = require('../models/enrollment')
const Course = require('../models/course')
const { sendEmail } = require('../utils/emailSender')


const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

const findStudent = async (id) => {
  return await Student.findOne({ where: { id: id } })
}

studentsRouter.get('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const students = await Student.findAll()
  res.status(200).json(students)
})

studentsRouter.post('/', async (req, res) => {
  const student = req.body.student

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(student.password, saltRounds)
  student.passwordHash = passwordHash
  delete student.password

  if (!student.firstName) {
    return res.status(400).json({ error: 'First name is required' })
  } else if (!student.lastName) {
    return res.status(400).json({ error: 'Last name is required' })
  } else if (!student.email) {
    return res.status(400).json({ error: 'Email is required' })
  } else if (!isEmail(student.email)) {
    return res.status(400).json({ error: 'Email is not valid' })
  }

  const courses = req.body.courses

  if (courses) {
    for (const courseId of courses) {
      const course = await Course.findOne({ where: { id: courseId } })
      if (!course) {
        return res.status(400).json({ error: 'One or more courses not found' })
      }
    }
  }

  // TODO | Convert to transaction:
  // create token > create student > create enrollments > send email
  const registrationToken = uuidv4()
  student.registrationToken = registrationToken
  const newStudent = await Student.create(student)

  for (const courseId of courses) {
    await Enrollment.create({
      studentId: newStudent.id,
      courseId: courseId,
    })
  }

  // TODO | Change to production URL
  const verifyEmailUrl = `http://localhost:3001/emails/verifyEmail/${registrationToken}`

  sendEmail(
    newStudent.email,
    'Registration successful - Verify your email!',
    `Hi ${newStudent.firstName}! Welcome to our dance school!\nClick here to verify your e-mail: ${verifyEmailUrl}`
  )

  return res.status(201).json(newStudent)
})

studentsRouter.delete('/:id', async (req, res) => {
  const studentId = req.userId
  const student = await findStudent(studentId)

  if (!student) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (student.id.toString() !== req.params.id.toString()) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  await Student.destroy({ where: { id: req.params.id } })
  return res.status(204).end()
})

studentsRouter.put('/:id', async (req, res) => {
  const studentId = req.userId
  const student = await findStudent(studentId)

  if (!student) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (student.id.toString() !== req.params.id.toString()) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const updatedStudent = req.body
  await Student.update(updatedStudent, { where: { id: req.params.id } })
  return res.status(200).end()
})

module.exports = studentsRouter