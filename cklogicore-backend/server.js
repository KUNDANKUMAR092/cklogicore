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
const frontendBuildPath = path.join(__dirname, "../cklogicore-frontend/dist");

if (process.env.NODE_ENV === "production") {
    // 1. Static files serve karein (CSS, JS, Images)
    app.use(express.static(frontendBuildPath));

    // 2. Kisi bhi non-API route par frontend ki index.html dikhayein
    
    // Isse React Router live hone par break nahi hoga
    app.get("/(.*)", (req, res) => {
        // Agar request URL '/api' se start nahi hota, toh index.html bhejein
        if (!req.url.startsWith('/api')) {
            res.sendFile(path.resolve(frontendBuildPath, "index.html"));
        }
    });
} else {
    // Local Development mein sirf ek basic message (Optional)
    app.get("/", (req, res) => {
        res.send("API is running in development mode...");
    });
}

// --- DEPLOYMENT LOGIC END ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});





// import dotenv from "dotenv";
// dotenv.config();


// import connectDB from "./src/config/db.js";
// import app from "./src/app.js";

// connectDB();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
