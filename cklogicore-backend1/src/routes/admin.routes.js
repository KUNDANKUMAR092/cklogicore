const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");

const r = express.Router();

r.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    role: "ADMIN",
    message: "Admin dashboard",
    user: req.user
  });
});

module.exports = r;
