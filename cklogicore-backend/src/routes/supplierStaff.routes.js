// src/routes/vehicleStaff.routes.js
import express from "express";
import { createSupplierStaff } from "../controllers/supplierStaff.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/staff",
  auth,
  requireRole("ADMIN"),
  createSupplierStaff
);

export default router;

