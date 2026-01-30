import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplierOwner.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { checkPermission } from "../middlewares/accountPermission.middleware.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

// 🔐 all supplier routes authMiddleware
router.use(authMiddleware);

// ✅ ADMIN can create supplier (ANY tenant type)
router.post(
  "/suppliers",
  checkPermission({
    allowFor: [ACCOUNT_TYPES.COMPANY, ACCOUNT_TYPES.VEHICLE],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_SUPPLIER,
  }),
  createSupplier
);
// router.post(
//   "/",
//   authorizeRoles("ADMIN"),
//   createSupplier
// );

// ✅ Any logged-in user can view suppliers
router.get("/", getSuppliers);

// ✅ ADMIN only
router.put(
  "/:id",
  checkPermission({
    allowFor: [ACCOUNT_TYPES.COMPANY, ACCOUNT_TYPES.VEHICLE],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_SUPPLIER,
  }),
  updateSupplier
);

// ✅ ADMIN only
router.delete(
  "/:id",
  checkPermission({
    allowFor: [ACCOUNT_TYPES.COMPANY, ACCOUNT_TYPES.VEHICLE],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_SUPPLIER,
  }),
  deleteSupplier
);

export default router;