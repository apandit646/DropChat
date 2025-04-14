const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Message = require("./models/chatSchema");
const MessageGroup = require("./models/group_message_schema");
const Group = require("./models/groupSchema");
const RequestFriend = require("./models/requestFriend");
const mongoose = require("mongoose");
const { time } = require("console");
const { mainModule } = require("process");

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
        // Step 1: Save the message
        const newMessage = await Message.create({ sender, receiver, message });

        // Step 2: Populate sender and receiver details
        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "name email photo")     // Populate with correct fields
          .populate("receiver", "name email photo");

        // Step 3: Emit to sender
        socket.emit("message", populatedMessage);

        // Step 4: Update messagesTime on receiver's user document
        await User.findByIdAndUpdate(
          receiver,
          { messagesTime: Date.now() },
          { new: true }
        );

        // Step 5: Emit to receiver if online
        if (userSockets.has(receiver)) {
          const sockets = userSockets.get(receiver);
          sockets.forEach((socketId) => {
            if (socketId !== socket.id) {
              io.to(socketId).emit("message", populatedMessage);
            }
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });


    socket.on("joinGroup", async (groupId) => {
      if (!groupSockets.has(groupId)) {
        groupSockets.set(groupId, new Set());
        console.log(`Group-------------- ${groupId} created in memory`);
      }
      groupSockets.get(groupId).add(socket.user.id);

      console.log(`User ${socket.user.id} joined group ${groupId}`);
    });

    // 🔹 Handle sending group messages
    socket.on("sendGroupMessage", async (data) => {
      const { sender, group, message, messageTime } = data;

      try {
        // Get group members (populate user details if needed)
        const groupData = await Group.findById(group)
          .populate("members.userId", "_id") // Populating only `_id` for safety and performance
          .select("members.userId")
          .lean();

        if (!groupData) {
          return console.error("Group not found for ID:", group);
        }

        const filteredMembers = groupData.members.filter(
          (member) => member.userId._id.toString() !== sender
        );

        // Create and save new group message
        const newMessage = await MessageGroup.create({
          sender,
          group,
          message,
          status: filteredMembers, // Can store read/unread status here
          createdAt: messageTime || Date.now(), // Optional: use passed timestamp or current
        });

        console.log("New group message saved:", newMessage);

        // Populate sender info before broadcasting
        const populatedMessage = await MessageGroup.findById(newMessage._id)
          .populate("sender", "name email photo")
          .lean();

        socket.emit("messageGroup", populatedMessage); // Emit to sender

        // Send message to all group members (excluding sender if needed)
        if (groupSockets.has(group)) {
          groupSockets.get(group).forEach((userId) => {
            if (userSockets.has(userId)) {
              userSockets.get(userId).forEach((socketId) => {
                io.to(socketId).emit("messageGroup", populatedMessage);
              });
            }
          });
        }

        // Update group's latest message timestamp
        await Group.findByIdAndUpdate(
          group,
          { messagesTime: Date.now() },
          { new: true }
        );

      } catch (error) {
        console.error("Error handling group message:", error);
      }
    });




    //read message status
    socket.on("markAsRead", async (data) => {
      const { unreadMessages } = data;
      console.log("Read message ID:", unreadMessages);
      unreadMessages.map(async (messageId) => {
        try {
          const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { status: "read" },
            { new: true }
          );
          console.log("Message updated:", updatedMessage);
        } catch (error) {
          console.error("Error updating message status:", error);
        }
      });
    });


    //handle group read group message status
    socket.on("markAsReadMessage", async (data) => {
      const { unRead } = data;
      console.log("Read message ID..................................:", unRead);
      unRead.map(async (messageId) => {
        try {
          const updatedMessage = await MessageGroup.updateOne(
            { _id: messageId }, // messageId should be in a filter object
            { $pull: { status: { userId: socket.user.id } } }
          );
          console.log("Updated message status:", updatedMessage);
        } catch (error) {
          console.error("Error updating message status:", error);
        }
      });
    })



    // ass thge 
    socket.on("addMemberToGroup", async ({ groupId, members }) => {
      console.log("Adding members to group:", groupId, members);

      try {
        // Ensure members is an array of objects like { userId: "..." }
        const updatedGroup = await Group.findByIdAndUpdate(
          groupId,
          {
            $addToSet: {
              members: {
                $each: members,
              },
            },
          },
          { new: true }
        );

        console.log("✅ Updated group:", updatedGroup);

      } catch (error) {
        console.error("❌ Error updating group:", error);
        socket.emit("memberAddedToGroup", { success: false, error });
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
