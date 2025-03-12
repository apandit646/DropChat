const express = require('express');

const dotenv = require("dotenv");
const twilio = require("twilio");
const User = require('../models/userModel');
const OTPschema = require('../models/otpSchema');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


dotenv.config();

const router = express.Router();

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(String('your-secret-key')).digest('base64').substr(0, 32);
const iv = crypto.createHash('sha256').update(String('your-fixed-iv')).digest('base64').substr(0, 16);


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ Send OTP
router.post("/otp/send-otp", async (req, res) => {
  const { phone } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP // 🔹 Hash OTP before storing
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  try {
    // Delete previous OTPs for this phone
    await OTPschema.deleteMany({ phone });
    JSON.stringify(otpCode)
    // Save hashed OTP in DB
    await OTPschema.create({ phone, otp: otpCode, expiresAt });

    // Send OTP via SMS
    await client.messages.create({
      body: `Your OTP code is ${otpCode}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Error sending OTP" });
  }
});

// ✅ Verify OTP
router.post("/otp/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Fetch latest OTP record
    const record = await OTPschema.findOne({ phone }).sort({ createdAt: -1 });
    console.log(record, ">>>>>>>>>>>>>>>>>>>>>>>");

    if (!record) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (record.expiresAt < new Date()) {
      await OTPschema.deleteOne({ _id: record._id }); // Deleting specific OTP record
      return res.status(400).json({ error: "OTP expired" });
    }

    // 🔹 Compare OTPs directly (since no hashing is used)
    if (otp !== record.otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if user exists
    let checkUser = await User.findOne({ phone });

    if (!checkUser) {
      checkUser = await User.create({ phone });
    }

    // OTP verified, now delete it from DB
    await OTPschema.deleteOne({ _id: record._id });

    res.status(200).json({ message: "OTP verified successfully", user: checkUser });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ✅  Deatil update done 
router.put("/user/details", async (req, res) => {
  const { phone, name, email } = req.body;
  console.log(req.body);


  try {
    const user = await User.findOneAndUpdate({ phone }, { name, email }, { new: true });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    console.log(user);
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({
      message: "Login successful",
      token,
      name: user.name,
      email: user.email,
      id: user._id.toString(),
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
