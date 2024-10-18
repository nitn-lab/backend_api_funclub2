const mongoose = require("mongoose");

//Defining Admin schema for registration

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
}, {timestamps: true});

//create model for the admin schema
module.exports = mongoose.model("Admin", AdminSchema);
