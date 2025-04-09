const express = require('express');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Requestfriend = require('../models/requestFriend');
const { authenticateToken } = require('../auth/auth');
const mongoose = require("mongoose"); // Fixed import
const Message = require('../models/chatSchema'); // Import the Message model

dotenv.config();

const router = express.Router();


// ✅ sending request to frind by data base 
router.post('/addFriendReq', authenticateToken, async (req, res) => {
    try {
        const body = req.body;
        const user = req.user;
        const objectId = new mongoose.Types.ObjectId(body.id);
        const userId = new mongoose.Types.ObjectId(user.id);

        // Check if the recipient user exists
        const findfriend = await User.findOne({ _id: objectId });
        if (!findfriend) {
            console.log("User not found:", objectId);
            return res.status(400).json({ error: 'User not found' });
        }

        console.log("Searching for existing friend request:", { userId, objectId });

        // Check if a friend request already exists
        const finduser = await Requestfriend.findOne({
            from: userId,
            to: objectId,  // ✅ No need to convert again
            status: { $in: ["pending", "accepted"] }
        });

        if (finduser) {
            return res.status(200).json({ message: 'You are already friends or have sent a friend request' });
        }

        // Create a new friend request
        const requestFriend = new Requestfriend({
            from: userId,
            to: objectId,
            status: "pending"  // ✅ Added status to avoid undefined values
        });

        await requestFriend.save();
        res.status(200).json({ message: 'Friend request sent successfully' });

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Error sending friend request' });
    }
});


// ✅ get all frinds by user id a fro friend request 
router.get("/getFriendReq", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const userId = new mongoose.Types.ObjectId(user.id);

        // Fetch all friend requests sent BY the user (change to { to: userId } if needed)
        const requestFriends = await Requestfriend.find({ to: userId, status: "pending" });

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

        // 1. Fetch accepted friend requests where the user is either 'from' or 'to'
        const requestFriendslist = await Requestfriend.find({
            $or: [{ from: userId }, { to: userId }],
            status: "accepted"
        });

        if (!requestFriendslist.length) {
            return res.status(404).json({ message: "No friends found" });
        }

        // 2. Extract friend IDs
        const friendIds = requestFriendslist.map(req =>
            req.from.equals(userId) ? req.to : req.from
        );

        // 3. Fetch user details of friends (exclude sensitive fields)
        const friends = await User.find({ _id: { $in: friendIds } }).sort({ messagesTime: -1 });


        // 4. Get count of delivered messages grouped by sender
        const deliveredMessages = await Message.aggregate([
            {
                $match: {
                    receiver: userId,
                    status: "delivered"
                }
            },
            {
                $group: {
                    _id: "$sender",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 5. Convert message count results to a map for quick lookup
        const messageMap = {};
        deliveredMessages.forEach(msg => {
            messageMap[msg._id.toString()] = msg.count;
        });
        console.log(messageMap, "MMMMMMMMMMMMMMMMMMMMMMMMMMM")

        // 6. Attach deliveredMessageCount to each friend
        const friendsWithCount = friends.map(friend => {
            return {
                ...friend.toObject(),
                deliveredMessageCount: messageMap[friend._id.toString()] || 0
            };
        });
        console.log(friendsWithCount, "MMMMMMMMMMMMMMMMMMMMMMMMMMMCCCCCCCCCCCCCCCCCCCCC")

        return res.status(200).json(friendsWithCount);
    } catch (error) {
        console.error('Error fetching friend list:', error);
        res.status(500).json({ error: 'Error fetching friend list' });
    }
});

module.exports = router;
