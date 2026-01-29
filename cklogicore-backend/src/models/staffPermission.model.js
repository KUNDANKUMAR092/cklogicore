// src/models/staffPermission.model.js
import mongoose from "mongoose";

const staffPermissionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    permissions: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("StaffPermission", staffPermissionSchema);
