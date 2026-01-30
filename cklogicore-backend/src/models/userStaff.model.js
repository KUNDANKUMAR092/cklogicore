// src/models/userStaff.model.js

import mongoose from "mongoose";

const userStaffSchema = new mongoose.Schema(
  {
    // 🔐 Tenant isolation
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    // 🔥 Business type
    accountType: {
      type: String,
      required: true
    },

    // 👤 Staff Info
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // ✅ Login Control
    isActive: {
      type: Boolean,
      default: false // Admin must enable
    },

    // 🎯 Permissions
    permissions: {
      ADD_SUPPLIER: { type: Boolean, default: false },
      ADD_COMPANY: { type: Boolean, default: false },
      ADD_VEHICLE: { type: Boolean, default: false },
      VIEW_REPORTS: { type: Boolean, default: false }
    },

    // 🔁 Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // Admin
    }

  },
  { timestamps: true }
);


// ❌ Same account me duplicate email nahi
userStaffSchema.index(
  { email: 1, accountId: 1 },
  { unique: true }
);

export default mongoose.model("UserStaff", userStaffSchema);
