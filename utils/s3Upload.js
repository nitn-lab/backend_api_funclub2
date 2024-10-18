const AWS = require("aws-sdk");

console.log(
  "keys",
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY,
  process.env.AWS_REGION
);
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Utility function to upload file to S3
const uploadToS3 = async (file, folder) => {
  const fileExtension = file.originalname.split(".").pop().toLowerCase(); // Get the file extension
  let contentType;

  // Set ContentType based on file extension
  if (["jpg", "jpeg"].includes(fileExtension)) {
    contentType = "image/jpeg";
  } else if (fileExtension === "png") {
    contentType = "image/png";
  } else if (["mp4", "mov", "avi"].includes(fileExtension)) {
    contentType = "video/mp4"; // Default to mp4 for videos; adjust as needed for other formats
  } else {
    throw new Error("Unsupported file type");
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${Date.now()}_${file.originalname}`, // Unique filename
    Body: file.buffer, // File content from Multer
    ContentType: contentType,
    // ACL: 'public-read', // File permissions
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the file URL
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// Export the function for use in other files
module.exports = { uploadToS3 };
