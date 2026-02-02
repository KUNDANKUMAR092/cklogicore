import express from "express";
import * as tripCtrl from "../controllers/trip.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createTripSchema, updateTripSchema } from "../validations/trip.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(tripCtrl.getTrips)
  .post(
    authorize({ module: "MANAGE_TRIPS", action: "true" }),
    upload.array("challans", 10), // Pehle file upload/parse hogi
    validate(createTripSchema),   // Phir parsed req.body validate hoga
    tripCtrl.createTrip
  );

router.route("/:id")
  .patch(
    authorize({ module: "MANAGE_TRIPS", action: "true" }), 
    validate(updateTripSchema),   // Update validation
    tripCtrl.updateTrip
  )
  .delete(authorize({ roles: ["OWNER"] }), tripCtrl.deleteTrip);

router.patch("/:id/toggle-status", tripCtrl.toggleTripStatus);

export default router;