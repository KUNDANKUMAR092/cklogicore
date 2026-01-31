// src/models/userSchema.model.js

import mongoose from "mongoose";

/**
 * Users inside Account
 * Only ONE OWNER per account
 */

const userSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["OWNER", "STAFF"],
      default: "STAFF"
    },

    permissions: {
      type: Object,
      default: {}
    },

    isActive: {
      type: Boolean,
      default: true
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

/* Same email in same account = not allowed */
userSchema.index({ email: 1, accountId: 1 }, { unique: true });

/* Only ONE OWNER per account */
userSchema.index(
  { accountId: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "OWNER" }
  }
);

export default mongoose.model("User", userSchema);
