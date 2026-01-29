// src/routes/advancePayment.routes.js
import express from "express";
import { addAdvancePayment } from "../controllers/advancePayment.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.post(
  "/",
  auth,
  requirePermission("ADVANCE_ADD"),
  addAdvancePayment
);

export default router;
