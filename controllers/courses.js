const coursesRouter = require('express').Router()
const { uploadFileToS3 } = require('../utils/s3Upload')
const multer = require('multer')
const Admin = require('../models/admin')
const Student = require('../models/student')
const Course = require('../models/course')

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

  const courses = await Course.findAll({
    include: {
      model: Student,
      where: { id: studentId },
    }
  })

  return res.json(courses)
})

module.exports = coursesRouter