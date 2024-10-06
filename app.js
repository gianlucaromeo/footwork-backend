const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const { sequelize } = require('./db/db')
const studentsRouter = require('./controllers/students')
const loginRouter = require('./controllers/login')
const adminsRouter = require('./controllers/admins')

// First middlewares setup
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// MySQL connection
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

// Routers setup
app.use('/students', studentsRouter)
app.use('/admins', adminsRouter)
app.use('/login', loginRouter)

// Last middlewares setup
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
