const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const { sequelize } = require('./db/db')
const studentsRouter = require('./controllers/students')
const loginRouter = require('./controllers/login')
const adminsRouter = require('./controllers/admins')
const coursesRouter = require('./controllers/courses')
const enrollmentsRouter = require('./controllers/enrollments')
const choreographiesRouter = require('./controllers/choreographies')
const videosRouter = require('./controllers/videos')
const emailsRouter = require('./controllers/emails')

// Relationships
const Student = require('./models/student')
const Course = require('./models/course')
const Enrollment = require('./models/enrollment')
const Choreography = require('./models/choreography')
const Video = require('./models/video')

Course.belongsToMany(Student, {
  through: Enrollment,
  foreignKey: 'courseId',
})

Student.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'studentId'
})

Course.hasMany(Choreography, {
  foreignKey: 'courseId'
})

Choreography.belongsTo(Course, {
  foreignKey: 'courseId'
})

Choreography.hasMany(Video, {
  foreignKey: 'choreographyId'
})

Video.belongsTo(Choreography, {
  foreignKey: 'choreographyId'
})

// First middlewares setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://footwork-frontend.onrender.com'
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // If using cookies or authentication headers
}

app.use(cors(corsOptions))
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(middleware.tokenExpirationChecker)
app.use(middleware.userIdExtractor)
app.use(middleware.userRoleExtractor)
app.use(middleware.requestLogger)

// MySQL connection
sequelize.authenticate()
  .then(() => {
    sequelize.sync()
      .then(() => console.log('Database synced'))
      .catch((err) => console.error('Unable to sync database:', err))
    console.log('Connected to MySQL')
  })
  .catch((err) => {
    console.error('Unable to connect to MySQL:', err)
  })

// Routers setup
app.use('/students', studentsRouter)
app.use('/admins', adminsRouter)
app.use('/login', loginRouter)
app.use('/courses', coursesRouter)
app.use('/enrollments', enrollmentsRouter)
app.use('/choreographies', choreographiesRouter)
app.use('/videos', videosRouter)
app.use('/emails', emailsRouter)

// Last middlewares setup
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
