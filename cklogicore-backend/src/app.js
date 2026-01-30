// src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.routes.js";
import staffRoutes from "./routes/userStaff.routes.js";
import supplierOwnerRoutes from "./routes/supplierOwner.routes.js";
import companyOwnerRoutes from "./routes/companyOwner.routes.js";
import vehicleOwnerRoutes from "./routes/vehicleOwner.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import excelRoutes from "./routes/excel.routes.js";
import userRoutes from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js";


const app = express();

// 🌐 Middlewares
// app.use(cors());
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// 🌍 Base URL
app.use("/api/v1/auth", authRoutes);
app.use("/api/staff", staffRoutes);
// app.use("/api/v1/users", userRoutes);
app.use("/api/v1/suppliers", supplierOwnerRoutes);
app.use("/api/v1/companies", companyOwnerRoutes);
app.use("/api/v1/vehicles", vehicleOwnerRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/excel", excelRoutes);
app.use("/api/v1/reports", reportRoutes);


// ❗ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
