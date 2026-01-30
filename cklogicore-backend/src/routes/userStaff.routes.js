import express from "express";

import {
  createStaff,
  getStaffs,
  updateStaff,
  toggleStaffStatus,
  deleteStaff
} from "../controllers/userStaff.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";


const router = express.Router();

router.use(authMiddleware, authorize);

/* ADMIN ONLY */

router.post(
  "/", 
  authMiddleware,
  authorize({ roles: ["ADMIN"] }),
  createStaff
);

router.get(
  "/", 
  authMiddleware,
  authorize({ roles: ["ADMIN"] }),
  getStaffs
);

router.put(
  "/:id", 
  authMiddleware,
  authorize({ roles: ["ADMIN"] }),
  updateStaff
);

router.patch(
  "/:id/toggle", 
  authMiddleware,
  authorize({ roles: ["ADMIN"] }),
  toggleStaffStatus
);

router.delete(
  "/:id", 
  authMiddleware,
  authorize({ roles: ["ADMIN"] }),
  deleteStaff
);

export default router;
