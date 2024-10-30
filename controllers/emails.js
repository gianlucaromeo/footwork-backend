const emailsRouter = require('express').Router()
const Student = require('../models/student')
const Admin = require('../models/admin')
const { sendEmail } = require('../utils/emailSender')


emailsRouter.get('/verifyEmail/:registrationToken', async (req, res) => {
  const token = req.params.registrationToken
  const student = await Student.findOne({ where: { registrationToken: token } })

  if (!student) {
    return res.status(400).json({ error: 'Invalid registration token' })
  }

  if (student.emailConfirmed) {
    return res.status(400).json({ error: 'Email already confirmed' })
  }

  student.emailConfirmed = true
  await student.save()

  // TODO | Change with the actual website URL
  const websiteUrl = 'http:localhost:3001/login'

  sendEmail(
    student.email,
    'All Set! Welcome to our dance school!',
    `Hi ${student.firstName}! Your email has been successfully confirmed. You can now log in at ${websiteUrl} and browse videos for your courses!`
  )

  res.status(200).json(student)
})

emailsRouter.get('/verifyEmail/admin/:registrationToken', async (req, res) => {
  const token = req.params.registrationToken
  const admin = await Admin.findOne({ where: { registrationToken: token } })

  if (!admin) {
    return res.status(400).json({ error: 'Invalid registration token' })
  }

  if (admin.emailConfirmed) {
    return res.status(400).json({ error: 'Email already confirmed' })
  }

  admin.emailConfirmed = true
  await admin.save()

  // TODO | Change with the actual website URL
  const websiteUrl = 'http:localhost:3001/login'

  sendEmail(
    admin.email,
    'All set, teacher!',
    `Hi ${admin.firstName}! Your email has been successfully confirmed. You can now log in at ${websiteUrl} and manage courses!`
  )

  res.status(200).json(admin)
})

module.exports = emailsRouter