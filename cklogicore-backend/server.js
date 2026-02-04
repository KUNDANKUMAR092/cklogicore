// server.js



import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

// ES Modules mein __dirname set karne ke liye
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
connectDB();

// --- DEPLOYMENT LOGIC START ---

// Frontend build folder ka path (Parent folder se cklogicore-frontend/dist tak)
// const frontendBuildPath = path.join(__dirname, "../cklogicore-frontend/dist");
const frontendBuildPath = path.resolve(__dirname, "../dist");

app.use(express.static(frontendBuildPath));

if (process.env.NODE_ENV === "production") {
    // Wildcard route: API ke ilawa baaki sab index.html par bhej do
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.join(frontendBuildPath, "index.html"), (err) => {
            if (err) {
                // Agar file nahi milti toh error log karein taaki dashboard par dikhe
                console.error("Error sending index.html:", err);
                res.status(500).send("Frontend build not found. Please check paths.");
            }
        });
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running in development mode...");
    });
}

// --- DEPLOYMENT LOGIC END ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});