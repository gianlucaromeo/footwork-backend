const studentsRouter = require('express').Router()
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const Student = require('../models/student')
const Admin = require('../models/admin')

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

studentsRouter.get('/', async (req, res) => {
  const adminId = req.userId
  const admin = findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const students = await Student.findAll()
  res.status(200).json(students)
})

studentsRouter.post('/', async (req, res) => {
  const student = req.body

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

  const newStudent = await Student.create(student)
  return res.status(201).json(newStudent)
})

module.exports = studentsRouter