import Account from "../models/account.model.js";
import Staff from "../models/staff.model.js";
import SupplierOwner from "../models/supplierOwner.model.js";
import CompanyOwner from "../models/companyOwner.model.js";
import VehicleOwner from "../models/vehicleOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import fs from "fs";
import bcrypt from "bcryptjs";
import { flattenObject } from "../utils/flattenObject.js";

const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const getModel = (role) => (role === "STAFF" ? Staff : Account);

// 1. GET MY PROFILE (Personal + Business Entity ID)
export const getMyProfile = catchAsync(async (req, res) => {
  const { userId, accountId, accountType, role } = req.user;
  const Model = getModel(role);
  
  const user = await Model.findById(userId).select("-password").lean();
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  let entityId = null;
  let businessDetails = null;
  const searchId = accountId || userId;

  // Search for linked business profile
  if (accountType === ACCOUNT_TYPES.SUPPLIER) {
    businessDetails = await SupplierOwner.findOne({ accountId: searchId, isDeleted: false }).lean();
  } else if (accountType === ACCOUNT_TYPES.COMPANY) {
    businessDetails = await CompanyOwner.findOne({ accountId: searchId, isDeleted: false }).lean();
  } else if (accountType === ACCOUNT_TYPES.VEHICLE) {
    businessDetails = await VehicleOwner.findOne({ accountId: searchId, isDeleted: false }).lean();
  }

  res.json({ 
    success: true, 
    data: { 
      ...user, 
      entityId: businessDetails ? businessDetails._id : null,
      businessDetails // Sending full business details if they exist
    } 
  });
});

// 2. UPDATE PERSONAL PROFILE (Account Table)
export const updateProfile = catchAsync(async (req, res) => {
  const Model = getModel(req.user.role);
  let updateData = { ...req.body };
  
  delete updateData.password;
  delete updateData.email; 
  delete updateData.role;
  delete updateData.accountType;
  delete updateData._id;

  const flattenedData = flattenObject(updateData);

  const updatedUser = await Model.findByIdAndUpdate(
    req.user.userId,
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).select("-password");

  res.json({ success: true, message: "Personal profile updated", data: updatedUser });
});

// 3. 🔥 UPDATE BUSINESS PROFILE (Supplier/Company/Vehicle Table)
// Jab user extra details (GST, Address) bharega tab ye use hoga
export const updateBusinessProfile = catchAsync(async (req, res) => {
  const { accountType, accountId, userId } = req.user;
  const updateData = { ...req.body };
  const searchId = accountId || userId;

  let updatedBusiness = null;

  if (accountType === ACCOUNT_TYPES.SUPPLIER) {
    updatedBusiness = await SupplierOwner.findOneAndUpdate(
      { accountId: searchId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  } else if (accountType === ACCOUNT_TYPES.COMPANY) {
    updatedBusiness = await CompanyOwner.findOneAndUpdate(
      { accountId: searchId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  } else if (accountType === ACCOUNT_TYPES.VEHICLE) {
    updatedBusiness = await VehicleOwner.findOneAndUpdate(
      { accountId: searchId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  if (!updatedBusiness) {
    return res.status(404).json({ success: false, message: "Business profile not found" });
  }

  res.json({ success: true, message: "Business details updated", data: updatedBusiness });
});

// 4. Update Avatar
export const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided" });
  const Model = getModel(req.user.role);
  const user = await Model.findById(req.user.userId);

  if (user.avatar && fs.existsSync(user.avatar)) {
    try { fs.unlinkSync(user.avatar); } catch (err) { console.error(err); }
  }

  user.avatar = req.file.path.replace(/\\/g, "/");
  await user.save();
  res.json({ success: true, avatarUrl: user.avatar });
});

// 5. Update Banner
export const updateBanner = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No banner provided" });
  const Model = getModel(req.user.role);
  const user = await Model.findById(req.user.userId);

  if (user.bannerImage && fs.existsSync(user.bannerImage)) {
    try { fs.unlinkSync(user.bannerImage); } catch (err) { console.error(err); }
  }

  user.bannerImage = req.file.path.replace(/\\/g, "/");
  await user.save();
  res.json({ success: true, bannerUrl: user.bannerImage });
});

// 6. Change Password
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const Model = getModel(req.user.role);
  const user = await Model.findById(req.user.userId).select("+password");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect current password" });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: "Password updated successfully" });
});

// 7. Deactivate Account
export const deactivateAccount = catchAsync(async (req, res) => {
  const Model = getModel(req.user.role);
  await Model.findByIdAndUpdate(req.user.userId, { isActive: false, isDeactivated: true });
  res.json({ success: true, message: "Account deactivated" });
});


























// import Account from "../models/account.model.js";
// import Staff from "../models/staff.model.js";
// // 🆕 Naye imports takki Entity ID dhund saken
// import SupplierOwner from "../models/supplierOwner.model.js";
// import CompanyOwner from "../models/companyOwner.model.js";
// import VehicleOwner from "../models/vehicleOwner.model.js";
// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

// import fs from "fs";
// import bcrypt from "bcryptjs";
// import { flattenObject } from "../utils/flattenObject.js";

// const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// const getModel = (role) => (role === "STAFF" ? Staff : Account);

// // ================= 1. GET MY PROFILE (Updated with Entity ID) =================
// export const getMyProfile = catchAsync(async (req, res) => {
//   const { userId, accountId, accountType, role } = req.user;
//   const Model = getModel(role);
  
//   // Basic Account info
//   const user = await Model.findById(userId).select("-password").lean();
//   if (!user) {
//     return res.status(404).json({ success: false, message: "User not found" });
//   }

//   // 🔥 logic: Login user ke hisab se uski Business Profile ki ID nikalna
//   let entityId = null;
  
//   if (accountType === ACCOUNT_TYPES.SUPPLIER) {
//     const supplier = await SupplierOwner.findOne({ accountId, isDeleted: false });
//     entityId = supplier ? supplier._id : null;
//   } 
//   else if (accountType === ACCOUNT_TYPES.COMPANY) {
//     const company = await CompanyOwner.findOne({ accountId, isDeleted: false });
//     entityId = company ? company._id : null;
//   } 
//   else if (accountType === ACCOUNT_TYPES.VEHICLE) {
//     const vehicle = await VehicleOwner.findOne({ accountId, isDeleted: false });
//     entityId = vehicle ? vehicle._id : null;
//   }

//   // Response mein user data ke sath entityId merge kar di
//   res.json({ 
//     success: true, 
//     data: { 
//       ...user, 
//       entityId 
//     } 
//   });
// });

// // ================= 2. UPDATE PROFILE DETAILS (No Change) =================
// export const updateProfile = catchAsync(async (req, res) => {
//   const Model = getModel(req.user.role);
//   let updateData = { ...req.body };
  
//   delete updateData.password;
//   delete updateData.email; 
//   delete updateData.role;
//   delete updateData.accountType;
//   delete updateData._id;

//   const flattenedData = flattenObject(updateData);

//   const updatedUser = await Model.findByIdAndUpdate(
//     req.user.userId,
//     { $set: flattenedData },
//     { new: true, runValidators: true }
//   ).select("-password");

//   if (!updatedUser) {
//     return res.status(404).json({ success: false, message: "User not found" });
//   }

//   res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
// });

// // 3. Update Avatar (Profile Picture)
// export const updateAvatar = catchAsync(async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No image provided" });

//   const Model = getModel(req.user.role);
//   const user = await Model.findById(req.user.userId);

//   if (!user) return res.status(404).json({ message: "User not found" });

//   // Delete old avatar file from server if it exists
//   if (user.avatar && fs.existsSync(user.avatar)) {
//     try {
//       fs.unlinkSync(user.avatar);
//     } catch (err) {
//       console.error("Error deleting old avatar:", err);
//     }
//   }

//   user.avatar = req.file.path;
//   await user.save();

//   res.json({ 
//     success: true, 
//     message: "Profile picture updated", 
//     avatarUrl: user.avatar 
//   });
// });

// // 4. Update Banner Image (NEW Field Support)
// export const updateBanner = catchAsync(async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No banner image provided" });

//   const Model = getModel(req.user.role);
//   const user = await Model.findById(req.user.userId);

//   if (!user) return res.status(404).json({ message: "User not found" });

//   // Delete old banner file from server if it exists
//   if (user.bannerImage && fs.existsSync(user.bannerImage)) {
//     try {
//       fs.unlinkSync(user.bannerImage);
//     } catch (err) {
//       console.error("Error deleting old banner:", err);
//     }
//   }

//   user.bannerImage = req.file.path;
//   await user.save();

//   res.json({ 
//     success: true, 
//     message: "Banner image updated successfully", 
//     bannerUrl: user.bannerImage 
//   });
// });

// // 5. Change Password
// export const changePassword = catchAsync(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   if (!oldPassword || !newPassword) {
//     return res.status(400).json({ message: "Both old and new passwords are required" });
//   }

//   const Model = getModel(req.user.role);
//   // Force select password because it might be hidden in schema
//   const user = await Model.findById(req.user.userId).select("+password");

//   if (!user) return res.status(404).json({ message: "User not found" });

//   // Verify old password
//   const isMatch = await bcrypt.compare(oldPassword, user.password);
//   if (!isMatch) {
//     return res.status(401).json({ message: "Incorrect current password" });
//   }

//   // Hash new password and save
//   user.password = await bcrypt.hash(newPassword, 12);
//   await user.save();

//   res.json({ success: true, message: "Password updated successfully" });
// });

// // 6. Deactivate Account
// export const deactivateAccount = catchAsync(async (req, res) => {
//   const Model = getModel(req.user.role);
  
//   const user = await Model.findByIdAndUpdate(
//     req.user.userId, 
//     { 
//       $set: { isActive: false, isDeactivated: true } 
//     },
//     { new: true }
//   );

//   if (!user) return res.status(404).json({ message: "User not found" });

//   res.json({ 
//     success: true, 
//     message: "Account deactivated successfully. You can contact support to reactivate." 
//   });
// });







// import Account from "../models/account.model.js";
// import Staff from "../models/staff.model.js";
// import fs from "fs";
// import bcrypt from "bcryptjs";

// const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// // Helper function to get correct model
// const getModel = (type) => (type === "STAFF" ? Staff : Account);

// // 1. Get My Profile
// export const getMyProfile = catchAsync(async (req, res) => {
//   const Model = getModel(req.user.accountType);
//   const user = await Model.findById(req.user.userId).select("-password");
//   res.json({ success: true, data: user });
// });

// // 2. Update Profile Details
// export const updateProfile = catchAsync(async (req, res) => {
//   const { name, mobile, address, bio } = req.body;
//   const Model = getModel(req.user.accountType);

//   const updatedUser = await Model.findByIdAndUpdate(
//     req.user.userId,
//     { $set: { name, mobile, address, bio } },
//     { new: true, runValidators: true }
//   ).select("-password");

//   res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
// });

// // 3. Update Avatar
// export const updateAvatar = catchAsync(async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No image provided" });

//   const Model = getModel(req.user.accountType);
//   const user = await Model.findById(req.user.userId);

//   if (user.avatar && fs.existsSync(user.avatar)) {
//     fs.unlinkSync(user.avatar);
//   }

//   user.avatar = req.file.path;
//   await user.save();

//   res.json({ success: true, avatarUrl: user.avatar });
// });

// // 4. Change Password
// export const changePassword = catchAsync(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   const Model = getModel(req.user.accountType);
//   const user = await Model.findById(req.user.userId).select("+password");

//   const isMatch = await bcrypt.compare(oldPassword, user.password);
//   if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

//   user.password = await bcrypt.hash(newPassword, 12);
//   await user.save();

//   res.json({ success: true, message: "Password updated successfully" });
// });

// // 5. Deactivate Account
// export const deactivateAccount = catchAsync(async (req, res) => {
//   const Model = getModel(req.user.accountType);
//   await Model.findByIdAndUpdate(req.user.userId, { isActive: false });
//   res.json({ success: true, message: "Account deactivated successfully" });
// });