import express from "express";
import { getFinancialReport } from "../controllers/report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = express.Router();

// Sabhi routes ke liye auth zaroori hai
router.use(authMiddleware);

// URL: /api/v1/reports/financial?target=COMPANY&startDate=2024-01-01&endDate=2024-01-31
router.get(
  "/financial", 
  authorize({ module: "VIEW_REPORTS", action: "true" }), // Permission Check
  getFinancialReport
);

export default router;







// import express from "express";
// import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";

// import {
//   companyReport,
//   profitSummary,
//   supplierReport,
//   vehicleReport
// } from "../controllers/report.controller.js";

// const router = express.Router();

// router.use(authMiddleware);

// router.get(
//   "/suppliers",
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   supplierReport
// );

// router.get(
//   "/vehicles",
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   vehicleReport
// );

// router.get(
//   "/companies",
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   companyReport
// );

// router.get(
//   "/profit-summary",
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   profitSummary
// );


// export default router;
