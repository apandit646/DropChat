const mongoose = require("mongoose");


// stsuts messge 

memberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Connect to MongoDB

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId }, // Sender of the message
    group: { type: mongoose.Schema.Types.ObjectId }, // Group ID
    message: { type: String }, // Message text
    status: [memberSchema], // Message status
    createdAt: { type: Date, default: Date.now },
});

const MessageGroup = mongoose.model("MessageGroup", MessageSchema);
module.exports = MessageGroup;
