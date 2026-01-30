import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

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
  authorize({
    roles: ["ADMIN"]
  }),
  supplierReport
);

router.get(
  "/vehicles",
  authorize({
    roles: ["ADMIN"]
  }),
  vehicleReport
);

router.get(
  "/companies",
  authorize({
    roles: ["ADMIN"]
  }),
  companyReport
);

router.get(
  "/profit-summary",
  authorize({
    roles: ["ADMIN"]
  }),
  profitSummary
);


export default router;
