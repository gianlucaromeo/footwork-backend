const { DataTypes } = require('sequelize')
const { sequelize } = require('../db/db')

// Student has:
//
// - id: Integer, PK, Not Null, Auto Increment // Sequelize will add this
//
// - first_name: String, Not Null
// - last_name: String, Not Null
// - email: String, Not Null
// - email_confirmed: Boolean, Default False
// - password_hash: String, Not Null
// - created_at: Date, Not Null, Default Current Timestamp
// - updated_at: Date, Null
// - verified_by_admin: Boolean, Default False
const Student = sequelize.define('student', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 255]
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verifiedByAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  tableName: 'students',
})

Student.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())
  delete values.passwordHash
  return values
}

module.exports = Student