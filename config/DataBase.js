const mongoose = require("mongoose");
const name = process.env.userMongo;
const password = process.env.Password;

// console.log(name, password, URL)
//! CONNECTION CONFIGURATION WITH DATABASE - MONGODB
mongoose
  .connect(
    `mongodb+srv://nitinkudesia0411:${password}@${name}.ojtfd.mongodb.net/?retryWrites=true&w=majority&appName=DevCluster`
  )
  .then(() => {
    console.log("Connection Estb.");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });
