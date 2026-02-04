// src/controller/auth.controller.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Account from "../models/account.model.js";
import Staff from "../models/staff.model.js"; 
import SupplierOwner from "../models/supplierOwner.model.js"; // 🆕 Added
import CompanyOwner from "../models/companyOwner.model.js";   // 🆕 Added
import VehicleOwner from "../models/vehicleOwner.model.js";   // 🆕 Added
import RefreshToken from "../models/refreshToken.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 🆕 Helper function to find Entity ID based on account type
const getEntityId = async (accountId, accountType) => {
  let entity = null;
  if (accountType === "SUPPLIER") {
    entity = await SupplierOwner.findOne({ accountId, isDeleted: false });
  } else if (accountType === "COMPANY") {
    entity = await CompanyOwner.findOne({ accountId, isDeleted: false });
  } else if (accountType === "VEHICLE") {
    entity = await VehicleOwner.findOne({ accountId, isDeleted: false });
  }
  return entity ? entity._id : null;
};

export const register = catchAsync(async (req, res) => {

  const { name, email, password, accountType, mobile } = req.body;

  // 1. DYNAMIC CONFLICT CHECK (Handles Corrupted/Missing Data)
  const query = { $or: [] };
  if (email) query.$or.push({ email });
  if (mobile) query.$or.push({ mobile });

  const exists = await Account.findOne(query).lean();

  if (exists) {
    const isEmailMatch = email && exists.email && exists.email === email;
    const isMobileMatch = mobile && exists.mobile && exists.mobile === mobile;

    if (isEmailMatch || isMobileMatch) {
      return res.status(400).json({ 
        success: false, 
        message: isEmailMatch ? "Email already registered" : "Mobile number already registered" 
      });
    }
  }

  // 2. HASH PASSWORD
  const hashed = await bcrypt.hash(password, 12);
  
  // 3. CREATE ACCOUNT
  const account = await Account.create({
    name, email, mobile: mobile, password: hashed, accountType, role: "OWNER"
  });

  // 4. SAFE PROFILE CREATION (Using Try-Catch to prevent crashes)
  try {
    let entityId = null;
    const profileData = { name, mobile, accountId: account._id, createdBy: account._id };

    if (accountType === "SUPPLIER") {
      const supplier = await SupplierOwner.create(profileData);
      entityId = supplier._id;
    } else if (accountType === "COMPANY") {
      const company = await CompanyOwner.create(profileData);
      entityId = company._id;
    } else if (accountType === "VEHICLE") {
      const vehicle = await VehicleOwner.create(profileData);
      entityId = vehicle._id;
    }

    // Success Response
    const accountData = account.toObject();
    delete accountData.password;

    res.status(201).json({ 
      success: true, 
      message: `${accountType} account created successfully`, 
      data: { ...accountData, entityId } 
    });

  } catch (error) {
    // 🔥 CRITICAL: Agar profile nahi bani, toh bane hue account ko delete karo
    // Taaki database mein "aadhe-adhure" records na rahein
    await Account.findByIdAndDelete(account._id);
    
    console.error("CRASH PREVENTED: Profile creation failed ->", error.message);
    
    res.status(400).json({ 
      success: false, 
      message: "Registration failed during profile setup: " + error.message 
    });
  }
});

/* ================= LOGIN (Owner & Staff Dono ke liye) ================= */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // 1. Pehle Account model mein owner ko dhoondo
  let user = await Account.findOne({ email, isActive: true }).select("+password").lean();
  let isStaff = false;

  // 2. Agar Account mein nahi mila, toh Staff model mein dhoondo
  if (!user) {
    user = await Staff.findOne({ email, isActive: true }).select("+password").lean();
    isStaff = true;
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 3. 🔥 GET ENTITY ID (Only for non-staff or specific mappings)
  // Staff ke liye accountId wahi hota hai jo unke owner ka hai
  const searchId = isStaff ? user.accountId : user._id;
  const entityId = await getEntityId(searchId, isStaff ? "STAFF_OWNER_TYPE_LOGIC" : user.accountType);
  // Note: Staff logic ke liye aap user.accountType handle kar sakte hain as per your need.

  // 4. Tokens generate karein
  const accessToken = generateAccessToken({ 
    userId: user._id, 
    accountId: isStaff ? user.accountId : user._id, 
    role: user.role,
    accountType: isStaff ? "STAFF" : user.accountType ,
    entityId: user.entityId,
  });

  const refreshToken = generateRefreshToken({ userId: user._id });

  // 5. Save Refresh Token in DB
  await RefreshToken.create({ 
    userId: user._id, 
    token: refreshToken, 
    expiresAt: new Date(Date.now() + 7 * 86400000) 
  });

  // 6. HTTP-Only Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  res.json({ 
    success: true,
    accessToken,
    entityId, // 🆕 Sending entityId to frontend
    user: { 
      id: user._id, 
      name: user.name, 
      role: user.role, 
      accountType: isStaff ? "STAFF" : user.accountType 
    } 
  });
});

/* ================= REFRESH TOKEN ================= */
export const refreshToken = catchAsync(async (req, res) => {
  const oldToken = req.cookies.refreshToken;
  
  if (!oldToken) return res.status(403).json({ message: "No refresh token found" });

  // 1. Find the token (Delete mat karo turant)
  const stored = await RefreshToken.findOne({ token: oldToken });
  
  if (!stored) {
    // Agar token DB mein nahi hai, matlab shayad reuse attack hua hai ya pehle delete ho gaya
    return res.status(403).json({ message: "Security Alert: Please login again." });
  }

  try {
    // 2. Verify Token
    const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
    
    // 3. Get User
    let user = await Account.findById(decoded.userId).lean() || await Staff.findById(decoded.userId).lean();
    if (!user || !user.isActive) return res.status(403).json({ message: "Account blocked" });

    // 4. Generate New Tokens
    const newAccessToken = generateAccessToken({ 
      userId: user._id, 
      role: user.role,
      accountId: user.accountId || user._id,
      accountType: user.accountType || (user.role === "STAFF" ? "STAFF" : "OWNER"),
      entityId: user.entityId,
    });
    const newRefreshToken = generateRefreshToken({ userId: user._id });

    // 5. Update DB (Purana delete karein aur naya daalein)
    await RefreshToken.deleteOne({ _id: stored._id });
    await RefreshToken.create({ 
      userId: user._id, 
      token: newRefreshToken, 
      expiresAt: new Date(Date.now() + 7 * 86400000) 
    });

    // 6. Set Cookie & Response
    res.cookie("refreshToken", newRefreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax", // Strict se Lax behtar hai development ke liye
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({ 
      accessToken: newAccessToken, 
      user: { id: user._id, name: user.name, role: user.role, accountType: user.accountType }
    });

  } catch (err) {
    // Agar token expire ho gaya ho
    return res.status(403).json({ message: "Token expired or invalid" });
  }
});
// export const refreshToken = catchAsync(async (req, res) => {
//   const oldToken = req.cookies.refreshToken;
//   if (!oldToken) return res.status(403).json({ message: "No refresh token" });

//   const stored = await RefreshToken.findOneAndDelete({ token: oldToken });
  
//   if (!stored) {
//     const decoded = jwt.decode(oldToken);
//     if (decoded) await RefreshToken.deleteMany({ userId: decoded.userId });
//     return res.status(403).json({ message: "Security Alert: Please login again." });
//   }

//   const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
  
//   let user = await Account.findById(decoded.userId).lean() || await Staff.findById(decoded.userId).lean();

//   if (!user || !user.isActive) return res.status(403).json({ message: "Account blocked" });

//   const newAccessToken = generateAccessToken({ 
//     userId: user._id, 
//     role: user.role,
//     accountId: user.accountId || user._id 
//   });
//   const newRefreshToken = generateRefreshToken({ userId: user._id });

//   await RefreshToken.create({ 
//     userId: user._id, 
//     token: newRefreshToken, 
//     expiresAt: new Date(Date.now() + 7 * 86400000) 
//   });

//   res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
//   res.json({ 
//     accessToken: newAccessToken, 
//     user: { 
//       id: user._id, 
//       name: user.name, 
//       role: user.role, 
//       accountType: user.accountType 
//     }
//   });
// });

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  const user = await Account.findOne({ email }) || await Staff.findOne({ email });

  if (user) {
    const reset = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(reset).digest("hex");
    
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60000;
    
    if (user.accountType) await Account.findByIdAndUpdate(user._id, { resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: user.resetPasswordExpires });
    else await Staff.findByIdAndUpdate(user._id, { resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: user.resetPasswordExpires });

    await sendEmail({ 
      to: user.email, 
      subject: "Reset Password", 
      text: `Reset link: ${process.env.FRONTEND_URL}/reset/${reset}` 
    });
  }
  res.json({ message: "If account exists, email sent." });
});

/* ================= RESET PASSWORD ================= */
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  let user = await Account.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } }) 
             || await Staff.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const hashedPass = await bcrypt.hash(password, 12);
  
  if (user.accountType) {
    await Account.findByIdAndUpdate(user._id, { password: hashedPass, resetPasswordToken: undefined, resetPasswordExpires: undefined });
  } else {
    await Staff.findByIdAndUpdate(user._id, { password: hashedPass, resetPasswordToken: undefined, resetPasswordExpires: undefined });
  }

  await RefreshToken.deleteMany({ userId: user._id });
  res.json({ success: true, message: "Password updated." });
});

/* ================= LOGOUT ================= */
export const logout = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) await RefreshToken.deleteOne({ token });
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});
