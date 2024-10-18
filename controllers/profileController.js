const path = require("path");
const UserModel = require("../models/usersModel");
// Controller to handle profile image upload
exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  // Generate URL to access the uploaded file
  const imageUrl = `${req.protocol}://backendapifunclub.yourwebstore.org.in/uploads/profileImages/${req.file.filename}`;

  // Update user's profile image
  user.profileImage = imageUrl;

  // Save updated user to the database
  await user.save();
  res.status(200).json({ message: "Image uploaded successfully", imageUrl });
};
