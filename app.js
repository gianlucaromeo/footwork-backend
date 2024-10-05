const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const logger = require('./utils/logger')
const mysql = require('mysql2/promise')

// Connect to MySQL database
mysql.createConnection(config.MYSQL_INFO)
  .then((connection) => {
    logger.info('Connected to MySQL database')
    connection.end()
  })
  .catch((error) => {
    logger.error('Error connecting to MySQL database:', error)
    process.exit(1)
  })

// Middleware setup
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// TODO add routers here

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// Export the app
module.exports = app
