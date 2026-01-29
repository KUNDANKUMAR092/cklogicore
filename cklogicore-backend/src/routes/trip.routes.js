import express from "express";
import {
  addTrip,
  getTrips,
  addAdvancePayment,
  getAdvancePayments,
  recalculateTripProfit
} from "../controllers/trip.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Trips
router.post("/", authorizeRoles("ADMIN", "STAFF"), addTrip);
router.get("/", getTrips);

// Advance Payment
router.post("/advance", authorizeRoles("ADMIN", "STAFF"), addAdvancePayment);
router.get("/advance", getAdvancePayments);

router.put(
  "/:id/recalculate-profit",
  authorizeRoles("ADMIN"),
  recalculateTripProfit
);


export default router;
