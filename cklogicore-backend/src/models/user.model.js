// src/models/user.model.js

import mongoose from "mongoose";
import crypto from "crypto";
import { ROLES } from "../constants/roles.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

const userSchema = new mongoose.Schema(
  {
    // 🔐 Account isolation
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    // 🔥 WHOSE SYSTEM (SUPPLIER / COMPANY / VEHICLE)
    accountType: {
      type: String,
      enum: Object.values(ACCOUNT_TYPES),
      required: true
    },

    // 👤 USER INFO
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // 🔥 WHAT ACCESS USER HAS (ADMIN / STAFF)
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.ADMIN
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    permissions: {
      ADD_SUPPLIER: { type: Boolean, default: false },
      ADD_COMPANY: { type: Boolean, default: false },
      ADD_VEHICLE: { type: Boolean, default: false },
    }
  },
  { timestamps: true }
);


/**
 * 🔐 Create Reset Token
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hash token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // expire in 15 min
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  return resetToken;
};


// Prevent same email in same Account
userSchema.index({ email: 1, accountId: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
