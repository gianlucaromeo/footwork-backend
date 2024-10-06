const jwt = require('jsonwebtoken')
const bycrypt = require('bcrypt')
const loginRouter = require('express').Router()
const Student = require('../models/student')
const { isEmail } = require('validator')


// TODO Add a route to handle login requests for admins

loginRouter.post('/student', async (request, response) => {
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

  const student = await Student.findOne({ email })

  const passwordCorrect = student === null
    ? false
    : await bycrypt.compare(password, student.passwordHash)

  if (!(student && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid email or password'
    })
  }

  const payload = {
    email: student.email,
    id: student._id
  }

  // Token expires in 48*60*60 seconds, that is, in 48 hours
  const token = jwt.sign(
    payload,
    process.env.SECRET,
    { expiresIn: 48*60*60 }
  )

  response
    .status(200)
    .send({ token, email: student.email, name: student.name })
})

module.exports = loginRouter