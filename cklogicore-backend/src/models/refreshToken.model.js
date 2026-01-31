// src/models/refreshToken.model.js

import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  token: String,

  expiresAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
