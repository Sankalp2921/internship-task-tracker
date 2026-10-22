const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const attendancePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPEG, PNG, and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

module.exports = attendancePhotoUpload;