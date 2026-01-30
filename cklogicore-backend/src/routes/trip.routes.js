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
import { authorize } from "../middlewares/authorize.middleware.js";


const router = express.Router();

router.use(authMiddleware);

// Trips
router.get(
  "/", 
  getTrips
);

router.post(
  "/", 
  authorize({
    roles: ["ADMIN", "STAFF"]
  }), 
  addTrip
);

router.put(
  "/:id", 
  authorize({
    roles: ["ADMIN"]
  }),
  updateTrip
);

router.patch(
  "/:id/toggle", 
  authorize({
    roles: ["ADMIN"]
  }),
  toggleTrip
);

// Advance Payment
router.post(
  "/advance", 
  authorize({
    roles: ["ADMIN", "STAFF"]
  }), 
  addAdvancePayment 
);

router.get(
  "/advance", 
  getAdvancePayments
);

router.put(
  "/:id/recalculate-profit",
  authorize({
    roles: ["ADMIN"]
  }),
  recalculateTripProfit
);


export default router;
