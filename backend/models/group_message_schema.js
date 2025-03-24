const mongoose = require("mongoose");

// Connect to MongoDB

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId }, // Sender of the message
    group: { type: mongoose.Schema.Types.ObjectId }, // Group ID
    message: { type: String }, // Message text
    createdAt: { type: Date, default: Date.now },
});

const MessageGroup = mongoose.model("MessageGroup", MessageSchema);
module.exports = MessageGroup;
