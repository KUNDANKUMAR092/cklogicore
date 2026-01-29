require("dotenv").config();
const mongoose = require("mongoose");

// Models
const User = require("./src/models/user.model");
const Company = require("./src/models/companyOwner.model");
const Supplier = require("./src/models/supplierOwner.model");
const Vehicle = require("./src/models/vehicleOwner.model");
const Transport = require("./src/models/transport.model");

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ DB Connected");
}

async function seedAll() {
  try {
    console.log("⏳ Seeding...");

    // Clear
    await User.deleteMany({});
    await Company.deleteMany({});
    await Supplier.deleteMany({});
    await Vehicle.deleteMany({});
    await Transport.deleteMany({});

    // ADMIN
    const admin = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "123456",
      role: "ADMIN"
    });

    // COMPANY
    const company = await Company.create({
      name: "Rahul Company",
      ownerName: "Rahul Verma",
      email: "company@test.com",
      password: "123456",
      phone: "8888888888",
      perTonRate: 1500,
      createdBy: admin._id
    });

    // SUPPLIER (linked to company)
    const supplier = await Supplier.create({
      name: "Amit Supplier",
      email: "supplier@test.com",
      password: "123456",
      phone: "7777777777",

      profitPerTon: 300,          // ✅ REQUIRED FIELD

      companyId: company._id,
      createdBy: admin._id
    });

    // VEHICLE OWNER (linked to supplier)
    const vehicle = await Vehicle.create({
      name: "Rohit Vehicle",
      email: "vehicle@test.com",
      password: "123456",
      phone: "6666666666",

      vehicleNumber: "UP14AB4567",   // ✅ REQUIRED
      perTonRate: 1200,             // ✅ REQUIRED

      supplierId: supplier._id,
      createdBy: admin._id
    });


    // TRANSPORT (linked to vehicle)
    await Transport.create({
      vehicleNo: "UP14AB9999",
      driverName: "Suresh",
      route: "Delhi → Jaipur",
      capacity: "15 Ton",

      loadTotalTon: 12,          // ✅ REQUIRED
      unloadTotalTon: 11,        // ✅ REQUIRED

      companyId: company._id,    // ✅ REQUIRED
      supplierId: supplier._id,  // ✅ REQUIRED
      vehicleId: vehicle._id,    // ✅ REQUIRED

      createdBy: admin._id,      // ✅ REQUIRED
      createdByRole: "ADMIN"     // ✅ REQUIRED
    });

    console.log("🎉 All Data Linked & Seeded!");
    process.exit();

  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
}

(async () => {
  await connectDB();
  await seedAll();
})();
