require('dotenv').config()

const PORT = process.env.PORT

// TODO: Change the MYSQL_INFO object to use the environment variables
const MYSQL_INFO = {
  host: process.env.MYSQL_HOST_DEV,
  user: process.env.MYSQL_USER_DEV,
  password: process.env.MYSQL_PASSWORD_DEV,
  database: process.env.MYSQL_DATABASE_DEV,
  port: process.env.MYSQL_PORT_DEV
}

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