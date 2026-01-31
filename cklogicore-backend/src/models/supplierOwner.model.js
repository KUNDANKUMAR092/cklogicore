// src/model/supplierOwner.model.js

import mongoose, { model } from "mongoose";

const supplierOwnerSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String }, // ✅ Added

    business: {
      gstNumber: String,
      panNumber: String
    },

    bank: {
      bankName: String,
      accountNumber: String,
      ifsc: String
    },

    credit: {
      creditLimit: { type: Number, default: 0 },
      outstandingAmount: { type: Number, default: 0 }
    },

    isActive: { type: Boolean, default: true }, // ✅ Added
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

// Indexing for performance and uniqueness
supplierOwnerSchema.index({ mobile: 1, accountId: 1 }, { unique: true });

export default mongoose.model("SupplierOwner", supplierOwnerSchema);






















// import mongoose from "mongoose";

// const supplierSchema = new mongoose.Schema(
//   {
//     accountId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//       index: true
//     },

//     name: { type: String, required: true },
//     mobile: String,
//     email: String,

//     business: {
//       gstNumber: String,
//       panNumber: String
//     },

//     bank: {
//       bankName: String,
//       accountNumber: String,
//       ifsc: String
//     },

//     credit: {
//       creditLimit: Number,
//       outstandingAmount: { type: Number, default: 0 }
//     },

//     meta: mongoose.Schema.Types.Mixed
//   },
//   { timestamps: true }
// );

// export default mongoose.model("SupplierOwner", supplierSchema);
