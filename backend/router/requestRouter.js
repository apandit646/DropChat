const express = require('express');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Requestfriend = require('../models/requestFriend');
const { authenticateToken } = require('../auth/auth');
const mongoose = require("mongoose"); // Fixed import

dotenv.config();

const router = express.Router();


// ✅ sending request to frind by data base 
router.post('/addFriendReq', authenticateToken, async (req, res) => {
    try {
        const body = req.body;
        const user = req.user;
        const objectId = new mongoose.Types.ObjectId(body.id);
        const userId = new mongoose.Types.ObjectId(user.id);
        const findfriend = await User.findOne({ _id: objectId })
        console.log(findfriend, "findfriend")
        if (!findfriend) {
            return res.status(400).json({ error: 'User not found' });
        }
        const finduser = await Requestfriend.findOne({
            from: userId,
            to: objectId,
            status: { $in: ["pending", "accptedaccepted"] }
        });
        if (finduser) {
            es.status(200).json({ message: 'you alredy friebnd or send frequest' });
        }

        const requestFriend = new Requestfriend({
            from: userId,
            to: objectId,
        });

        try {
            await requestFriend.save();
            res.status(200).json({ message: 'Friend request sent successfully' });
        } catch (error) {
            console.error('Error sending friend request:', error);
            res.status(500).json({ error: 'Error sending friend request' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error sending friend request' });
    }


});

// ✅ get all frinds by user id a fro friend request 
router.get("/getFriendReq", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const userId = new mongoose.Types.ObjectId(user.id);

        // Fetch all friend requests sent BY the user (change to { to: userId } if needed)
        const requestFriends = await Requestfriend.find({ to: userId });

        // console.log(requestFriends, "requestFriends <<<<<<<<<<<<<<<<<<<");

        if (!requestFriends.length) {
            return res.status(400).json({ error: "No friend requests found" });
        }

        // Extract receiver IDs from requests
        const receiverIds = requestFriends.map((req) => req.from);

        // console.log(receiverIds, "receiverIds <<<<<<<<<<<<<<<<<<<<<<");

        // Fetch user details of receivers
        const friends = await User.find({ _id: { $in: receiverIds } });

        console.log(friends, "friends");

        res.status(200).json(friends);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ error: "Error fetching friend requests" });
    }
});

// ✅ accepting or rejecting friend request by user
router.put('/getFriendReq/accRej', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const userId = new mongoose.Types.ObjectId(user.id);
        const data = req.body;
        const dataId = new mongoose.Types.ObjectId(data.id)
        // console.log(dataId, "dataDDDDDDDDDDDDDDDDDDDDDD")
        // console.log(userId, "UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU")
        const status = data.status
        // console.log(status, "statusssssssssssssssssssssssssss")
        if (status === "accepted") {
            const requestFriend = await Requestfriend.findOneAndUpdate({ $and: [{ from: dataId, to: userId }] }, { status: data.status })
            // console.log(requestFriend, "requestFriend <<<<<<<<<<<<<<<");
            res.status(200).json({ message: 'Friend request accepted successfully' });
        }
        else if (status === "rejected") {
            const requestFriend = await Requestfriend.findOneAndDelete({ $and: [{ from: dataId, to: userId }] })
            // console.log(requestFriend, "requestFriend <<<<<<<<<<<<<<<");
            res.status(200).json({ message: 'Friend request rejected successfully' });
        }


    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Error accepting friend request' });
    }
});



//✅ Fetch friend list 
router.get('/getFriendList', authenticateToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Fetch accepted friend requests where the user is either 'from' or 'to'
        const requestFriendslist = await Requestfriend.find({
            $or: [{ from: userId }, { to: userId }],
            status: "accepted"
        });

        if (!requestFriendslist.length) {
            return res.status(404).json({ message: "No friends found" });
        }

        console.log(requestFriendslist, "requestFriendslist ################################");

        // Extract friend IDs
        const friendIds = requestFriendslist.map(req =>
            req.from.equals(userId) ? req.to : req.from
        );

        console.log(friendIds, "friendIds >>>>>>>>>>>>>>>>>>>>>>>>>");

        // Fetch user details of friends
        const friends = await User.find({ _id: { $in: friendIds } }).select('-password'); // Exclude sensitive fields if needed

        console.log(friends, "friends >>>>>>>>>>>>>>>>>>>>>>>>>>");

        return res.status(200).json(friends);
    } catch (error) {
        console.error('Error fetching friend list:', error);
        res.status(500).json({ error: 'Error fetching friend list' });
    }
});

module.exports = router;
