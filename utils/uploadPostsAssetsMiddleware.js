const multer = require('multer');
const path = require('path');

// // Multer storage and configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Check if the file is an image or a video and store in the appropriate folder
//     if (file.mimetype.startsWith("image")) {
//       cb(null, 'uploads/postImages'); // Store images in 'uploads/images'
//     } else if (file.mimetype.startsWith("video")) {
//       cb(null, 'uploads/postVideos'); // Store videos in 'uploads/videos'
//     } else {
//       cb(new Error('Invalid file type'), false); // Handle unsupported file types
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname)); // Create a unique filename
//   }
// });
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
