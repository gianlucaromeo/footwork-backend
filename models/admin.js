const { DataTypes } = require('sequelize')
const { sequelize } = require('../db/db')

// Admin has:
//
// - id: Integer, PK, Not Null, Auto Increment // Sequelize will add this
//
// - first_name: String, Not Null
// - last_name: String, Not Null
// - email: String, Not Null, Unique
// - email_confirmed: Boolean, Default False
// - password_hash: String, Not Null
// - created_at: Date, Not Null, Default Current Timestamp
// - updated_at: Date, Null
const Admin = sequelize.define('admin', {
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
  }
}, {
  tableName: 'admins',
})

Admin.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())
  delete values.passwordHash
  return values
}

module.exports = Admin