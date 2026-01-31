// src/models/companyOwner.models.js

import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
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
    address: { type: String },

    business: {
      gstNumber: String,
      panNumber: String
    },

    billing: {
      paymentTerms: String,
      creditLimit: { type: Number, default: 0 }
    },

    // 🎯 Status & Tracking
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

// Email/Mobile per account level par unique index
companySchema.index({ mobile: 1, accountId: 1 }, { unique: true });

export default mongoose.model("CompanyOwner", companySchema);





// import mongoose from "mongoose";

// const companySchema = new mongoose.Schema(
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
//     address: String,

//     business: {
//       gstNumber: String,
//       panNumber: String
//     },

//     billing: {
//       paymentTerms: String,
//       creditLimit: Number
//     },

//     meta: mongoose.Schema.Types.Mixed
//   },
//   { timestamps: true }
// );

// export default mongoose.model("CompanyOwner", companySchema);
