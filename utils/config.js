require('dotenv').config()

const PORT = process.env.PORT

function getMySQLInfo() {
  if (process.env.NODE_ENV === 'development') {
    return {
      host: process.env.MYSQL_HOST_DEV,
      user: process.env.MYSQL_USER_DEV,
      password: process.env.MYSQL_PASSWORD_DEV,
      database: process.env.MYSQL_DATABASE_DEV,
      port: process.env.MYSQL_PORT_DEV,
    }
  } else if (process.env.NODE_ENV === 'test') {
    return {
      host: process.env.MYSQL_HOST_TEST,
      user: process.env.MYSQL_USER_TEST,
      password: process.env.MYSQL_PASSWORD_TEST,
      database: process.env.MYSQL_DATABASE_TEST,
      port: process.env.MYSQL_PORT_TEST,
    }
  } else if (process.env.NODE_ENV === 'production') {
    return {
      host: process.env.MYSQL_HOST_PROD,
      user: process.env.MYSQL_USER_PROD,
      password: process.env.MYSQL_PASSWORD_PROD,
      database: process.env.MYSQL_DATABASE_PROD,
      port: process.env.MYSQL_PORT_PROD,
    }
  } else {
    throw new Error('Environment not set')
  }
}


// TODO: Change the MYSQL_INFO object to use the environment variables
const MYSQL_INFO = getMySQLInfo()

console.log('MYSQL_INFO:', MYSQL_INFO)

const AWS_INFO = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
}

module.exports = {
  PORT,
  MYSQL_INFO,
  AWS_INFO
}