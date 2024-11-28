const choreographiesRouter = require('express').Router()
const { uploadFileToS3 } = require('../utils/s3Upload')
const multer = require('multer')
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

const upload = multer({ storage: multer.memoryStorage() })

choreographiesRouter.post('/', upload.single('coverImage'), async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const choreography = req.body

  if (!choreography.title) {
    return res.status(400).json({ error: 'Choreography title is required' })
  }

  if (!choreography.courseId) {
    return res.status(400).json({ error: 'Course ID is required' })
  }

  const course = await findCourse(req.body.courseId)

  if (!course) {
    return res.status(400).json({ error: 'Course not found' })
  }

  const coverImage = req.file
  if (!coverImage) {
    return res.status(400).json({ error: 'Cover image is required' })
  }

  try {
    const folder = req.body.folder || '/all'
    const coverImageRasponse = await uploadFileToS3(coverImage, folder)
    choreography.imageUrl = coverImageRasponse.Location
    delete choreography.coverImage

    if (!choreography.imageUrl) {
      return res.status(400).json({ error: 'Error uploading cover image' })
    }

    const newChoreography = await Choreography.create(choreography)

    // Fix: courseId is returned as a String even though it is an Integer
    return res.status(201).json(newChoreography)
  } catch (error) {
    console.log('error uploading files', error)
    return res.status(400).json({ error: 'Error uploading files' })
  }
})

choreographiesRouter.put(
  '/:id',
  upload.single('coverImage'),
  async (req, res) => {
    const adminId = req.userId
    const admin = await findAdmin(adminId)

    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.userRole !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const choreography = await Choreography.findOne({
      where: { id: req.params.id },
    })

    if (!choreography) {
      return res.status(400).json({ error: 'Choreography not found' })
    }

    const newChoreography = req.body

    if (req.file) {
      const coverImage = req.file
      const folder = req.body.folder || '/all'
      const coverImageRasponse = await uploadFileToS3(coverImage, folder)
      delete newChoreography.coverImage
      newChoreography.imageUrl = coverImageRasponse.Location

      if (!newChoreography.imageUrl) {
        return res.status(400).json({ error: 'Error uploading cover image' })
      }
    }

    await Choreography.update(newChoreography, {
      where: { id: req.params.id },
    })

    return res.status(200).end()
  }
)

module.exports = choreographiesRouter