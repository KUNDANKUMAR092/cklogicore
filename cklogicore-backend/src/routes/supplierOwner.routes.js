import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplierOwner.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

// 🔐 all supplier routes authMiddleware
router.use(authMiddleware);

// ✅ ADMIN can create supplier (ANY tenant type)
router.post(
  "/suppliers",
  authorize({
    roles: ["STAFF"],
    accountTypes: ["SUPPLIER"],
    permissions: ["ADD_SUPPLIER"],
  }),
  createSupplier
);


// ✅ Any logged-in user can view suppliers
router.get("/", getSuppliers);

// ✅ ADMIN only
router.put(
  "/:id",
  authorize({
    roles: ["STAFF"],
    accountTypes: ["SUPPLIER"],
    permissions: ["ADD_SUPPLIER"],
  }),
  updateSupplier
);

// ✅ ADMIN only
router.delete(
  "/:id",
  authorize({
    roles: ["STAFF"],
    accountTypes: ["SUPPLIER"],
    permissions: ["ADD_SUPPLIER"],
  }),
  deleteSupplier
);

export default router;