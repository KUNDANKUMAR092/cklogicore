import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import { ROLES } from "../constants/roles.js";


/**
 * =====================
 * REGISTER
 * =====================
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      accountType,               // 🔥 business type
      accountId: new mongoose.Types.ObjectId(), // 🔥 new Account
      role: ROLES.ADMIN          // 🔥 first user always admin
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * =====================
 * LOGIN
 * =====================
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    let userType = "ADMIN";

    // If not admin, check staff
    if (!user) {
      user = await UserStaff.findOne({
        email,
        isDeleted: false
      });

      userType = "STAFF";
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Staff active check
    if (userType === "STAFF" && !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive"
      });
    }

    // 2️⃣ Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        accountId: user.accountId,
        role: userType === "ADMIN" ? user.role : "STAFF",
        type: userType,
        permissions: user.permissions || {}
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      userType,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userType === "ADMIN" ? user.role : "STAFF",
        accountId: user.accountId,
        permissions: user.permissions || {}
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/**
 * =====================
 * REFRESH TOKEN
 * =====================
 */
export const refreshAccessToken = async (req, res) => {
  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Token required"
      });
    }


    const stored = await RefreshToken.findOne({ token: refreshToken });

    if (!stored) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token"
      });
    }


    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {

        if (err) {
          return res.status(403).json({
            success: false,
            message: "Expired refresh token"
          });
        }

        const user = await User.findById(decoded.id);

        const newAccessToken = generateAccessToken(user);

        res.json({
          success: true,
          accessToken: newAccessToken
        });
      }
    );

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Refresh failed"
    });
  }
};



/**
 * =====================
 * LOGOUT
 * =====================
 */
export const logout = async (req, res) => {
  try {
    // No DB operation needed for JWT logout
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};

/**
 * =========================
 * FORGOT PASSWORD
 * =========================
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // generate token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You requested a password reset. Click here: ${resetUrl} This link will expire in 15 minutes.`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message
    });

    res.status(200).json({
      success: true,
      message: "Reset link sent to email"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/**
 * =========================
 * RESET PASSWORD
 * =========================
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");


    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });


    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token invalid or expired"
      });
    }

    // update password
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

