const videosRouter = require('express').Router()

const { uploadFileToS3 } = require('../utils/s3Upload')
const multer = require('multer')

const Student = require('../models/student')
const Admin = require('../models/admin')
const Choreography = require('../models/choreography')
const Video = require('../models/video')
const Enrollment = require('../models/enrollment')

const findStudent = async (id) => {
  return await Student.findOne({ where: { id: id } })
}

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

videosRouter.get('/admin/all', async (req, res) => {
  //console.log('requested to get all videos')
  const userId = req.userId
  const admin = await findAdmin(userId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  //console.log('getting all videos')
  try {
    const videos = await Video.findAll({
      include: {
        model: Choreography,
        attributes: [ 'id', 'title', 'courseId', 'imageUrl' ]
      }
    })
    //console.log('videos', videos)
    res.status(200).json(videos)
  } catch (error) {
    console.log('error getting videos', error)
    return res.status(400).json({ error: 'Error getting videos' })
  }
})

const upload = multer({ storage: multer.memoryStorage() })

videosRouter.post('/', upload.fields([{ name: 'coverImage' }, { name: 'video' }]),  async (req, res) => {

  const userId = req.userId
  const admin = await findAdmin(userId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { title, choreographyId } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  } else if (!choreographyId) {
    return res.status(400).json({ error: 'Choreography ID is required' })
  }

  // Use req.files because we are using upload.fields from multer
  const coverImage = req.files['coverImage'][0]
  const video = req.files['video'][0]

  if (!coverImage) {
    return res.status(400).json({ error: 'Cover image is required' })
  } else if (!video) {
    return res.status(400).json({ error: 'Video is required' })
  }

  try {
    const folder = req.body.folder || '/all'
    const coverImageResponse = await uploadFileToS3(coverImage, folder)
    const videoResponse = await uploadFileToS3(video, folder)

    const coverImageUrl = coverImageResponse.Location
    const videoUrl = videoResponse.Location

    const newVideo = await Video.create({
      title,
      coverImageUrl,
      videoUrl,
      choreographyId
    })

    res.status(201).json(newVideo)
  } catch (error) {
    console.log('error uploading files', error)
    return res.status(400).json({ error: 'Error uploading files' })
  }
})

videosRouter.get('/student/all', async (req, res) => {
  const userId = req.userId
  const student = await findStudent(userId)

  if (!student) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'student') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const enrollments = await Enrollment.findAll({
      where: { studentId: userId },
      attributes: ['courseId']
    })

    const coursesIds = enrollments.map(e => e.courseId)

    const videos = await Video.findAll({
      include: {
        model: Choreography,
        where: { courseId: coursesIds },
        attributes: [ 'id', 'title', 'courseId', 'imageUrl' ]
      }
    })
    res.status(200).json(videos)
  } catch (error) {
    console.log('error getting videos', error)
    return res.status(400).json({ error: 'Error getting videos' })
  }
})

videosRouter.delete('/:id', async (req, res) => {
  const userId = req.userId
  const admin = await findAdmin(userId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const videoId = req.params.id

  const video = await Video.findOne({ where: { id: videoId } })

  if (!video) {
    return res.status(404).json({ error: 'Video not found' })
  }

  await video.destroy()

  return res.status(204).end()
})

module.exports = videosRouter