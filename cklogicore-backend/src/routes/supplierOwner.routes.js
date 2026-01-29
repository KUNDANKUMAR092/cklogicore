import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplierOwner.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// 🔐 all supplier routes protected
router.use(protect);

// ✅ ADMIN can create supplier (ANY tenant type)
router.post(
  "/",
  authorizeRoles("ADMIN"),
  createSupplier
);

// ✅ Any logged-in user can view suppliers
router.get("/", getSuppliers);

// ✅ ADMIN only
router.put(
  "/:id",
  authorizeRoles("ADMIN"),
  updateSupplier
);

// ✅ ADMIN only
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  deleteSupplier
);

export default router;