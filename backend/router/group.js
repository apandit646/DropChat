const express = require('express');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Group = require('../models/groupSchema');
const { authenticateToken } = require('../auth/auth');
const mongoose = require("mongoose"); // Fixed import
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
// ✅ get all groups by user id
router.get("/getFriendGroupList", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(400).json({ error: "User not found" });
        const id_user = new mongoose.Types.ObjectId(user.id)
        const groups = await Group.find({ "members.userId": id_user })
        console.log(groups, ":::::::::::::::::::::::::::::")
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Error fetching groups" });
    }
});

module.exports = router;
