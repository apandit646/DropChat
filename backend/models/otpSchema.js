const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: String,
    otp: String,
    createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
  });
  
const OTPschema = mongoose.model('OTPschema', otpSchema);
module.exports = OTPschema;
  