const mongoose = require('mongoose');
const userModel = new mongoose.Schema({
  name: { type: String, },
  email: { type: String, unique: true },
  phone: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of friends
  friendRequests: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who sent the request
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Request status
    },
  ],
}, { timestamps: true });

const User = mongoose.model('User', userModel);
module.exports = User;
