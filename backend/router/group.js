const express = require('express');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Group = require('../models/groupSchema');
const { authenticateToken } = require('../auth/auth');
const mongoose = require("mongoose"); // Fixed import
const MessageGroup = require("../models/group_message_schema");
dotenv.config();
const router = express.Router();
// ✅ get all frinds by user id a fro friend request 

// use for creating group 
router.post("/createGroup", authenticateToken, async (req, res) => {
    try {
        const frormattedAdmin = []
        const user = req.user;
        const { name, members } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Group name is required" });
        }

        const formattedMembers = members.map(memberId => ({
            userId: new mongoose.Types.ObjectId(memberId)
        }));

        formattedMembers.push({ userId: new mongoose.Types.ObjectId(user.id) });
        frormattedAdmin.push({ adminId: new mongoose.Types.ObjectId(user.id) });

        const group = new Group({
            name,
            members: formattedMembers,
            admins: frormattedAdmin
        });
        await group.save();
        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Error creating group" });
    }
});
router.get("/getFriendGroupList", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(400).json({ error: "User not found" });

        const id_user = new mongoose.Types.ObjectId(user.id);

        // Fetch all groups where the user is a member
        const groups = await Group.find({ "members.userId": id_user })
            .sort({ messagesTime: -1 })
            .populate("members.userId", "name email")
            .populate("admins.adminId", "name email")
            .lean();

        const groupIds = groups.map(group => group._id);

        // Aggregate to get delivered message counts per group
        const deliveredMessages = await MessageGroup.aggregate([
            {
                $match: {
                    group: { $in: groupIds },
                    status: {
                        $elemMatch: { userId: id_user }
                    }
                }
            },
            {
                $group: {
                    _id: "$group",
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log(deliveredMessages, "delivered message count");
        // Map deliveredMessages to an object for easier lookup
        const deliveredMap = {};
        deliveredMessages.forEach(item => {
            deliveredMap[item._id.toString()] = item.count;
        });

        // Attach count to each group
        const groupsWithCounts = groups.map(group => ({
            ...group,
            deliveredCount: deliveredMap[group._id.toString()] || 0
        }));

        console.log(groupsWithCounts, "taking out list of group ");
        res.status(200).json(groupsWithCounts);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Error fetching groups" });
    }
});



router.get("/chatGroupMessages", authenticateToken, async (req, res) => {
    try {
        const groupMessage = req.query.receiver; // Fetch from query parameters
        const sendMessage = req.user.id;

        if (!groupMessage) {
            return res.status(400).json({ error: "Receiver ID (Group ID) is required" });
        }

        const senderId = new mongoose.Types.ObjectId(sendMessage);
        const groupId = new mongoose.Types.ObjectId(groupMessage);

        console.log("Receiver ID:", groupId);
        console.log("Sender ID:", senderId);

        const messages = await MessageGroup.find({
            group: groupId
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;
