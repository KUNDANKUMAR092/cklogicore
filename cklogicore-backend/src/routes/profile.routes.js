import express from "express";
import * as profileCtrl from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js"; // Humara multer middleware

const router = express.Router();

router.use(authMiddleware); // All routes protected

router.get("/me", profileCtrl.getMyProfile);
router.patch("/update", profileCtrl.updateProfile);
router.patch("/update-avatar", upload.single("avatar"), profileCtrl.updateAvatar);
router.patch("/change-password", profileCtrl.changePassword);
router.post("/deactivate", profileCtrl.deactivateAccount);

export default router;