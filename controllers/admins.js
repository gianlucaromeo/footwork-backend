const adminsRouter = require('express').Router()
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const Admin = require('../models/admin')

const findAdmin = async (id) => {
  return await Admin.findOne({ where: { id: id } })
}

adminsRouter.get('/', async (req, res) => {
  const userId = req.userId
  const admin = await findAdmin(userId)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const admins = await Admin.findAll()
  res.status(200).json(admins)
})

adminsRouter.post('/', async (req, res) => {
  const admin = req.body

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
  return res.status(201).json(newAdmin)
})

adminsRouter.delete('/:id', async (req, res) => {
  const userId = req.userId
  const admin = await findAdmin(userId)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const id = req.params.id

  if (!(id.toString() === userId.toString())) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const deleted = await Admin.destroy({ where: { id: id } })
  if (deleted) {
    return res.status(204).end()
  } else {
    return res.status(404).json({ error: 'Admin not found' })
  }
})

adminsRouter.put('/:id', async (req, res) => {
  const adminId = req.userId
  const admin = await findAdmin(adminId)

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (admin.id.toString() !== req.params.id.toString()) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const updatedAdmin = req.body
  await Admin.update(updatedAdmin, { where: { id: req.params.id } })
  return res.status(200).end()
})

module.exports = adminsRouter