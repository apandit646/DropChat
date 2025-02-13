const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('../models/userModel');
const OTPschema = require('../models/otpSchema');
const dotenv = require("dotenv");
const twilio = require("twilio");
dotenv.config();

const router = express.Router();

router.post("/api/otp/verify-otp", async (req, res) => {
  const { phone } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

  try {
    // Save OTP in DB
    await OTPschema.create({ phone, otp: otpCode });

    // Send OTP via SMS
    await client.messages.create({
      body: `Your OTP code is ${otpCode}. It will expire in 5 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error sending OTP" });
  }
});


router.post("/api/otp/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const record = await OTP.findOne({ phone, otp });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP verified, now delete it from DB
    await OTPschema.deleteOne({ phone });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error verifying OTP" });
  }
});


module.exports = router;
