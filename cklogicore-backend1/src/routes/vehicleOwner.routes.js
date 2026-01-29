const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const r = express.Router();

r.get(
  "/dashboard",
  verifyToken,
  checkAccess("VEHICLE_OWNER_DASHBOARD"),
  (req, res) => {
    res.json({ message: "Vehicle Owner Dashboard" });
  }
);

r.post(
  "/",
  verifyToken,
  checkAccess("VEHICLE_OWNER_CRUD"),
  (req, res) => {
    res.json({ message: "Vehicle Owner created" });
  }
);

r.put(
  "/:id",
  verifyToken,
  checkAccess("VEHICLE_OWNER_CRUD"),
  (req, res) => {
    res.json({ message: "Vehicle Owner Updated" });
  }
);

r.delete(
  "/:id",
  verifyToken,
  checkAccess("VEHICLE_OWNER_CRUD"),
  (req, res) => {
    res.json({ message: "Vehicle Owner Deleted" });
  }
);


module.exports = r;