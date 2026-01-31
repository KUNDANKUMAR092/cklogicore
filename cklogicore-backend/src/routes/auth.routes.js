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
router.post("/refresh-token", loginLimiter, refreshToken);

// 4. LOGOUT:
router.post("/logout", authMiddleware, audit("LOGOUT", "USER"), logout);

// 5. FORGOT PASSWORD:
router.post("/forgot-password", loginLimiter, forgotPassword);

// 6. RESET PASSWORD:
router.patch("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

export default router;

















// import express from "express";

// import {
//   register,
//   login,
//   logout,
//   forgotPassword,
//   resetPassword
// } from "../controllers/auth.controller.js";

// import { loginLimiter } from "../middlewares/rateLimit.middleware.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", loginLimiter, login);
// router.post("/logout", logout);
// router.post("/forgot-password", forgotPassword);
// router.patch("/reset-password/:token", resetPassword);

// export default router;

















// import express from "express";
// import { register, login, refreshAccessToken, logout, forgotPassword, resetPassword } from "../controllers/auth.controller.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.post("/refresh-token", refreshAccessToken);
// router.post("/logout", logout);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);
// // router.post("/forgot-password", forgotPassword);
// // router.post("/reset-password", resetPassword);


// export default router;
