const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    phone : { type: String, required: true}
  }, { timestamps: true });
  
const User = mongoose.model('User', userModel);
module.exports = User;
  