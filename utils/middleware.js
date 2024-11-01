const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error)

  // TODO Add error handling for different errors
  if (error.name === 'SequelizeValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Invalid token' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
    request.token = null
  }

  next()
}

const userIdExtractor = (request, response, next) => {
  if (request.token) {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const userId = decodedToken.id
    request.userId = userId
  } else {
    request.userId = null
  }

  next()
}

const userRoleExtractor = (request, response, next) => {
  if (request.token) {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const userRole = decodedToken.role
    request.userRole = userRole
  } else {
    request.userRole = null
  }

  next()
}

const tokenExpirationChecker = (request, response, next) => {
  if (request.token) {
    try {
      const decodedToken = jwt.decode(request.token)
      if (decodedToken && decodedToken.exp) {
        const expirationTime = decodedToken.exp
        const currentTime = Math.floor(Date.now() / 1000)
        if (currentTime > expirationTime) {
          return response.status(401).json({ error: 'Token expired' })
        }
      } else {
        return response.status(401).json({ error: 'Invalid token' })
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return response.status(401).json({ error: 'Error' })
    }
  }

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userIdExtractor,
  userRoleExtractor,
  tokenExpirationChecker
}