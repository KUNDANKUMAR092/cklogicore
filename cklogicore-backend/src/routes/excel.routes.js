import express from "express";
import { exportTripsToExcel } from "../controllers/excel.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 📥 Export Trips Excel Route
// URL: /api/v1/excel/export-trips?target=COMPANY&startDate=2024-01-01&endDate=2024-01-31
router.get(
  "/export-trips", 
  authMiddleware, 
  exportTripsToExcel
);

export default router;






// import express from "express";
// import { exportExcel } from "../controllers/excel.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// router.use(authMiddleware);

// // GET /excel/export?view=company&fromDate=2026-01-01&toDate=2026-01-28
// router.get("/export", exportExcel);

// export default router;
