const mongoose = require("mongoose");

// Define the schema for user registration
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      // required: true,
      // unique: true,
      // trim: true,
      // maxlength: 50
    },
    email: {
      type: String,
      // required: true,
      // unique: true,
      // trim: true,
      // lowercase: true,
      maxlength: 100,
      // match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    birthdate: {
      type: Date,
      // required: true
    },
    gender: {
      type: String,
      // enum: ['Male', 'Female', 'Other'],
      // default: 'Other'
    },
    role: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    password: {
      type: String,
      // required: true,
      minlength: 6, // Adjust as needed
    },
    confirm_password: {
      type: String,
      // required: true,
      // minlength: 6 // Adjust as needed
    },
    heightCm: {
      type: String,
      // min: 0 // Assuming height in cm or meters; adjust validation as needed
    },
    heightFeet: {
      type: Number,
      // min: 0 // Assuming height in cm or meters; adjust validation as needed
    },
    heightInches: {
      type: Number,
      // min: 0 // Assuming height in cm or meters; adjust validation as needed
    },
    heightUnit: {
      type: String,
      // min: 0 // Assuming height in cm or meters; adjust validation as needed
    },
    religion: {
      type: String,
      // maxlength: 50
    },
    zodiac: {
      type: String,
      // maxlength: 20
    },
    qualification: {
      type: String,
      // maxlength: 100
    },
    school: {
      type: String,
      // maxlength: 100
    },
    college: {
      type: String,
      // maxlength: 100
    },
    job_title: {
      type: String,
      // maxlength: 100/
    },
    organisation_url: {
      type: String,
      // maxlength: 255,
      // match: [/^(http|https):\/\/[^\s$.?#].[^\s]*$/, 'Please enter a valid URL']
    },
    ethnicity: {
      type: String,
      // maxlength: 50
    },
    country: {
      type: String,
      // maxlength: 50
    },
    drinking: {
      type: String,
      // enum: ['Yes', 'No', 'Occasionally'],
      // default: 'Occasionally'
    },
    smoking: {
      type: String,
      // enum: ['Yes', 'No', 'Occasionally'],
      // default: 'Occasionally'
    },
    exercise: {
      type: String,
      // enum: ['Yes', 'No', 'Occasionally'],
      // default: 'Occasionally'
    },
    sexual_orientation: {
      type: String,
      // maxlength: 50
    },
    personality: {
      type: String,
    },
    interest_details: {
      type: Array,
      default: [{}],
    },
    looking_for: {
      type: Array,
      default: [{}],
      // maxlength: 255,
    },
    prompt_question: {
      type: Array,
      default: [{}],
    },
    bio:{
      type: String
    },
    profileImage: {
      type: String,
      default: '', // Default value can be an empty string or a default image URL
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
  },
  { timestamps: true }
); // Includes createdAt and updatedAt timestamps

// Create a model from the schema
module.exports = mongoose.model("User", UserSchema);
