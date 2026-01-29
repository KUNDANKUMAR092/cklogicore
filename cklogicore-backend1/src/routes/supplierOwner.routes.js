const express = require("express");
const {
  verifyToken,
  checkAccess
} = require("../middlewares/auth.middleware");

const r = express.Router();

r.get(
  "/dashboard",
  verifyToken,
  checkAccess(["SUPPLIER_OWNER_DASHBOARD"]),
  (req, res) => {
    res.json({ message: "Supplier Owner Dashboard" });
  }
);

r.post(
  "/",
  verifyToken,
  checkAccess(["SUPPLIER_OWNER_CRUD"]),
  (req, res) => {
    res.json({ message: "Supplier Owner created" });
  }
);

r.put(
  "/:id",
  verifyToken,
  checkAccess(["SUPPLIER_OWNER_CRUD"]),
  (req, res) => {
    res.json({ message: "Supplier Owner Updated" });
  }
);

r.delete(
  "/:id",
  verifyToken,
  checkAccess(["SUPPLIER_OWNER_CRUD"]),
  (req, res) => {
    res.json({ message: "Supplier Owner Deleted" });
  }
);

module.exports = r;
