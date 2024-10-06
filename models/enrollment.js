const { sequelize } = require('../db/db')

// Enrollment has:
//
// - student_id: Integer, PK, Not Null, FK (references students.id)
// - course_id:  Integer, PK, Not Null, FK (references courses.id)
// - created_at: Timestamp, Not Null
// - updated_at: Timestamp, Not Null
const Enrollment = sequelize.define('enrollment', {}, {
  tableName: 'enrollments',
})

module.exports = Enrollment