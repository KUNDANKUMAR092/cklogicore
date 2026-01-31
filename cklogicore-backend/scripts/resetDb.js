import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/* Connect DB */

await mongoose.connect(process.env.MONGO_URI);

console.log("Connected to DB");

/* Drop Database */

await mongoose.connection.dropDatabase();

console.log("Database cleared successfully");

/* Close */

await mongoose.disconnect();

process.exit(0);
