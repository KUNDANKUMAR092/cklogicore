// utils/token.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      accountId: user.accountId,

      // 🔥 BOTH ARE DIFFERENT
      accountType: user.accountType, // SUPPLIER / COMPANY / VEHICLE
      role: user.role                // ADMIN / STAFF
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// 🔹 NEW
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      accountId: user.accountId
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};


export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
