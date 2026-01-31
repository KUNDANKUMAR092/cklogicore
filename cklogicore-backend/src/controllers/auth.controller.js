// src/controller/auth.controller.js

import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Account from "../models/account.model.js";
import Staff from "../models/staff.model.js"; // Staff login ke liye
import RefreshToken from "../models/refreshToken.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= REGISTER (Only for Owners) ================= */
export const register = catchAsync(async (req, res) => {
  const { name, email, password, accountType } = req.body;

  const exists = await Account.findOne({ email }).lean();
  if (exists) return res.status(400).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 12);
  
  const account = await Account.create({
    name,
    email,
    password: hashed, // Password ab seedha Account model mein hi save hoga
    accountType,
    role: "OWNER"
  });

  res.status(201).json({ success: true, message: "Account created successfully" });
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

  // 3. Tokens generate karein
  const accessToken = generateAccessToken({ 
    userId: user._id, 
    accountId: isStaff ? user.accountId : user._id, 
    role: user.role,
    accountType: isStaff ? "STAFF" : user.accountType 
  });

  const refreshToken = generateRefreshToken({ userId: user._id });

  // 4. Save Refresh Token in DB
  await RefreshToken.create({ 
    userId: user._id, 
    token: refreshToken, 
    expiresAt: new Date(Date.now() + 7 * 86400000) 
  });

  // 5. HTTP-Only Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  res.json({ 
    success: true,
    accessToken, 
    user: { id: user._id, name: user.name, role: user.role, accountType: isStaff ? "STAFF" : user.accountType } 
  });
});

/* ================= REFRESH TOKEN ================= */
export const refreshToken = catchAsync(async (req, res) => {
  const oldToken = req.cookies.refreshToken;
  if (!oldToken) return res.status(403).json({ message: "No refresh token" });

  const stored = await RefreshToken.findOneAndDelete({ token: oldToken });
  
  if (!stored) {
    const decoded = jwt.decode(oldToken);
    if (decoded) await RefreshToken.deleteMany({ userId: decoded.userId });
    return res.status(403).json({ message: "Security Alert: Please login again." });
  }

  const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
  
  // Dhoondo ki owner hai ya staff
  let user = await Account.findById(decoded.userId).lean() || await Staff.findById(decoded.userId).lean();

  if (!user || !user.isActive) return res.status(403).json({ message: "Account blocked" });

  const newAccessToken = generateAccessToken({ 
    userId: user._id, 
    role: user.role,
    accountId: user.accountId || user._id 
  });
  const newRefreshToken = generateRefreshToken({ userId: user._id });

  await RefreshToken.create({ 
    userId: user._id, 
    token: newRefreshToken, 
    expiresAt: new Date(Date.now() + 7 * 86400000) 
  });

  res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken: newAccessToken });
});

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  // Owner ya Staff kisi ka bhi email ho sakta hai
  const user = await Account.findOne({ email }) || await Staff.findOne({ email });

  if (user) {
    const reset = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(reset).digest("hex");
    
    // Model update (Dono models mein ye fields honi chahiye)
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60000;
    
    // Yahan hum save logic manually handle kar rahe kyunki user kisi bhi model ka ho sakta hai
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
  
  // Update password and clear reset fields
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


















// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import Account from "../models/account.model.js";
// import User from "../models/user.model.js";
// import RefreshToken from "../models/refreshToken.model.js";
// import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
// import { sendEmail } from "../utils/email.js";

// // Try-catch likhne ki zaroorat nahi padegi
// const catchAsync = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// /* ================= REGISTER ================= */
// export const register = catchAsync(async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { name, email, password, accountType } = req.body;
//     const exists = await Account.findOne({ email }).lean();
//     if (exists) return res.status(400).json({ message: "This email is already registered as a " + exists.accountType  });

//     const account = await Account.create([{ name, email, accountType }], { session });
//     const hashed = await bcrypt.hash(password, 12);
//     await User.create([{ accountId: account[0]._id, name, email, password: hashed, role: "OWNER" }], { session });

//     await session.commitTransaction();
//     res.status(201).json({ success: true, message: "Account created" });
//   } catch (err) {
//     await session.abortTransaction();
//     throw err;
//   } finally { session.endSession(); }
// });

// /* ================= LOGIN ================= */
// export const login = catchAsync(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email, isActive: true }).select("+password").lean();
  
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const account = await Account.findById(user.accountId).lean();
//   const accessToken = generateAccessToken({ userId: user._id, role: user.role, accountType: account.accountType });
//   const refreshToken = generateRefreshToken({ userId: user._id });

//   await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 86400000) });

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000 
//   });

//   res.json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
// });

// /* ================= REFRESH ================= */
// export const refreshToken = catchAsync(async (req, res) => {
//   const oldToken = req.cookies.refreshToken;
//   if (!oldToken) return res.status(403).json({ message: "No refresh token" });

//   const stored = await RefreshToken.findOneAndDelete({ token: oldToken });
  
//   // THEFT DETECTION: Agar DB mein nahi mila matlab token reuse ho raha hai
//   if (!stored) {
//     const decoded = jwt.decode(oldToken);
//     if (decoded) await RefreshToken.deleteMany({ userId: decoded.userId });
//     return res.status(403).json({ message: "Security Alert: Token reuse detected!" });
//   }

//   const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
//   const user = await User.findById(decoded.userId).lean();
//   if (!user || !user.isActive) return res.status(403).json({ message: "User blocked" });

//   const newAccessToken = generateAccessToken({ userId: user._id, role: user.role });
//   const newRefreshToken = generateRefreshToken({ userId: user._id });

//   await RefreshToken.create({ userId: user._id, token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 86400000) });

//   res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
//   res.json({ accessToken: newAccessToken });
// });

// /* ================= LOGOUT ================= */
// export const logout = catchAsync(async (req, res) => {
//   const token = req.cookies.refreshToken;
//   if (token) await RefreshToken.deleteOne({ token });
//   res.clearCookie("refreshToken");
//   res.json({ message: "Logged out" });
// });

// /* ================= FORGOT ================= */
// export const forgotPassword = catchAsync(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (user) {
//     const reset = crypto.randomBytes(32).toString("hex");
//     user.resetPasswordToken = crypto.createHash("sha256").update(reset).digest("hex");
//     user.resetPasswordExpires = Date.now() + 15 * 60000;
//     await user.save();
//     await sendEmail({ to: user.email, subject: "Reset Password", text: `Reset: ${process.env.FRONTEND_URL}/reset/${reset}` });
//   }
//   res.json({ message: "If email exists, link sent" });
// });

// /* ================= RESET PASSWORD ================= */
// export const resetPassword = catchAsync(async (req, res) => {
//   const { token } = req.params; // Reset token URL se aayega
//   const { password } = req.body;

//   // 1. URL wale token ko hash karein (kyunki DB mein hashed version save hai)
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");

//   // 2. User dhundo jiska token valid ho aur expire na hua ho
//   const user = await User.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpires: { $gt: Date.now() }, // Check if not expired
//   });

//   if (!user) {
//     return res.status(400).json({ message: "Invalid or expired reset token" });
//   }

//   // 3. Naya password hash karein aur save karein
//   user.password = await bcrypt.hash(password, 12);
  
//   // 4. Reset fields clear karein taaki token dobara use na ho sake
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;
  
//   await user.save();

//   // 5. Purane saare refresh tokens delete kar dein (Security: Sab jagah se logout)
//   await RefreshToken.deleteMany({ userId: user._id });

//   res.json({ success: true, message: "Password reset successful. Please login." });
// });


















// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import mongoose from "mongoose";

// import Account from "../models/account.model.js";
// import User from "../models/user.model.js";
// import RefreshToken from "../models/refreshToken.model.js";

// import jwt from "jsonwebtoken";

// import {
//   generateAccessToken,
//   generateRefreshToken
// } from "../utils/jwt.js";

// import { sendEmail } from "../utils/email.js";


// /* ================= REGISTER ================= */
// export const register = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { name, email, password, accountType } = req.body;

//     if (!password || password.length < 8) {
//       return res.status(400).json({ message: "Password must be 8+ characters" });
//     }

//     // Performance: .lean() for faster existence check
//     const exists = await Account.findOne({ email }).lean();
//     if (exists) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     const account = await Account.create([{
//       name,
//       email,
//       accountType,
//       isActive: true
//     }], { session });

//     const hashed = await bcrypt.hash(password, 12);

//     const owner = await User.create([{
//       accountId: account[0]._id,
//       name,
//       email,
//       password: hashed,
//       role: "OWNER",
//       isActive: true
//     }], { session });

//     await session.commitTransaction();

//     res.status(201).json({
//       success: true,
//       message: "Account created",
//       user: { 
//         id: owner[0]._id, 
//         name: owner[0].name,
//         email: owner[0].email,
//         role: owner[0].role,
//       }
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     console.error(err);
//     res.status(500).json({ message: "Registration failed" });
//   } finally {
//     session.endSession();
//   }
// };

// /* ================= LOGIN ================= */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Performance: .lean() use karein fetch queries ke liye
//     const account = await Account.findOne({ email, isActive: true }).lean();
//     if (!account) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const user = await User.findOne({ 
//       email, 
//       accountId: account._id, 
//       isActive: true 
//     }).select("+password").lean();

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const payload = {
//       userId: user._id,
//       accountId: user.accountId,
//       role: user.role,
//       permissions: user.permissions,
//       accountType: account.accountType // Managed via account object
//     };

//     const accessToken = generateAccessToken(payload);
//     const refreshToken = generateRefreshToken({ userId: user._id });

//     // DB mein refresh token save karein
//     await RefreshToken.create({
//       userId: user._id,
//       token: refreshToken,
//       expiresAt: new Date(Date.now() + 7 * 86400000)
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000 
//     });

//     res.json({
//       accessToken,
//       user: { id: user._id, name: user.name, role: user.role }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Login failed" });
//   }
// };

// /* ================= REFRESH ================= */
// export const refreshToken = async (req, res) => {
//   try {
//     const cookieToken = req.cookies.refreshToken;
//     if (!cookieToken) return res.status(403).json({ message: "Invalid token" });

//     const stored = await RefreshToken.findOne({ token: cookieToken });
//     if (!stored) return res.status(403).json({ message: "Invalid token" });

//     const decoded = jwt.verify(cookieToken, process.env.JWT_REFRESH_SECRET);

//     // FIX: Hamein User ke sath Account bhi chahiye taaki accountType mil sake
//     const user = await User.findById(decoded.userId).lean();
//     const account = await Account.findById(user?.accountId).lean();
    
//     if (!user || !user.isActive || !account || !account.isActive) {
//         return res.status(403).json({ message: "User not authorized" });
//     }

//     // Payload integrity check: Ensure all keys are passed back
//     const accessToken = generateAccessToken({
//       userId: user._id,
//       accountId: user.accountId,
//       role: user.role,
//       permissions: user.permissions,
//       accountType: account.accountType, // Fixed: Isse pehle error aa raha hota
//     });

//     res.json({ accessToken });

//   } catch (err) {
//     res.status(403).json({ message: "Expired token" });
//   }
// };

// /* ================= LOGOUT ================= */
// export const logout = async (req, res) => {
//   try {
//     const cookieToken = req.cookies.refreshToken;

//     if (cookieToken) {
//       await RefreshToken.deleteOne({ token: cookieToken });
//     }

//     // Cookie clear karna zaroori hai
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       sameSite: "strict"
//     });

//     res.json({ message: "Logged out" });
//   } catch {
//     res.status(500).json({ message: "Logout failed" });
//   }
// };


// /* ================= FORGOT ================= */

// export const forgotPassword = async (req, res) => {

//   try {

//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (user) {

//       const reset = crypto.randomBytes(32).toString("hex");

//       user.resetPasswordToken = crypto
//         .createHash("sha256")
//         .update(reset)
//         .digest("hex");

//       user.resetPasswordExpires = Date.now() + 15 * 60000;

//       await user.save();

//       await sendEmail({
//         to: user.email,
//         subject: "Reset Password",
//         text: `Reset: ${process.env.FRONTEND_URL}/reset/${reset}`
//       });
//     }

//     res.json({
//       message: "If email exists, link sent"
//     });

//   } catch {
//     res.status(500).json({ message: "Failed" });
//   }
// };





















// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// import Account from "../models/account.model.js";
// import User from "../models/user.model.js";
// import { generateToken } from "../utils/jwt.js";
// import { sendEmail } from "../utils/email.js";


// /* =====================================================
//    REGISTER (Create Account + Owner)
// ===================================================== */

// export const register = async (req, res) => {
//   try {
//     const { name, email, password, accountType } = req.body;

//     /* Check email exists */

//     const existingAccount = await Account.findOne({ email });

//     if (existingAccount) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered"
//       });
//     }

//     /* Create Account */

//     const account = await Account.create({
//       name,
//       email,
//       accountType
//     });

//     /* Hash password */

//     const hashedPassword = await bcrypt.hash(password, 12);

//     /* Create OWNER */

//     const owner = await User.create({
//       accountId: account._id,
//       name,
//       email,
//       password: hashedPassword,
//       role: "OWNER",

//       permissions: {
//         supplier: { create: true, read: true, update: true, delete: true },
//         company: { create: true, read: true, update: true, delete: true },
//         vehicle: { create: true, read: true, update: true, delete: true },
//         trip: { create: true, read: true, update: true, delete: true }
//       }
//     });

//     res.status(201).json({
//       success: true,
//       message: "Account created successfully",
//       account,
//       owner
//     });

//   } catch (error) {
//     console.error("REGISTER ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Registration failed"
//     });
//   }
// };



// /* =====================================================
//    LOGIN (Email + Password only)
// ===================================================== */

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     /* Find Account */

//     const account = await Account.findOne({ email });

//     if (!account) {
//       return res.status(401).json({
//         success: false,
//         message: "Account not found"
//       });
//     }

//     /* Find User */

//     const user = await User.findOne({
//       email,
//       accountId: account._id,
//       isActive: true
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     /* Compare password */

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     /* Generate Token */

//     const token = generateToken({
//       userId: user._id,
//       accountId: user.accountId,
//       role: user.role,
//       permissions: user.permissions,
//       accountType: account.accountType
//     });

//     res.json({
//       success: true,
//       token,
//       user,
//       accountType: account.accountType
//     });

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Login failed"
//     });
//   }
// };



// /* =====================================================
//    FORGOT PASSWORD
// ===================================================== */

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     /* Generate token */

//     const resetToken = crypto.randomBytes(32).toString("hex");

//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

//     await user.save();

//     /* Send email */

//     const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

//     await sendEmail({
//       to: user.email,
//       subject: "Reset Password",
//       text: `Reset your password: ${resetUrl}`
//     });

//     res.json({
//       success: true,
//       message: "Reset link sent"
//     });

//   } catch (error) {
//     console.error("FORGOT ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to send email"
//     });
//   }
// };



// /* =====================================================
//    RESET PASSWORD
// ===================================================== */

// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     /* Hash token */

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     /* Find user */

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired token"
//       });
//     }

//     /* Update password */

//     user.password = await bcrypt.hash(password, 12);

//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({
//       success: true,
//       message: "Password updated"
//     });

//   } catch (error) {
//     console.error("RESET ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Reset failed"
//     });
//   }
// };






























// import User from "../models/user.model.js";
// import RefreshToken from "../models/refreshToken.model.js";
// import bcrypt from "bcryptjs";
// import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import { sendEmail } from "../utils/email.js";
// import { ROLES } from "../constants/roles.js";


// /**
//  * =====================
//  * REGISTER
//  * =====================
//  */
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, accountType } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       accountType,               // 🔥 business type
//       accountId: new mongoose.Types.ObjectId(), // 🔥 new Account
//       role: ROLES.ADMIN          // 🔥 first user always admin
//     });

//     res.status(201).json({ message: "User registered successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// /**
//  * =====================
//  * LOGIN
//  * =====================
//  */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1️⃣ Find user by email
//     const user = await User.findOne({ email });
//     let userType = "ADMIN";

//     // If not admin, check staff
//     if (!user) {
//       user = await UserStaff.findOne({
//         email,
//         isDeleted: false
//       });

//       userType = "STAFF";
//     }

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     // Staff active check
//     if (userType === "STAFF" && !user.isActive) {
//       return res.status(403).json({
//         success: false,
//         message: "Your account is inactive"
//       });
//     }

//     // 2️⃣ Compare password
//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     // 3️⃣ Generate JWT
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         accountId: user.accountId,
//         role: userType === "ADMIN" ? user.role : "STAFF",
//         type: userType,
//         permissions: user.permissions || {}
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       success: true,
//       token,
//       userType,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: userType === "ADMIN" ? user.role : "STAFF",
//         accountId: user.accountId,
//         permissions: user.permissions || {}
//       }
//     });

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// /**
//  * =====================
//  * REFRESH TOKEN
//  * =====================
//  */
// export const refreshAccessToken = async (req, res) => {
//   try {

//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return res.status(401).json({
//         success: false,
//         message: "Token required"
//       });
//     }


//     const stored = await RefreshToken.findOne({ token: refreshToken });

//     if (!stored) {
//       return res.status(403).json({
//         success: false,
//         message: "Invalid refresh token"
//       });
//     }


//     jwt.verify(
//       refreshToken,
//       process.env.JWT_REFRESH_SECRET,
//       async (err, decoded) => {

//         if (err) {
//           return res.status(403).json({
//             success: false,
//             message: "Expired refresh token"
//           });
//         }

//         const user = await User.findById(decoded.id);

//         const newAccessToken = generateAccessToken(user);

//         res.json({
//           success: true,
//           accessToken: newAccessToken
//         });
//       }
//     );

//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Refresh failed"
//     });
//   }
// };



// /**
//  * =====================
//  * LOGOUT
//  * =====================
//  */
// export const logout = async (req, res) => {
//   try {
//     // No DB operation needed for JWT logout
//     res.status(200).json({
//       success: true,
//       message: "Logged out successfully"
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Logout failed"
//     });
//   }
// };

// /**
//  * =========================
//  * FORGOT PASSWORD
//  * =========================
//  */
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // generate token
//     const resetToken = user.createPasswordResetToken();

//     await user.save({ validateBeforeSave: false });

//     // reset link
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     const message = `You requested a password reset. Click here: ${resetUrl} This link will expire in 15 minutes.`;

//     await sendEmail({
//       to: user.email,
//       subject: "Password Reset",
//       text: message
//     });

//     res.status(200).json({
//       success: true,
//       message: "Reset link sent to email"
//     });

//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };


// /**
//  * =========================
//  * RESET PASSWORD
//  * =========================
//  */
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     // hash token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");


//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() }
//     });


//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Token invalid or expired"
//       });
//     }

//     // update password
//     user.password = password;

//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Password reset successful"
//     });

//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

