//! ALL BUSINESS LOGIC
const mongoose = require("mongoose");
const UserModel = require("../models/usersModel");
const AdminSchema = require("../models/adminModel");
const PromptSchema = require("../models/promptModel");
const PostSchema = require("../models/postModel");
const MessageSchema = require("../models/messageModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");
const { request } = require("express");
const path = require("path");
const {uploadToS3} = require('../utils/s3Upload');
module.exports = {
  // validate req.body - Done
  // create MongoDB UserModel - Done
  // do password encrytion - Done
  // save data to mongodb -
  // return response to the client

  //! REGISTER OPERATION
  registerUser: async (req, res) => {
    try {
      // Check if email already exists
      const existingUser = await UserModel.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // If email doesn't exist, proceed to create the user
      const userModel = new UserModel(req.body);
      userModel.password = await bcrypt.hash(req.body.password, 10); // Hash the password

      const response = await userModel.save(); // Save the user
      response.password = undefined; // Exclude password from response

      return res.status(201).json({ message: "success", data: response });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  },
  // check user using email
  // compare password
  // create jwt token
  // send response to client
  loginUser: async (req, res) => {
    try {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Auth failed, Invalid username/password" });
      }

      const isPassEqual = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPassEqual) {
        return res
          .status(401)
          .json({ message: "Auth failed, Invalid username/password" });
      }
      const tokenObject = {
        _id: user._id,
        username: user.username,
        email: user.email,
      };
      const jwtToken = jwt.sign(tokenObject, process.env.SECRET, {
        expiresIn: "4h",
      });
      return res.status(200).json({ jwtToken, tokenObject });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  },

  //Get All Users
  getUsers: async (req, res) => {
    try {
      const users = await UserModel.find(
        {},
        { password: 0, confirm_password: 0 }
      );
      return res.status(200).json({ data: users });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  },

  // Register Admin
  registerAdmin: async (req, res) => {
    const adminModel = new AdminSchema(req.body);
    adminModel.password = await bcrypt.hash(req.body.password, 10);
    try {
      const response = await adminModel.save();
      response.password = undefined;
      return res.status(201).json({ message: "success", data: response });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  },

  //UPDATE USERS
  updateUsers: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await UserModel.findByIdAndUpdate(id, req.body);

      if (!updatedUser) {
        return res.status(404).json({ message: "Not Found" });
      }

      const user = await UserModel.findById(id).select({
        password: 0,
        confirm_password: 0,
      });

      return res.status(200).json({ data: user });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //LOGIN ADMIN
  loginAdmin: async (req, res) => {
    try {
      const admin = await AdminSchema.findOne({ email: req.body.email });
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Auth failed, Invalid Credentials" });
      }

      const isPassEqual = await bcrypt.compare(
        req.body.password,
        admin.password
      );

      if (!isPassEqual) {
        return res
          .status(401)
          .json({ message: "Auth Failed, Invalid Credentials" });
      }

      const tokenObject = {
        _id: admin._id,
        firstName: admin.firstName,
        email: admin.email,
      };

      const jwtToken = jwt.sign(tokenObject, process.env.SECRET, {
        expiresIn: "4h",
      });
      return res.status(200).json({ jwtToken, tokenObject });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  },

  // GET ALL ADMINS
  getAdmin: async (req, res) => {
    try {
      const admin = await adminModel.find({}, { password: 0 });
      return res.status(200).json({ data: admin });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  },

  // FORGET PASSWORD
  forgetPassword: async (req, res) => {
    //first check if user exists in database
    try {
      const adminExist = await adminModel.findOne({ email: req.body.email });
      const user = await UserModel.findOne({ email: req.body.email });

      if (!adminExist && !user) {
        return res
          .status(401)
          .json({ message: "Provided email Does not Exist" });
      }
      //update the password
      if (user) {
        user.password = await bcrypt.hash(req.body.password, 10);
        const response = await user.save();
        response.password = undefined;
        return res
          .status(201)
          .json({ message: "user password reset success", data: response });
      }

      if (adminExist) {
        adminExist.password = await bcrypt.hash(req.body.password, 10);
        const response = await adminExist.save();
        response.password = undefined;
        return res
          .status(201)
          .json({ message: "admin password reset success", data: response });
      }
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  // GET ADMIN BY ID
  getAdminById: async (req, res) => {
    try {
      const admin = await adminModel
        .findOne({
          _id: new Object(req.params.id),
        })
        .select({ password: 0 });
      // console.log("adminId", admin);
      return res.status(200).json({ data: admin });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  // GET USER BY ID
  getUserById: async (req, res) => {
    try {
      const user = await UserModel.findOne({
        _id: new Object(req.params.id),
      }).select({ password: 0 });
      // console.log("adminId", admin);
      return res.status(200).json({ data: user });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  // DELETE USERS / ADMINS
  deleteUser: async (req, res) => {
    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid ID format",
        error: {
          value: req.params.id,
          reason: "Must be a valid ObjectId",
        },
      });
    }
    try {
      // const { id } = req.params;
      // console.log("deleteUser", req.params.id);
      const user = await UserModel.findByIdAndDelete(req.params.id);
      // console.log("user", user);
      const admin = await adminModel.findByIdAndDelete({
        _id: new Object(req.params.id),
      });
      // console.log("admin", admin);
      if (user == null && admin == null) {
        return res.status(401).json({ message: "Id Not found" });
      }
      return res.status(201).json({ message: "Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  // ADD QUESTIONS - PROMPT
  addPromptQuestions: async (req, res) => {
    const prompt = new PromptSchema(req.body);
    try {
      const response = await prompt.save();
      return res.status(201).json({ message: "success", data: response });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //GET ALL QUESTIONS
  getPromptQuestions: async (req, res) => {
    try {
      const ques = await PromptSchema.find({});
      return res.status(200).json({ message: ques });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  // DELETE MULTIPLE QUESTION
  deleteQuestion: async (req, res) => {
    const { ids } = req.body; // Expecting an array of user IDs

    // Basic validation
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Invalid request, please provide an array of ques. IDs",
      });
    }

    try {
      const result = await PromptSchema.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "No questions found to delete" });
      }

      return res.status(200).json({
        message: `${result.deletedCount} questions deleted successfully`,
      });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //CREATE POST
  //!! i have to add validations and security vernabilities for the apis

  createPost: async (req, res) => {
    try {
      // Ensure the user is authenticated and the user ID is available
      if (!req.user || !req.user._id) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User ID is missing" });
      }

      const { content } = req.body;

      // Check if files are present in the request
      const image = req.files ? req.files.image : null; // Assuming image is sent as 'image'
      const video = req.files ? req.files.video : null; // Assuming video is sent as 'video'

      if (!content && !image && !video) {
        return res
          .status(400)
          .json({ message: "Either content, image, or video is required" });
      }

      let imageUrl = null;
      let videoUrl = null;

      if(image){
        imageUrl = await uploadToS3(image[0], 'postImages');
      }

      if(video){
        videoUrl = await uploadToS3(video[0], 'postVideos');
      }

      // Create a new post object with the authenticated user's ID
      const newPost = new PostSchema({
        content,
        image: imageUrl,
        video: videoUrl,
        createdBy: req.user._id,
      })
      // const newPost = new PostSchema({
      //   content,
      //   image: image ? `/uploads/postImages/${image[0].filename}` : null, // Store the image path if present
      //   video: video ? `/uploads/postVideos/${video[0].filename}` : null, // Store the video path if present
      //   createdBy: req.user._id, // Assuming req.user contains the authenticated user ID
      // });

      // Save the post to the database
      const savedPost = await newPost.save();

      // Find the user and push the new post's ID into their posts array
      const user = await UserModel.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.posts.push(savedPost._id); // Push the post ID into the user's posts array
      await user.save();

      // Construct the image and video URLs based on where they're hosted
      // const postWithMediaUrls = {
      //   ...savedPost.toObject(),
      //   image: image
      //     ? `${req.protocol}://backendapifunclub.yourwebstore.org.in/uploads/postImages/${image[0].filename}`
      //     : null,
      //   video: video
      //     ? `${req.protocol}://backendapifunclub.yourwebstore.org.in/uploads/postVideos/${video[0].filename}`
      //     : null,
      // };

      // Return the success response with the saved post, image, and video URLs
      return res.status(201).json({
        message: "Post created successfully",
        data: savedPost,
      });
    } catch (error) {
      // Handle any errors (e.g., database errors)
      console.error("Error creating post:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while creating the post", error });
    }
  },

  // GET ALL POSTS BY USER:_ID

  getPostsByUserId: async (req, res) => {
    try {
      const userId = req.params.id;
      // Validate if the user exists
      const user = await UserModel.findOne({
        _id: new Object(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find all posts created by the user
      const posts = await PostSchema.find({
        createdBy: userId, // Filter by user ID
      })
        .populate("createdBy", "username email profileImage") // Populate creator's info if needed
        .populate("comments.createdBy", "username role profileImage") // Populate comment user details
        .populate("comments.replies.createdBy", "username role profileImage") // Populate reply user details
        .exec();

      // If no posts are found, return an empty array
      if (!posts.length) {
        return res
          .status(200)
          .json({ message: "No posts found for this user", data: [] });
      }

      // Return the list of posts
      return res.status(200).json({ message: "success", data: posts });
    } catch (error) {
      console.error("Error fetching posts by user:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching posts", error });
    }
  },

  // LIKE POST
  likePost: async (req, res) => {
    try {
      const post = await PostSchema.findOne({
        _id: new Object(req.params.id),
      });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Ensure the 'likes' field is an array
      if (!Array.isArray(post.likes)) {
        post.likes = []; // Initialize it as an empty array if not present
      }
      // Convert ObjectIds in the likes array to strings for comparison
      const likesArrayAsStrings = post.likes.map((like) => like.toString());

      //if the user haven't liked post before , then like the post of the user
      if (!likesArrayAsStrings.includes(req.user._id.toString())) {
        post?.likes?.push(req.user._id); // Add the user's ID to the 'likes' array
        await post.save(); // Save the updated post in the database
      }
      return res.status(200).json({ data: post });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //SAVE POST
  savePost: async (req, res) => {
    try {
      const post = await PostSchema.findOne({
        _id: new Object(req.params.id),
      });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      // Ensure the 'likes' field is an array
      if (!Array.isArray(post.saves)) {
        post.saves = []; // Initialize it as an empty array if not present
      }
      const saveArrayAsStrings = post.saves.map((save) => save.toString());

      // //if the user haven't seved post before , then save the post of the user
      if (!saveArrayAsStrings.includes(req.user._id.toString())) {
        // console.log("User added to likes");
        post?.saves?.push(req.user._id);
        await post.save();
      }
      return res.status(200).json({ data: post });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //ADD COMMENTS TO POSTS
  // REF - POST: /posts/:postId/comments
  addComment: async (req, res) => {
    try {
      const { postId } = req.params;
      const { commentText } = req.body;
      const userId = req.user._id; // Token authentication

      // Validate commentText
      if (!commentText) {
        return res.status(400).json({ message: "Comment text is required" });
      }

      const post = await PostSchema.findOne({
        _id: new Object(postId),
      });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Add comment to the post
      const newComment = { commentText, createdBy: userId };
      post.comments.push(newComment);
      await post.save();

      return res.status(200).json({ message: "Comment added", post });
    } catch (error) {
      return res.status(500).json({ message: "error", error: error });
    }
  },

  //REPLIES ON COMMENTS - POSTS
  // POST: /posts/:postId/comments/:commentId/replies
  addReply: async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const { replyText } = req.body;
      const userId = req.user._id;

      // Validate replyText
      if (!replyText) {
        return res.status(400).json({ message: "Reply text is required" });
      }

      const post = await PostSchema.findOne({
        _id: new Object(postId),
      });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      // console.log("comment reply", post);
      // Find the comment to reply to
      const comment = post.comments.find((c) => c._id.toString() === commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Add reply to the comment
      const newReply = { replyText, createdBy: userId };
      comment.replies.push(newReply);
      await post.save();

      return res.status(200).json({ message: "Reply added", post });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  },

  //GET POSTS FROM FLOWWED USERS
  followingPosts: async (req, res) => {
    try {
      const user = await UserModel.findOne({
        _id: new Object(req.user._id),
      }).populate("following");
      // console.log("user", user.following);
      const followingPosts = await PostSchema.findOne({
        createdBy: {
          $in: user.following.map((followingId) => new Object(followingId)),
        },
      });
      // console.log("followingPosts", followingPosts);
      return res.status(200).json({ data: followingPosts });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  deletePost: async (req, res) => {
    //Check if the Id is valid?
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid Id Format",
        error: {
          value: req.params.id,
          reason: "Must be a valid ObjectId",
        },
      });
    }
    try {
      const post = await PostSchema.findByIdAndDelete({
        _id: new Object(req.params.id),
      });
      if (!post) {
        return res.status(401).json({ message: "Id Not Found" });
      }

      // Remove postId from the user's post list
      await UserModel.updateOne(
        { _id: post.createdBy }, // Assuming post.createdBy is the user who created the post
        { $pull: { posts: req.params.id } } // Remove post ID from user's posts array
      );

      return res.status(201).json({ message: "Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //FOLLOW
  followUser: async (req, res) => {
    try {
      const currentUserId = req.user._id; // Get the logged-in user's ID from auth middleware
      const targetUserId = req.params.id; // Get the target user's ID from route params

      // Check if the user is trying to follow themselves
      if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "You can't follow yourself" });
      }

      // Find the logged-in user
      const currentUser = await UserModel.findOne(
        {
          _id: new Object(req.user._id),
        },
        { password: 0, confirm_password: 0 }
      );
      const targetUser = await UserModel.findOne(
        {
          _id: new Object(req.params.id),
        },
        { password: 0, confirm_password: 0 }
      );

      // Check if both users exist
      if (!currentUser || !targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const userArrayAsString = currentUser.following.map((user) =>
        user.toString()
      );

      // Add the target user to the following array if not already followed
      if (!userArrayAsString.includes(targetUserId.toString())) {
        currentUser.following.push(targetUserId);
        await currentUser.save();
      }
      const userTarArrayAsString = targetUser.followers.map((user) =>
        user.toString()
      );

      // Add the current user to the target user's followers array if not already a follower
      if (!userTarArrayAsString.includes(currentUserId.toString())) {
        targetUser.followers.push(currentUserId);
        await targetUser.save();
      }
      return res.status(200).json({
        message: "User followed successfully",
        currentUser,
        targetUser,
      });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //UNFOLLOW
  unfollowUser: async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const targetUserId = req.params.id;

      // Check if the user is trying to unfollow themselves
      if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "You can't unfollow yourself" });
      }

      // Find the logged-in user and the target user
      const currentUser = await UserModel.findOne(
        {
          _id: new Object(req.user._id),
        },
        { password: 0, confirm_password: 0 }
      );
      const targetUser = await UserModel.findOne(
        {
          _id: new Object(req.params.id),
        },
        { password: 0, confirm_password: 0 }
      );

      if (!currentUser || !targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove the target user from the following array
      currentUser.following = currentUser.following.filter(
        (followingId) => followingId.toString() !== targetUserId
      );
      await currentUser.save();

      // Remove the current user from the target user's followers array
      targetUser.followers = targetUser.followers.filter(
        (followerId) => followerId.toString() !== currentUserId
      );
      await targetUser.save();
      return res.status(200).json({
        message: "User Unfollowed successfully",
        currentUser,
        targetUser,
      });
    } catch (error) {
      return res.status(500).json({ message: "error", error });
    }
  },

  //CHAT HISTORY
  getChatHistory: async (req, res) => {
    try {
      const { token, userId2 } = req.body;
      // console.log("userId2", userId2);
      // console.log("userId1", req.user._id);

      const userId = req.user._id;
      // Validate if the user exists
      const user = await UserModel.findOne({
        _id: new Object(req.user._id),
      });

      // console.log("user found", user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const Chats = await MessageSchema.find({
        $or: [
          { from: req.user._id, to: userId2 },
          { from: userId2, to: req.user._id },
        ],
      }).sort({ timestamp: 1 });

      return res
        .status(201)
        .json({ message: "Chat Fetched successfully", data: Chats });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred while fetching the chats", error });
    }
  },

  // SEARCH USERS
  search: async (req, res) => {
    const { query } = req.query;
    try {
      let searchQuery = {};

      // Build the search query dynamically
      if (query) {
        searchQuery = {
          $or: [
            { username: { $regex: query, $options: "i" } }, // Case-insensitive search for username
          ],
        };
      }

      const users = await UserModel.find(searchQuery)
        .select("username role email bio profileImage followers following") // Return only the fields you need
        .exec();

      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
};
