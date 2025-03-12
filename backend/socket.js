// socket.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel')
const Message = require('./models/chatSchema');
const mongoose = require("mongoose");
const secretKey = crypto.createHash('sha256').update(String('your-secret-key')).digest('base64').substr(0, 32);
const userSockets = new Map();


const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token, "client")
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = user;
      next();
    });
  });

  io.on("connection", async (socket) => {
    console.log("New client connected", socket.user);

    if (socket.user) {
      userSockets.set(socket.user.id, socket.id);
    }

    socket.on('userFindemail', async (email) => {
      try {
        const user_data = await User.findOne({ email }).lean();
        socket.emit("res_userFindemail", user_data || null);
      } catch (error) {
        console.error("Error finding user:", error);
        socket.emit("res_userFindemail", null);
      }
    });

    socket.on("sendMessage", async (data) => {
      const { sender, receiver, message } = data;
      try {
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        // Send message to sender and receiver
        socket.emit("message", newMessage);
        if (userSockets.has(receiver)) {
          io.to(userSockets.get(receiver)).emit("message", newMessage);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });



    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

};

module.exports = socketHandler;