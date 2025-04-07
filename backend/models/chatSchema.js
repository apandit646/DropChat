const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId },
    receiver: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String },
    status: { type: String, enum: ["delivered", "read"], default: "delivered" },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
