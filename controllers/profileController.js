const path = require("path");
const UserModel = require("../models/usersModel");
const { uploadToS3 } = require("../utils/s3Upload");
// Controller to handle profile image upload
exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const image = req.files ? req.files.image : null;
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  // Generate URL to access the uploaded file
  try {
    // Use the existing uploadToS3 function for profile image upload
    const profileImage = await uploadToS3(req.file, "profileImages"); // You can specify a folder for profile images

    // Update user's profile image
    user.profileImage = profileImage;

    // Save updated user to the database
    await user.save();
    res
      .status(200)
      .json({ message: "Image uploaded successfully", profileImage });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return res.status(500).json({ error: "Error uploading profile image" });
  }
};
