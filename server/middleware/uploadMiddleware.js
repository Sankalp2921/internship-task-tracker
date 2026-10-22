
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB per file
    files: 5, // Maximum 5 files per request
  },
});

module.exports = upload;
