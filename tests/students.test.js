const { test, beforeEach } = require('node:test')
const assert = require('assert')
const helper = require('./tests_helper')

const Student = require('../models/student')

const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)


beforeEach(async () => {
  await Student.destroy({ where: {} })

  await Promise.all(
    helper.initialStudents.map(student =>
      api.post('/students')
        .send(student)
        .expect(201)
    )
  )
})

test('all students are returned as json', async () => {
  await api
    .get('/students')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const students = await Student.findAll()
  assert.strictEqual(students.length, helper.initialStudents.length)
})