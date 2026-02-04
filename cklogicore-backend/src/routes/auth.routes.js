// src/routes/auth.routes.js

import express from "express";
import { register, login, logout, refreshToken, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { loginLimiter } from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; // Import karein
import { audit } from "../middlewares/audit.middleware.js"; // Activity logs ke liye
import { registerSchema, loginSchema, resetPasswordSchema } from "../validations/auth.validation.js";

const router = express.Router();

// 1. REGISTER: 
router.post("/register", validate(registerSchema), register);

// 2. LOGIN:
router.post("/login", loginLimiter, validate(loginSchema), login);

// 3. REFRESH TOKEN:
router.post("/refresh-token", refreshToken);

// 4. LOGOUT:
router.post("/logout", authMiddleware, audit("LOGOUT", "USER"), logout);

// 5. FORGOT PASSWORD:
router.post("/forgot-password", loginLimiter, forgotPassword);

// 6. RESET PASSWORD:
router.patch("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

export default router;