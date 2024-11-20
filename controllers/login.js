const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const Student = require('../models/student')
const Admin = require('../models/admin')
const { isEmail } = require('validator')

function createToken(payload) {
  return jwt.sign(
    payload,
    process.env.SECRET,
    { expiresIn: 48 * 60 * 60 }  // 48 hours
  )
}

// General login handler
async function loginUser(roleModel, request, response) {
  const { email, password } = request.body

  if (!email || !password) {
    return response.status(400).json({
      error: 'Both email and password are required'
    })
  } else if (!isEmail(email)) {
    return response.status(400).json({
      error: 'Email is not valid'
    })
  }

  const user = await roleModel.findOne({
    where: { email }
  })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid email or password'
    })
  }

  // Note: Both Admin and Student models have an emailConfirmed field
  if (!user.emailConfirmed) {
    return response.status(400).json({
      error: 'Please confirm your email before logging in'
    })
  }

  const payload = {
    email: user.email,
    id: user.id,
    role: roleModel.name.toLowerCase(),
  }

  const token = createToken(payload)

  response
    .status(200)
    .send({
      token,
      email: user.email,
      role: roleModel.name.toLowerCase(),
      id: user.id,
      firstName: user.firstName
    })
}

// Admin login
loginRouter.post('/admin', (request, response) => {
  loginUser(Admin, request, response)
})

// Student login
loginRouter.post('/student', (request, response) => {
  loginUser(Student, request, response)
})

module.exports = loginRouter