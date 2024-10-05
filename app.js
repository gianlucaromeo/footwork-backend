const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const { sequelize } = require('./db/db')

// Middleware setup
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// Connect to MySQL
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL')
  })
  .catch((err) => {
    console.error('Unable to connect to MySQL:', err)
  })

// TODO add routers here

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// Export the app
module.exports = app
