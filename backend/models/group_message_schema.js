const mongoose = require("mongoose");

// Connect to MongoDB

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId }, // Sender of the message
    group: { type: mongoose.Schema.Types.ObjectId }, // Group ID
    massage: { type: Strin }, // Message text
    attachments: [{ type: String }], // URLs of attachments (optional)
    createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
