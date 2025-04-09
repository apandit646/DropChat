const mongoose = require('mongoose');
const userModel = new mongoose.Schema({
  name: { type: String, },
  email: { type: String, unique: true },
  phone: { type: String, required: true },
  messagesTime: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userModel);
module.exports = User;
