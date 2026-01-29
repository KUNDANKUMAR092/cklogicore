const jwt = require("jsonwebtoken");

/* Existing exports – DO NOT REMOVE (kahi aur use ho sakta hai) */
exports.accessToken = payload =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

exports.refreshToken = payload =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

/* ✅ ADD THESE (auth.service expects these names) */
exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
