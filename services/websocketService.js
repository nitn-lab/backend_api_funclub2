const WebSocket = require("ws");
const uuid = require("uuid");
const mongoose = require("mongoose"); // For generating unique channel names
const MessageSchema = require("../models/messageModel");
let activeCalls = {};
let activeChats = {};

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ port: 4000, host: "0.0.0.0" });
  console.log("New WebSocket connection established");
  wss.on("connection", (ws) => {
    // console.log("ws", ws);
    ws.on("message", async (message) => {
      const { type, from, to, channelName, chatMessage } = JSON.parse(message);
      console.log("Received message:", { type, from, to, chatMessage });
      if (type === "register") {
        delete activeCalls[from];                               
        ws.username = from;
        console.log(`User ${from} registered`);
      } else if (type === "call") {
        console.log("Attempting to place a call between:", from, to);
        console.log("Current activeCalls:", activeCalls);
        if (activeCalls[to] || activeCalls[from]) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "User is already in a call.",
            })
          );
        } else {
          const newChannelName = channelName || uuid.v4();
          activeCalls[from] = newChannelName;
          activeCalls[to] = newChannelName;

          broadcast(
            to,
            JSON.stringify({
              type: "incomingCall",
              from,
              channelName: newChannelName,
            })
          );
        }
      } else if (type === "acceptCall") {
        ws.send(JSON.stringify({ type: "callAccepted", channelName }));
      } else if (type === "endCall") {
        delete activeCalls[from];
        delete activeCalls[to];
        broadcast(to, JSON.stringify({ type: "callEnded" }));
      } else if (type === "chatMessage") {
        // Save chat message to activeChats or directly send it to the intended user
        console.log(`User ${from} sent a message to ${to}: ${chatMessage}`);
        if (!activeChats[from]) {
          activeChats[from] = {};
        }
        if (!activeChats[from][to]) {
          activeChats[from][to] = []; // Initialize chat array for this user
        }

        // Add message to chat history
        activeChats[from][to].push({
          from,
          message: chatMessage,
          timestamp: new Date(),
        });
        await saveChatMessage(from, to, chatMessage);
        // Send message to the intended recipient
        broadcast(
          to,
          JSON.stringify({
            type: "chatMessage",
            from,
            to,
            message: chatMessage,
            timestamp: new Date(),
          })
        );
        sendNotification(wss, to, {
          type: "chatNotification",
          from,
          message: chatMessage,
        });
      }
      // Get chat history
      else if (type === "getChatHistory") {
        const chatHistory = await getChatHistory(from, to);
        ws.send(JSON.stringify({ type: "chatHistory", chatHistory }));
      }
    });
  });

  // Cleanup on disconnection
  wss.on("close", (ws) => {
    // Remove user from active calls if they disconnect
    console.log(`User ${ws.username} disconnected`);
    for (const [key, value] of Object.entries(activeCalls)) {
      if (key === ws.username) {
        delete activeCalls[key]; // Remove the disconnecting user
      }
    }
    // Also remove any user who was being called by the disconnecting user
    for (const [key, value] of Object.entries(activeCalls)) {
      if (value === activeCalls[ws.username]) {
        delete activeCalls[key]; // Remove the other participant
      }
    }
  });

  function broadcast(to, message) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.username === to) {
        console.log(`Sending message to ${to}`);
        client.send(message);
      }
    });
  }
}
function sendNotification(wss, to, notification) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.username === to) {
      client.send(JSON.stringify(notification)); // Send notification message to the user
    }
  });
}

async function saveChatMessage(fromUserId, toUserId, chatMessage) {
  const message = new MessageSchema({
    from: fromUserId, // This should be an ObjectId of the user
    to: toUserId, // This should also be an ObjectId of the user
    message: chatMessage,
  });

  await message.save();
}

async function getChatHistory(fromUserId, toUserId) {
  const messages = await MessageSchema.find({
    $or: [
      { from: fromUserId, to: toUserId },
      { from: toUserId, to: fromUserId },
    ],
  })
    .populate("from", "username") // Get only the username field from User
    .populate("to", "username"); // Get only the username field from User

  return messages;
}

module.exports = { setupWebSocketServer };
