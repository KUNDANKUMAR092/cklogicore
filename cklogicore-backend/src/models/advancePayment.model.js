import mongoose from "mongoose";

const advanceSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },

    paidByRole: { type: String, enum: ["SUPPLIER", "COMPANY", "VEHICLE"], required: true },
    receivedByRole: { type: String, enum: ["SUPPLIER", "COMPANY", "VEHICLE"], required: true },

    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },

    scopeType: { type: String, enum: ["TRIP", "OVERALL"], required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Transport", default: null },

    note: String
  },
  { timestamps: true }
);

export default mongoose.model("AdvancePayment", advanceSchema);
