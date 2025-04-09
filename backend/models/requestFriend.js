const mongoose = require('mongoose');

const requestFriend = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  messagesTime: { type: Date, default: Date.now }
}, { timestamps: true });

const RequestFriend = mongoose.model('RequestFriend', requestFriend);

module.exports = RequestFriend;