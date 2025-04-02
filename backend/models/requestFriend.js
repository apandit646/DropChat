const mongoose = require('mongoose');
const requestFriend = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId },
  to: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  messageTime: {
    type: Date,
  },
}, { timestamps: true });

const RequestFriend = mongoose.model('RequestFriend', requestFriend);
module.exports = RequestFriend;


// Importing the RequestFriend model
