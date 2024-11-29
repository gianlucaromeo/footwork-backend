const coursesRouter = require('express').Router()
const { uploadFileToS3 } = require('../utils/s3Upload')
const multer = require('multer')
const Admin = require('../models/admin')
const Student = require('../models/student')
const Course = require('../models/course')
const Video = require('../models/video')
const Choreography = require('../models/choreography')

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

const findStudent = async (id) => {
  return await Student.findOne({ where: { id: id } })
}

coursesRouter.get('/all', async (req, res) => {
  const courses = await Course.findAll()
  return res.json(courses)
})

const upload = multer({ storage: multer.memoryStorage() })

coursesRouter.post('/', upload.single('coverImage'), async (req, res) => {
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
    return res.status(400).json({ error: 'Course name is required' })
  }

  const coverImage = req.file
  if (!coverImage) {
    return res.status(400).json({ error: 'Cover image is required' })
  }

  try {
    const folder = req.body.folder || '/all'
    const coverImageRasponse = await uploadFileToS3(coverImage, folder)

    course.imageUrl = coverImageRasponse.Location
    delete course.coverImage

    if (!course.imageUrl) {
      return res.status(400).json({ error: 'Error uploading cover image' })
    }

    const newCourse = await Course.create(course)
    return res.status(201).json(newCourse)
  } catch (error) {
    console.log('error uploading files', error)
    return res.status(400).json({ error: 'Error uploading files' })
  }
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

  // Query only the course data
  const courses = await Course.findAll({
    attributes: ['id', 'name', 'imageUrl'], // Specify only the required fields
    include: {
      model: Student,
      where: { id: studentId },
      attributes: [], // Exclude student fields
    },
  })

  return res.json(courses)
})

coursesRouter.put('/:id', upload.single('coverImage'), async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const course = await Course.findOne({ where: { id: req.params.id } })
  if (!course) {
    return res.status(400).json({ error: 'Course not found' })
  }

  const newCourse = req.body

  if (req.file) {
    const coverImage = req.file
    const folder = req.body.folder || '/all'
    const coverImageRasponse = await uploadFileToS3(coverImage, folder)

    delete newCourse.coverImage

    newCourse.imageUrl = coverImageRasponse.Location

    if (!newCourse.imageUrl) {
      return res.status(400).json({ error: 'Error uploading cover image' })
    }
  }

  await Course.update(newCourse, { where: { id: req.params.id } })
  return res.status(200).end()
})

coursesRouter.delete('/:id', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // First find all the choreographies associated with the course
  const choreographies = await Choreography.findAll({ where: {
    courseId: req.params.id
  } })

  // Delete all the videos associated with the choreographies
  for (const choreography of choreographies) {
    await Video.destroy({ where: { choreographyId: choreography.id } })
  }

  // Delete all the choreographies associated with the course
  await Choreography.destroy({ where: { courseId: req.params.id } })

  // Delete the course
  const deleted = await Course.destroy({ where: { id: req.params.id } })

  if (deleted) {
    return res.status(204).end()
  } else {
    return res.status(404).json({ error: 'Course not found' })
  }
})

module.exports = coursesRouter