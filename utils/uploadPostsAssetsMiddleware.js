const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
// File filter to validate image and video file types
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Set limit to 50MB for videos
  fileFilter: (req, file, cb) => {
    const imageFileTypes = /jpeg|jpg|png/;
    const videoFileTypes = /mp4|mov|avi/;
    const mimetypeImage = imageFileTypes.test(file.mimetype);
    const mimetypeVideo = videoFileTypes.test(file.mimetype);
    const extnameImage = imageFileTypes.test(path.extname(file.originalname).toLowerCase());
    const extnameVideo = videoFileTypes.test(path.extname(file.originalname).toLowerCase());

    // Allow only images or videos
    if ((mimetypeImage && extnameImage) || (mimetypeVideo && extnameVideo)) {
      cb(null, true);
    } else {
      cb(new Error('Only images or videos are allowed!')); // Handle invalid file type
    }
  }
});

module.exports = upload;
