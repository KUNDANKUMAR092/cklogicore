const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Existing routes (UNCHANGED)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout); // ✅ SAME AS BEFORE

// 🔥 NEW FEATURE (Google Login)
router.post("/google/signup", authController.googleSignup);
router.post("/google/login", authController.googleLogin);

module.exports = router;
