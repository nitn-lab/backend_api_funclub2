const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  commentText: { type: String, required: true }, // Text of the comment
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to the user who made the comment
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the comment was created
  replies: [
    {
      replyText: { type: String, required: true }, // Text of the reply
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }, // User who replied
      createdAt: { type: Date, default: Date.now }, // Timestamp for the reply
    },
  ], // Array of replies
});

const PostSchema = new mongoose.Schema({
  content: { type: String }, // Text content of the post
  image: { type: String }, // URL for the image
  video: { type: String }, // URL for the video
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to user who created the post
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users who liked the post
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users who saved the post
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the post was created
});

module.exports = mongoose.model("Post", PostSchema);
