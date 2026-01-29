// account.model.js
import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    accountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    plan: { type: String, default: "FREE" },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);












// import mongoose from "mongoose";

// /**
//  * Account = One Business Account
//  * Har Supplier / Company / Vehicle owner ka ek Account hota hai
//  * Sab data isi accountId se linked hota hai
//  */

// const accountSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     // Unique Account for whole system
//     accountId: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     // Kis type ka owner hai
//     ownerType: {
//       type: String,
//       enum: ["SUPPLIER", "COMPANY", "VEHICLE"],
//       required: true,
//     },

//     // Actual owner ka ObjectId
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       refPath: "ownerModel",
//     },

//     // Kis model se owner belong karta hai
//     ownerModel: {
//       type: String,
//       enum: ["Supplier", "Company", "Vehicle"],
//       required: true,
//     },

//     // Account active / inactive
//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },

//     // Optional: plan / subscription (future use)
//     plan: {
//       type: String,
//       default: "FREE",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("Account", accountSchema);
