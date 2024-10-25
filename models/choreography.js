const { DataTypes } = require('sequelize')
const { sequelize } = require('../db/db')

// Choreography has:
//
// - id: Integer, PK, Not Null, Auto Increment // Sequelize will add this
//
// - title: String, Not Null
// - course_id: Integer, FK, Not Null
// - image_url: String, Not Null
// - created_at: Date, Not Null, Default: Current Date
// - updated_at: Date, Not Null, Default: Current Date
const Choreography = sequelize.define('choreography', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
  courseId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
}, {
  tableName: 'choreographies',
  underscored: true,
})

module.exports = Choreography