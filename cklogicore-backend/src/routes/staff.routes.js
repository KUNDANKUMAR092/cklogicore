import express from "express";
import * as staffCtrl from "../controllers/staff.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = express.Router();

// Sabhi routes ke liye login zaroori hai
router.use(authMiddleware);

// Sirf OWNER hi staff manage kar sakta hai
router.route("/")
  .post(authorize({ roles: ["OWNER"] }), staffCtrl.addStaff)
  .get(authorize({ roles: ["OWNER"] }), staffCtrl.getAllStaff);

router.route("/:id")
  .patch(authorize({ roles: ["OWNER"] }), staffCtrl.updateStaff)
  .delete(authorize({ roles: ["OWNER"] }), staffCtrl.deleteStaff);

export default router;