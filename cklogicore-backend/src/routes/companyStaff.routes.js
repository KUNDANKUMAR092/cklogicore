// src/routes/companyStaff.routes.js
import express from "express";
import { createCompanyStaff } from "../controllers/companyStaff.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/staff",
  auth,
  requireRole("ADMIN"),
  createCompanyStaff
);

export default router;
