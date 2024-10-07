const { sequelize } = require('../db/db')
const Student = require('./student')
const Course = require('./course')

// Enrollment has:
//
// - student_id: Integer, PK, Not Null, FK (references students.id)
// - course_id:  Integer, PK, Not Null, FK (references courses.id)
// - created_at: Timestamp, Not Null
// - updated_at: Timestamp, Not Null
const Enrollment = sequelize.define('enrollment', {
  studentId: {
    type: sequelize.Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Student,
      key: 'id',
    },
  },
  courseId: {
    type: sequelize.Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Course,
      key: 'id',
    },
  }
}, {
  tableName: 'enrollments',
  underscored: true,
})

module.exports = Enrollment