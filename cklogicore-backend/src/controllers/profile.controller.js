import Account from "../models/account.model.js";
import Staff from "../models/staff.model.js";
import fs from "fs";
import bcrypt from "bcryptjs";
import { flattenObject } from "../utils/flattenObject.js";

const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Helper function to get correct model based on role
 * STAFF accounts typically point to a different collection
 */
const getModel = (role) => (role === "STAFF" ? Staff : Account);

// 1. Get My Profile
export const getMyProfile = catchAsync(async (req, res) => {
  const Model = getModel(req.user.role);
  const user = await Model.findById(req.user.userId).select("-password");
  
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  
  res.json({ success: true, data: user });
});

// 2. Update Profile Details (Including Mobile, Bio, Secondary Email & Nested Address)
export const updateProfile = catchAsync(async (req, res) => {
  const Model = getModel(req.user.role);
  
  // Clone request body to prevent direct mutation
  let updateData = { ...req.body };
  
  // 🛡️ Security: Protect core identity fields from being changed via this route
  delete updateData.password;
  delete updateData.email; 
  delete updateData.role;
  delete updateData.accountType;
  delete updateData._id;

  // 🚀 Flattening: "personalDetails.city" jaise nested fields ko handle karne ke liye
  const flattenedData = flattenObject(updateData);

  const updatedUser = await Model.findByIdAndUpdate(
    req.user.userId,
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({ 
    success: true, 
    message: "Profile updated successfully", 
    data: updatedUser 
  });
});

// 3. Update Avatar (Profile Picture)
export const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided" });

  const Model = getModel(req.user.role);
  const user = await Model.findById(req.user.userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Delete old avatar file from server if it exists
  if (user.avatar && fs.existsSync(user.avatar)) {
    try {
      fs.unlinkSync(user.avatar);
    } catch (err) {
      console.error("Error deleting old avatar:", err);
    }
  }

  user.avatar = req.file.path;
  await user.save();

  res.json({ 
    success: true, 
    message: "Profile picture updated", 
    avatarUrl: user.avatar 
  });
});

// 4. Update Banner Image (NEW Field Support)
export const updateBanner = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No banner image provided" });

  const Model = getModel(req.user.role);
  const user = await Model.findById(req.user.userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Delete old banner file from server if it exists
  if (user.bannerImage && fs.existsSync(user.bannerImage)) {
    try {
      fs.unlinkSync(user.bannerImage);
    } catch (err) {
      console.error("Error deleting old banner:", err);
    }
  }

  user.bannerImage = req.file.path;
  await user.save();

  res.json({ 
    success: true, 
    message: "Banner image updated successfully", 
    bannerUrl: user.bannerImage 
  });
});

// 5. Change Password
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Both old and new passwords are required" });
  }

  const Model = getModel(req.user.role);
  // Force select password because it might be hidden in schema
  const user = await Model.findById(req.user.userId).select("+password");

  if (!user) return res.status(404).json({ message: "User not found" });

  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  // Hash new password and save
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

// 6. Deactivate Account
export const deactivateAccount = catchAsync(async (req, res) => {
  const Model = getModel(req.user.role);
  
  const user = await Model.findByIdAndUpdate(
    req.user.userId, 
    { 
      $set: { isActive: false, isDeactivated: true } 
    },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ 
    success: true, 
    message: "Account deactivated successfully. You can contact support to reactivate." 
  });
});







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