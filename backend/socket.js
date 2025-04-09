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
        // Save the new message
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        // Emit message to sender
        socket.emit("message", newMessage);

        // Update the messagesTime for the friend request
        await User.findByIdAndUpdate(
          receiver,
          { messagesTime: Date.now() },
          { new: true }
        )
          .then((updatedRequest) => {
            console.log("Updated request friend:", updatedRequest);
          });

        // Emit message to receiver if online (excluding sender if same socket)
        if (userSockets.has(receiver)) {
          const sockets = userSockets.get(receiver);
          sockets.forEach((socketId) => {
            // Avoid re-sending if sender and receiver are on the same socket
            if (socketId !== socket.id) {
              io.to(socketId).emit("message", newMessage);
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
      const groupMember = await Group.findById(group).populate("members.userId").select("members.userId").lean();
      console.log("Group members:", groupMember);
      const filterGroupMember = groupMember.members.filter((member) => member.userId._id.toString() !== sender);



      try {
        const newMessage = new MessageGroup({ sender, group, message, status: filterGroupMember });
        await newMessage.save();
        // Broadcast to all group members
        if (groupSockets.has(group)) {
          groupSockets.get(group).forEach((userId) => {
            if (userSockets.has(userId)) {
              console.log("Group message sent to userId:", userId);
              userSockets.get(userId).forEach((socketId) => {
                console.log("Group message sent to socketId:", socketId);
                io.to(socketId).emit("messageGroup", newMessage);
              });
            }
          });
        }
        const groupUpdate = await Group.findByIdAndUpdate(
          group,
          { messagesTime: Date.now() },  // Epoch time in milliseconds
          { new: true }
        );

      } catch (error) {
        console.error("Error sending message:", error);
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
          if (updatedMessage) {
            socket.emit("messageRead", updatedMessage);
          }
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
