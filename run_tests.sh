#!/bin/bash

# Run each test sequentially
npm run test -- tests/students.test.js &&
npm run test -- tests/admins.test.js &&
npm run test -- tests/enrollments.test.js &&
npm run test -- tests/courses.test.js &&
npm run test -- tests/students.test.js &&
npm run test -- tests/videos.test.js