const { s3 } = require('../db/db')

const uploadFileToS3 = (file, folder) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  }

  return s3.upload(params).promise()
}

module.exports = { uploadFileToS3 }
