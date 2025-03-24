const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Message = require("./models/chatSchema");
const MessageGroup = require("./models/group_message_schema");
const mongoose = require("mongoose");

const secretKey = crypto
  .createHash("sha256")
  .update("your-secret-key")
  .digest("base64")
  .substr(0, 32);

// Map to store user socket connections
const userSockets = new Map(); // { userId: Set(socketIds) }
const groupSockets = new Map(); // { groupId: Set(userIds) }

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token, "client");
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
      if (!userSockets.has(socket.user.id)) {
        userSockets.set(socket.user.id, new Set());
      }
      userSockets.get(socket.user.id).add(socket.id);

    }

    // 🔹 Find user by email event
    socket.on("userFindemail", async (email) => {
      try {
        const user_data = await User.findOne({ email }).lean();
        socket.emit("res_userFindemail", user_data || null);
      } catch (error) {
        console.error("Error finding user:", error);
        socket.emit("res_userFindemail", null);
      }
    });

    // 🔹 Handle sending private messages
    socket.on("sendMessage", async (data) => {
      const { sender, receiver, message } = data;
      try {
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        // Send message to sender
        socket.emit("message", newMessage);

        // Send message to receiver if online
        if (userSockets.has(receiver)) {
          userSockets.get(receiver).forEach((socketId) => {
            io.to(socketId).emit("message", newMessage);
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    socket.on("joinGroup", async (groupId) => {
      if (!groupSockets.has(groupId)) {
        groupSockets.set(groupId, new Set());
      }
      groupSockets.get(groupId).add(socket.user.id);

      console.log(`User ${socket.user.id} joined group ${groupId}`);
    });

    // 🔹 Handle sending group messages
    socket.on("sendGroupMessage", async (data) => {
      const { sender, group, message } = data;

      try {
        const newMessage = new MessageGroup({ sender, group, message });
        await newMessage.save();

        // Send message back to sender
        socket.emit("messageGroup", newMessage);

        // Broadcast to all group members
        if (groupSockets.has(group)) {
          groupSockets.get(group).forEach((userId) => {
            if (userSockets.has(userId)) {
              userSockets.get(userId).forEach((socketId) => {
                io.to(socketId).emit("messageGroup", newMessage);
              });
            }
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // 🔹 Handle user disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.user);

      if (socket.user && userSockets.has(socket.user.id)) {
        const sockets = userSockets.get(socket.user.id);
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSockets.delete(socket.user.id);
        }
      }
    });
  });
};

module.exports = socketHandler;
