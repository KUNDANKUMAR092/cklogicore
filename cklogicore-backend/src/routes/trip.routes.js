import express from "express";
import * as tripCtrl from "../controllers/trip.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(tripCtrl.getTrips) // Contains Filter + Pagination + Summary Logic
  .post(
    authorize({ module: "MANAGE_TRIPS", action: "true" }),
    upload.array("challans", 10), 
    tripCtrl.createTrip
  );

router.route("/:id")
  .patch(authorize({ module: "MANAGE_TRIPS", action: "true" }), tripCtrl.updateTrip)
  .delete(authorize({ roles: ["OWNER"] }), tripCtrl.deleteTrip);

router.patch("/:id/toggle-status", tripCtrl.toggleTripStatus);

export default router;








// import express from "express";
// import * as tripCtrl from "../controllers/trip.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";
// import { audit } from "../middlewares/audit.middleware.js";

// const router = express.Router();

// router.use(authMiddleware);

// router.route("/")
//   .get(tripCtrl.getTrips)
//   .post(
//     authorize({ module: "MANAGE_TRIPS", action: "true" }), // Check permission
//     audit("CREATE_TRIP", "TRIP"),
//     tripCtrl.createTrip
//   );

// router.route("/:id")
//   .patch(
//     authorize({ module: "MANAGE_TRIPS", action: "true" }),
//     audit("UPDATE_TRIP", "TRIP"),
//     tripCtrl.updateTrip
//   )
//   .delete(
//     authorize({ roles: ["OWNER"] }), // Delete only by Owner
//     audit("DELETE_TRIP", "TRIP"),
//     tripCtrl.deleteTrip
//   );

// router.patch("/:id/toggle-status", tripCtrl.toggleTripStatus);

// export default router;









// import express from "express";
// import {
//   getTrips,
//   addTrip,
//   toggleTrip,
//   updateTrip,
//   addAdvancePayment,
//   getAdvancePayments,
//   recalculateTripProfit
// } from "../controllers/trip.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";


// const router = express.Router();

// router.use(authMiddleware);

// // Trips
// router.get(
//   "/", 
//   getTrips
// );

// router.post(
//   "/", 
//   authorize({
//     roles: ["ADMIN", "STAFF"]
//   }), 
//   addTrip
// );

// router.put(
//   "/:id", 
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   updateTrip
// );

// router.patch(
//   "/:id/toggle", 
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   toggleTrip
// );

// // Advance Payment
// router.post(
//   "/advance", 
//   authorize({
//     roles: ["ADMIN", "STAFF"]
//   }), 
//   addAdvancePayment 
// );

// router.get(
//   "/advance", 
//   getAdvancePayments
// );

// router.put(
//   "/:id/recalculate-profit",
//   authorize({
//     roles: ["ADMIN"]
//   }),
//   recalculateTripProfit
// );


// export default router;
