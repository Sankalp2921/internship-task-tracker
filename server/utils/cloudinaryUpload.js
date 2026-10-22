const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "internship-task-tracker",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

module.exports = uploadToCloudinary;