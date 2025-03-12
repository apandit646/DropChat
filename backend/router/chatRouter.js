const express = require('express');
const dotenv = require('dotenv');
const { authenticateToken } = require('../auth/auth');
const mongoose = require("mongoose");
const Message = require('../models/chatSchema');
dotenv.config();

const router = express.Router();
router.get("/chatMessages", authenticateToken, async (req, res) => {
    try {
        const receiverMessage = req.query.receiver; // Fetch from query parameters
        const sendMessage = req.user.id;
        const senderId = new mongoose.Types.ObjectId(sendMessage);
        const receiverId = new mongoose.Types.ObjectId(receiverMessage)

        console.log("Receiver ID:", receiverId);
        console.log("Sender ID:", senderId);

        if (!receiverId) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;