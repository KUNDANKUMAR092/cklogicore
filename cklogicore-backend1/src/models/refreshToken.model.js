const mongoose = require("mongoose");

module.exports = mongoose.model(
  "RefreshToken",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      token: {
        type: String,
        required: true,
        unique: true
      },
      isRevoked: {
        type: Boolean,
        default: false
      },
      expiresAt: {
        type: Date,
        required: true
      }
    },
    { timestamps: true }
  )
);
