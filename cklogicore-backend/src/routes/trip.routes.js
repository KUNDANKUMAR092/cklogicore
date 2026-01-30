import express from "express";
import {
  getTrips,
  addTrip,
  toggleTrip,
  updateTrip,
  addAdvancePayment,
  getAdvancePayments,
  recalculateTripProfit
} from "../controllers/trip.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Trips
router.get("/", getTrips);
router.post("/", authorizeRoles("ADMIN", "STAFF"), addTrip);

router.put("/:id", authorizeRoles("ADMIN"), updateTrip);
router.patch("/:id/toggle", authorizeRoles("ADMIN"), toggleTrip);

// Advance Payment
router.post("/advance", authorizeRoles("ADMIN", "STAFF"), addAdvancePayment);
router.get("/advance", getAdvancePayments);

router.put(
  "/:id/recalculate-profit",
  authorizeRoles("ADMIN"),
  recalculateTripProfit
);


export default router;
