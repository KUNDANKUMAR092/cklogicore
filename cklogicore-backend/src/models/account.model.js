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
  mobile: {
    type: String,
    required: true, 
    trim: true
  },
  secondaryEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true, 
  },
  accountType: {
    type: String,
    enum: ["SUPPLIER", "COMPANY", "VEHICLE"],
    required: true
  },
  role: { 
    type: String, 
    enum: ["OWNER", "STAFF"],
    default: "OWNER" 
  },
  avatar: { type: String, default: "" }, 
  // 🆕 Field added: Banner Image
  bannerImage: { type: String, default: "" }, 
  bio: { type: String, default: "" },
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