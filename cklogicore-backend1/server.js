const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const app = require("./src/app"); // 🔥 IMPORTANT LINE

dotenv.config();

// MongoDB connect
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});







// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./src/config/db");
// // const authRoutes = require("./src/routes/auth.routes");

// dotenv.config();

// const app = express();
// app.use(express.json());

// // MongoDB connect
// connectDB();



// // app.use("/api/auth", authRoutes);


// // Routes
// // const transportRoutes = require("./src/routes/transport.routes");
// // app.use("/api/transport", transportRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
