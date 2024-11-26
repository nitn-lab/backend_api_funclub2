// Creating the server using express
const express = require("express");
var cors = require('cors');
const http = require("http"); 
const app = express();
const {setupWebSocketServer} = require('./services/websocketService')
const routes = require("./routes/index");
const bodyParser = require("body-parser");

require("./config/DataBase");
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1", routes); //! USING API VERSION - 1

const User = require("./models/usersModel");
app.use('/uploads', express.static('uploads'));

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize WebSocket server
setupWebSocketServer(server); // Pass HTTP server to WebSocket initializer

// To start the server and listen to that port
// console.log("dot", process.env)
const port = process.env.PORT || 1000; //will configure environment vairables later
app.listen(port, () => {
  console.log(`Checking if server is running ${port}`);
});

// initialising the routes
app.get("/", (req, res) => {
  res.send("<h1>First route checking</h1>");
});
