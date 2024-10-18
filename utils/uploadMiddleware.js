const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

// Multer configuration for file uploads with file type and size validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
});

module.exports = upload;
