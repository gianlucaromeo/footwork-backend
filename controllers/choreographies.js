const choreographiesRouter = require('express').Router()
const Admin = require('../models/admin')
const Course = require('../models/course')
const Choreography = require('../models/choreography')


const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

const findCourse = async (id) => {
  return await Course.findOne({ where: { id: id } })
}

choreographiesRouter.get('/admin/all', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const choreographies = await Choreography.findAll()
  return res.json(choreographies)
})

choreographiesRouter.post('/', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!req.body.title || !req.body.courseId) {
    return res.status(400).json({ error: 'Title and courseId are required' })
  }

  if (!req.body.imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' })
  }

  const course = await findCourse(req.body.courseId)

  if (!course) {
    return res.status(400).json({ error: 'Course not found' })
  }

  const newChoreographyData = {
    title: req.body.title,
    courseId: req.body.courseId,
    imageUrl: req.body.imageUrl
  }

  const newChoreography = await Choreography.create(newChoreographyData)

  return res.status(201).json(newChoreography)
})

module.exports = choreographiesRouter