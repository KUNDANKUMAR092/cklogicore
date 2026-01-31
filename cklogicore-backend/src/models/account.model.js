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
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Account", accountSchema);
