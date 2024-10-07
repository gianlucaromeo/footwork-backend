const { DataTypes } = require('sequelize')
const { sequelize } = require('../db/db')

// Course has:
//
// - id: Integer, PK, Not Null, Auto Increment // Sequelize will add this
//
// - name: String, Not Null
const Course = sequelize.define('course', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
}, {
  tableName: 'courses',
  underscored: true,
})

Course.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())
  delete values.students
  return values
}

module.exports = Course