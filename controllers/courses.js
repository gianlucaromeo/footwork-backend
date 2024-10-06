const coursesRouter = require('express').Router()
const Admin = require('../models/admin')
const Course = require('../models/course')

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

coursesRouter.post('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const course = req.body

  if (!course.name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const newCourse = await Course.create(course)
  return res.status(201).json(newCourse)
})

module.exports = coursesRouter