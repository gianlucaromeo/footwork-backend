const videosRouter = require('express').Router()

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
    const videos = await Video.findAll()
    //console.log('videos', videos)
    res.status(200).json(videos)
  } catch (error) {
    console.log('error getting videos', error)
    return res.status(400).json({ error: 'Error getting videos' })
  }
})

videosRouter.post('/', async (req, res) => {
  //console.log('requested to create a video')
  const userId = req.userId
  const admin = await findAdmin(userId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.userRole !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const video = req.body

  if (!video.title) {
    return res.status(400).json({ error: 'Title is required' })
  } else if (!video.choreographyId) {
    return res.status(400).json({ error: 'Choreography ID is required' })
  }

  // TODO Add read video and image
  // TODO Generate real urls for images and video with AWS S3
  video.videoUrl = 'https://www.youtube.com/watch?v=6JYIGclVQdw'
  video.coverImageUrl = 'https://www.youtube.com/watch?v=6JYIGclVQdw'

  const newVideo = await Video.create(video)
  return res.status(201).json(newVideo)
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
        attributes: []
      }
    })
    res.status(200).json(videos)
  } catch (error) {
    console.log('error getting videos', error)
    return res.status(400).json({ error: 'Error getting videos' })
  }
})

module.exports = videosRouter