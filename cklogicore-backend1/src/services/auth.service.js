const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ROLES = ["ADMIN", "COMPANY_OWNER", "VEHICLE_OWNER", "SUPPLIER_OWNER"];

/* =========================
   NORMAL SIGNUP
========================= */
exports.register = async ({ name, email, password, role }) => {
  if (!ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    provider: "LOCAL"
  });

  return user;
};

/* =========================
   NORMAL LOGIN
========================= */
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  if (user.provider === "GOOGLE") {
    throw new Error("Please login using Google");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

/* =========================
   GOOGLE SIGNUP
========================= */
exports.googleSignup = async (idToken, role) => {
  if (!ROLES.includes(role)) {
    throw new Error("Role is required");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email, name } = ticket.getPayload();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists, please login");
  }

  const user = await User.create({
    name,
    email,
    role,
    provider: "GOOGLE"
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

/* =========================
   GOOGLE LOGIN
========================= */
exports.googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email } = ticket.getPayload();

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found, please signup first");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};


/* =========================
   LOGOUT
========================= */
exports.logout = async (refreshToken) => {
  if (!refreshToken) return;

  await RefreshToken.updateOne(
    { token: refreshToken },
    { isRevoked: true }
  );
};

/* =========================
   LOGOUT ALL DEVICE
========================= */
exports.logoutAll = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId },
    { isRevoked: true }
  );
};



/* =========================
   REFRESH TOKEN
========================= */

exports.refreshTokens = async (oldToken) => {
  const storedToken = await RefreshToken.findOne({ token: oldToken });

  if (!storedToken || storedToken.isRevoked) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  // 🔥 ROTATION
  storedToken.isRevoked = true;
  await storedToken.save();

  const user = await User.findById(storedToken.user);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await saveRefreshToken(user, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

