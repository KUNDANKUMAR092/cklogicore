require("dotenv").config();
require("./src/config/db"); // DB connect

const mongoose = require("mongoose");

async function clearDB() {
  try {
    const collections = mongoose.connection.collections;

    for (let key in collections) {
      await collections[key].deleteMany({});
    }

    console.log("✅ Database Successfully Cleared!");
    process.exit();
  } catch (err) {
    console.log("❌ Error:", err);
    process.exit(1);
  }
}

clearDB();
