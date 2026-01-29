const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const transportRoutes = require("./routes/transport.routes");
const excelRoutes = require("./routes/excel.routes");

const adminRoutes = require("./routes/admin.routes");
const companyOwnerRoutes = require("./routes/companyOwner.routes");
// const vehicleOwnerRoutes = require("./routes/vehicleOwner.routes");
const supplierOwnerRoutes = require("./routes/supplierOwner.routes");

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transport", transportRoutes);
app.use("/api/v1/excel", excelRoutes);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/company-owner", companyOwnerRoutes);
// app.use("/api/v1/vehicle-owner", vehicleOwnerRoutes);
app.use("/api/v1/supplier-owner", supplierOwnerRoutes);

// app.use("/api/company", require("./routes/company.routes"));
// app.use("/api/supplier", require("./routes/supplier.routes"));
// app.use("/api/vehicle", require("./routes/vehicle.routes"));
// app.use("/api/transport", require("./routes/transport.routes"));




module.exports = app;
