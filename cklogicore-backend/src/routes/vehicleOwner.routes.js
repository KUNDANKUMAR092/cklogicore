import express from "express";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle
} from "../controllers/vehicleOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", authorizeRoles("ADMIN"), createVehicle);
router.get("/", getVehicles);
router.put("/:id", authorizeRoles("ADMIN"), updateVehicle);
router.delete("/:id", authorizeRoles("ADMIN"), deleteVehicle);

export default router;
