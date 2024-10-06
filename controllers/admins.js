const adminsRouter = require('express').Router()
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const logger = require('../utils/logger')
const Admin = require('../models/admin')

adminsRouter.get('/', async (req, res) => {
  // TODO Only admins should be able to access this endpoint
  const admins = await Admin.findAll()
  res.status(200).json(admins)
})

adminsRouter.post('/', async (req, res) => {
  const admin = req.body
  logger.info('Received request to create new admin:', admin)

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(admin.password, saltRounds)
  admin.passwordHash = passwordHash
  delete admin.password

  if (!admin.firstName) {
    return res.status(400).json({ error: 'First name is required' })
  } else if (!admin.lastName) {
    return res.status(400).json({ error: 'Last name is required' })
  } else if (!admin.email) {
    return res.status(400).json({ error: 'Email is required' })
  } else if (!isEmail(admin.email)) {
    return res.status(400).json({ error: 'Email is not valid' })
  }

  const newAdmin = await Admin.create(admin)
  logger.info('admin created:', newAdmin)
  return res.status(201).json(newAdmin)
})

module.exports = adminsRouter