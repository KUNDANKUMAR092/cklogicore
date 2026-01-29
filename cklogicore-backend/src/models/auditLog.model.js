// src/models/auditLog.model.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    accountId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,

    action: String, // CREATE, UPDATE, DELETE
    entity: String, // Supplier, Trip
    entityId: mongoose.Schema.Types.ObjectId,

    changes: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);

