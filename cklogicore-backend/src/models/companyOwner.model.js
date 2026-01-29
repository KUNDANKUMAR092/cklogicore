import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
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
    address: String,

    business: {
      gstNumber: String,
      panNumber: String
    },

    billing: {
      paymentTerms: String,
      creditLimit: Number
    },

    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("CompanyOwner", companySchema);
