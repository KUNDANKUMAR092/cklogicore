import express from "express";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  toggleVehicle
} from "../controllers/vehicleOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  authorize({
    roles: ["ADMIN"],
    accountTypes: ["VEHICLE"],
    permissions: ["MASTER_VEHICLE_ADD"],
  }),
  createVehicle
);

// router.post("/", authorizeRoles("ADMIN"), createVehicle);
router.get("/", getVehicles);
router.put(
  "/:id", 
  authorize({
    roles: ["ADMIN"],
    accountTypes: ["VEHICLE"],
    permissions: ["MASTER_VEHICLE_ADD"],
  }), 
  updateVehicle);
// ✅ Toggle Active
router.patch(
  "/:id/toggle",
  authorize({
    roles: ["ADMIN"],
    accountTypes: ["VEHICLE"],
    permissions: ["MASTER_VEHICLE_ADD"],
  }),
  toggleVehicle
);

export default router;
