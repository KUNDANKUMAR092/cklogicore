import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  companyReport,
  profitSummary,
  supplierReport,
  vehicleReport
} from "../controllers/report.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/suppliers",
  authorizeRoles("ADMIN"),
  supplierReport
);

router.get(
  "/vehicles",
  authorizeRoles("ADMIN"),
  vehicleReport
);

router.get(
  "/companies",
  authorizeRoles("ADMIN"),
  companyReport
);

router.get(
  "/profit-summary",
  authorizeRoles("ADMIN"),
  profitSummary
);


export default router;
