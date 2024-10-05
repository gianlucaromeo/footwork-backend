const { Sequelize } = require('sequelize')
const config = require('../utils/config')

// TODO Change to initialize based on environment variables
const sequelize = new Sequelize(
  config.MYSQL_INFO.database,
  config.MYSQL_INFO.user,
  config.MYSQL_INFO.password, {
    host: config.MYSQL_INFO.host,
    dialect: 'mysql'
  })

module.exports = { sequelize }