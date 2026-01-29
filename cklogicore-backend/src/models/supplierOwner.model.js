import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    name: { type: String, required: true },
    mobile: String,
    email: String,

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
      creditLimit: Number,
      outstandingAmount: { type: Number, default: 0 }
    },

    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("SupplierOwner", supplierSchema);
