// src/models/accountSchema.model.js

import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  accountType: {
    type: String,
    enum: ["SUPPLIER", "COMPANY", "VEHICLE"],
    required: true
  },
  avatar: { type: String, default: "" }, // Profile Picture path
  personalDetails: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  lastLogin: Date,
  isDeactivated: { type: Boolean, default: false },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

export default mongoose.model("Account", accountSchema);
