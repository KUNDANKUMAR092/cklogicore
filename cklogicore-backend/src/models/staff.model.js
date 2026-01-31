import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: String,
    password: { 
      type: String, 
      required: true, 
      // select: false 
    },
    accountId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Account", 
      required: true, 
      index: true 
    },
    role: { 
      type: String, 
      enum: ["MANAGER", "OPERATOR", "ACCOUNTANT"], 
      default: "OPERATOR" 
    },
    avatar: { type: String, default: "" }, 
    bio: { type: String, default: "" },
    // Yeh permissions middleware mein 'module' aur 'action' check karne ke kaam aati hain
    permissions: {
      canManageTrips: { type: Boolean, default: true },
      canViewReports: { type: Boolean, default: false },
      canExportExcel: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    // Reset Password fields (Jo humne auth controller mein use kiye hain)
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);





// import mongoose from "mongoose";

// const staffSchema = new mongoose.Schema({
//   accountId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Account", 
//     required: true, 
//     index: true 
//   },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   mobile: String,
//   role: { 
//     type: String, 
//     enum: ["MANAGER", "OPERATOR", "ACCOUNTANT", "CUSTOM"], 
//     default: "OPERATOR" 
//   },
//   // Specific Permissions Logic
//   permissions: {
//     canManageTrips: { type: Boolean, default: true },
//     canViewReports: { type: Boolean, default: false },
//     canExportExcel: { type: Boolean, default: false },
//     canManageStaff: { type: Boolean, default: false }
//   },
//   isActive: { type: Boolean, default: true },
//   isDeleted: { type: Boolean, default: false }
// }, { timestamps: true });

// export default mongoose.model("Staff", staffSchema);