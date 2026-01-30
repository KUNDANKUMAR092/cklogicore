import express from "express";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  toggleVehicle
} from "../controllers/vehicleOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/accountPermission.middleware.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  checkPermission({
    allowFor: [ACCOUNT_TYPES.SUPPLIER, ACCOUNT_TYPES.COMPANY],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_VEHICLE,
  }),
  createVehicle
);

// router.post("/", authorizeRoles("ADMIN"), createVehicle);
router.get("/", getVehicles);
router.put(
  "/:id", 
  checkPermission({
    allowFor: [ACCOUNT_TYPES.SUPPLIER, ACCOUNT_TYPES.COMPANY],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_VEHICLE,
  }), 
  updateVehicle);
// ✅ Toggle Active
router.patch(
  "/:id/toggle",
  checkPermission({
    allowFor: [ACCOUNT_TYPES.SUPPLIER, ACCOUNT_TYPES.COMPANY],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_VEHICLE,
  }),
  toggleVehicle
);

export default router;
