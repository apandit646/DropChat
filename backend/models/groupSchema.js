const mongoose = require("mongoose");

// ✅ Subdocument schema for members
const memberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinedAt: { type: Date, default: Date.now }
});
const adminSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinedAt: { type: Date, default: Date.now }
});

// ✅ Group Schema
const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Group name
    admins: [adminSchema], // Group admins
    members: [memberSchema], // Array of user objects
    messagesTime: { type: Date, default: Date.now } // Store last message time, with default value
}, { timestamps: true }); // Auto timestamps for createdAt & updatedAt

const Group = mongoose.model("Group", GroupSchema);
module.exports = Group;
