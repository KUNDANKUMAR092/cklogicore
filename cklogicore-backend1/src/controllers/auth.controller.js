const service = require("../services/auth.service");
const jwt = require("jsonwebtoken");
const { accessToken } = require("../utils/token");

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const token = require("../utils/token");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  const { idToken, role } = req.body;

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { email, name } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      role, // 👈 frontend se selected role
      provider: "GOOGLE"
    });
  }

  const jwtPayload = {
    userId: user._id,
    role: user.role,
    name: user.name
  };

  res.json({
    accessToken: token.accessToken(jwtPayload),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};


exports.login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } =
      await service.login({
        email: req.body.email,
        password: req.body.password
      });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // 🔥 localhost ke liye false
      sameSite: "lax"
    });

    res.json({ accessToken, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// exports.logout = (req, res) => {
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "strict"
//   });

//   res.json({ message: "Logged out successfully" });
// };

exports.logout = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};



exports.refresh = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ accessToken: accessToken(user) });
  });
};

// GOOGLE SIGNUP
exports.googleSignup = async (req, res) => {
  try {
    const { token, role } = req.body;

    const data = await service.googleSignup(token, role);

    res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const data = await service.googleLogin(token);

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const user = await service.register(req.body);

    res.status(201).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


