const mongoose = require('mongoose');
const userModel = new mongoose.Schema({
  name: { type: String, },
  email: { type: String, unique: true },
  photo: { type: String },
  phone: { type: String, required: true },
  messagesTime: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userModel);
module.exports = User;
