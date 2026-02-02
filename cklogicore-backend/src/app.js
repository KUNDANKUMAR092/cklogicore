// src/app.js

import express from "express";
import morgan from "morgan";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import userStaffRoutes from "./routes/userStaff.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import supplierOwnerRoutes from "./routes/supplierOwner.routes.js";
import companyOwnerRoutes from "./routes/companyOwner.routes.js";
import vehicleOwnerRoutes from "./routes/vehicleOwner.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import excelRoutes from "./routes/excel.routes.js";
import reportRoutes from "./routes/report.routes.js";

import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Security & Parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000"],
    },
  },
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ CORS Configuration
const allowedOrigins = ["http://localhost:5174", "http://localhost:5173"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true // Refresh token cookie 
}));


// 🌍 Base URL Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/user-staff", userStaffRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/suppliers", supplierOwnerRoutes);
app.use("/api/v1/companies", companyOwnerRoutes);
app.use("/api/v1/vehicles", vehicleOwnerRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/excel", excelRoutes);
app.use("/api/v1/reports", reportRoutes);

// uploads Pic Route
app.use("/uploads", express.static("uploads"));
// ❗ 404 handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

export default app;