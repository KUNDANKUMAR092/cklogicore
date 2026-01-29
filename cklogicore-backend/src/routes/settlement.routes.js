// src/routes/vehicleStaff.routes.js
import express from "express";
import auth from "../middlewares/auth.middleware.js";

import { getSettlement } from "../controllers/settlement.controller.js"
import { requirePermission } from "../middlewares/permission.middleware.js"

const router = express.Router();

router.get(
  "/settlement",
  auth,
  requirePermission("TRIP_VIEW"),
  getSettlement
);

export default router;

