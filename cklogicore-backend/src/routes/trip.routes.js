import express from "express";
import * as tripCtrl from "../controllers/trip.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createTripSchema, updateTripSchema } from "../validations/trip.validation.js";

// trip.route.js
const safeUpload = (req, res, next) => {
  const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");

  if (isMultipart) {
    // Multer middleware ko execute karein aur errors handle karein
    return upload.array("challans", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: "Upload error", error: err.message });
      }
      next(); // Yeh agle middleware (validate) par bhejega
    });
  }
  next(); // Agar multipart nahi hai toh seedha aage badhein
};



const router = express.Router();
router.use(authMiddleware);


router.route("/")
  .get(tripCtrl.getTrips)
  .post(
    authorize({ module: "MANAGE_TRIPS", action: "true" }),
    // upload.array("challans", 10), 
    safeUpload,
    validate(createTripSchema),   
    tripCtrl.createTrip
  );

router.route("/:id")
  .get(tripCtrl.getTripById)
  .patch(
    authorize({ module: "MANAGE_TRIPS", action: "true" }), 
    safeUpload, // 🔥 Yahan safeUpload add karein (FormData parse karne ke liye)
    validate(updateTripSchema),   
    tripCtrl.updateTrip
  )
  .delete(authorize({ roles: ["OWNER"] }), tripCtrl.deleteTrip);

router.patch("/:id/toggle-status", tripCtrl.toggleTripStatus);
router.patch("/:id/workflow", authorize({ module: "MANAGE_TRIPS", action: "true" }), tripCtrl.updateTripWorkflowStatus);

router.post("/:id/challans", authorize({ module: "MANAGE_TRIPS", action: "true" }), upload.array("challans", 5), tripCtrl.addChallans);
router.delete("/:id/challans/:challanId", tripCtrl.removeChallan);

export default router;