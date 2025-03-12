const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId },
    receiver: { type: mongoose.Schema.Types.ObjectId },
    message: String
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
