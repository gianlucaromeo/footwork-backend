const { DataTypes } = require('sequelize')
const { sequelize } = require('../db/db')

// A video has:
//
// - id: Integer, PK, Not Null, Auto Increment // Sequelize will add this
//
// - title: String, Not Null
// - video_url: String, Not Null
// - cover_image_url: String, Not Null
// - choreography_id: Integer, FK, Not Null
// - created_at: Date, Not Null
// - updated_at: Date, Not Null
const Video = sequelize.define('video', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
  coverImageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
  choreographyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'videos',
  underscored: true,
})

module.exports = Video