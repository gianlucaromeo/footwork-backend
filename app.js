const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const { sequelize } = require('./db/db')
const studentsRouter = require('./controllers/students')

// Middleware setup
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// Connect to MySQL
sequelize.authenticate()
  .then(() => {
    sequelize.sync()
      .then(() => console.log('Database synced'))
      .catch((err) => console.error('Unable to sync database:', err))
    console.log('Connected to MySQL')
  })
  .catch((err) => {
    console.error('Unable to connect to MySQL:', err)
  })

// TODO add routers here
app.use('/students', studentsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// Export the app
module.exports = app
