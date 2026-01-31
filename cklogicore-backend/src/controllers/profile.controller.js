import Account from "../models/account.model.js";
import Staff from "../models/staff.model.js";
import fs from "fs";
import bcrypt from "bcryptjs";

const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Helper function to get correct model
const getModel = (type) => (type === "STAFF" ? Staff : Account);

// 1. Get My Profile
export const getMyProfile = catchAsync(async (req, res) => {
  const Model = getModel(req.user.accountType);
  const user = await Model.findById(req.user.userId).select("-password");
  res.json({ success: true, data: user });
});

// 2. Update Profile Details
export const updateProfile = catchAsync(async (req, res) => {
  const { name, mobile, address, bio } = req.body;
  const Model = getModel(req.user.accountType);

  const updatedUser = await Model.findByIdAndUpdate(
    req.user.userId,
    { $set: { name, mobile, address, bio } },
    { new: true, runValidators: true }
  ).select("-password");

  res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
});

// 3. Update Avatar
export const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided" });

  const Model = getModel(req.user.accountType);
  const user = await Model.findById(req.user.userId);

  if (user.avatar && fs.existsSync(user.avatar)) {
    fs.unlinkSync(user.avatar);
  }

  user.avatar = req.file.path;
  await user.save();

  res.json({ success: true, avatarUrl: user.avatar });
});

// 4. Change Password
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const Model = getModel(req.user.accountType);
  const user = await Model.findById(req.user.userId).select("+password");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

// 5. Deactivate Account
export const deactivateAccount = catchAsync(async (req, res) => {
  const Model = getModel(req.user.accountType);
  await Model.findByIdAndUpdate(req.user.userId, { isActive: false });
  res.json({ success: true, message: "Account deactivated successfully" });
});