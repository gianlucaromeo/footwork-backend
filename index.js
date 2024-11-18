const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

if (process.env.NODE_ENV !== 'production') {
  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
  })
}