const { Sequelize } = require('sequelize')
const config = require('../utils/config')

// TODO Change to initialize based on environment variables
const sequelize = new Sequelize(
  config.MYSQL_INFO.database,
  config.MYSQL_INFO.user,
  config.MYSQL_INFO.password, {
    host: config.MYSQL_INFO.host,
    dialect: 'mysql',
    define: {
      underscored: true
    },
    logging: false
  })

// Initialize AWS
const AWS = require('aws-sdk')

AWS.config.update(config.AWS_INFO)
const s3 = new AWS.S3()

module.exports = { sequelize, s3 }