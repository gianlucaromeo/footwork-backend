const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')

const middleware = require('./utils/middleware')

// const config = require('./utils/config')
// const logger = require('./utils/logger')
// TODO Add MySQL connection here and check connection

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// TODO add routers here

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app