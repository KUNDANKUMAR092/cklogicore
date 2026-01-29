const mongoose = require("mongoose");

const ROLES = ["ADMIN", "COMPANY_OWNER", "VEHICLE_OWNER", "SUPPLIER_OWNER"];

module.exports = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, unique: true, required: true },
      password: String, // google user ke liye empty ho sakta hai
      role: {
        type: String,
        enum: ROLES,
        required: true
      },
      provider: {
        type: String,
        enum: ["LOCAL", "GOOGLE"],
        default: "LOCAL"
      }
    },
    { timestamps: true }
  )
);






// const mongoose = require("mongoose");

// module.exports = mongoose.model(
//   "User",
//   new mongoose.Schema({
//     name: String,
//     email: { type: String, unique: true },
//     password: String,
//     role: { type: String, default: "ADMIN" }
//   }, { timestamps: true })
// );
