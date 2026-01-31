// src/routes/vehicleOwner.routes.js

import express from "express";
import * as vehicleCtrl from "../controllers/vehicleOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { audit } from "../middlewares/audit.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(vehicleCtrl.getVehicles)
  .post(
    // 🛡️ Key "ADD_VEHICLE" check karega
    authorize({ module: "ADD_VEHICLE", action: "true" }), 
    audit("CREATE_VEHICLE", "VEHICLE_OWNER"),
    vehicleCtrl.createVehicle
  );

router.route("/:id")
  .patch(
    authorize({ module: "ADD_VEHICLE", action: "true" }),
    audit("UPDATE_VEHICLE", "VEHICLE_OWNER"),
    vehicleCtrl.updateVehicle
  )
  .delete(
    authorize({ roles: ["OWNER"] }), // Delete authority only to Primary Owner
    audit("DELETE_VEHICLE", "VEHICLE_OWNER"),
    vehicleCtrl.deleteVehicle
  );

router.patch("/:id/toggle-status",
  authorize({ module: "ADD_VEHICLE", action: "true" }),
  audit("TOGGLE_VEHICLE_STATUS", "VEHICLE_OWNER"),
  vehicleCtrl.toggleVehicleStatus
);

export default router;






// import express from "express";
// import {
//   createVehicle,
//   getVehicles,
//   updateVehicle,
//   toggleVehicle
// } from "../controllers/vehicleOwner.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";
// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
// import { ROLES } from "../constants/roles.js";
// import { PERMISSIONS } from "../constants/permissions.js";

// const router = express.Router();

// router.use(authMiddleware);

// router.post(
//   "/",
//   authorize({
//     roles: ["ADMIN"],
//     accountTypes: ["VEHICLE"],
//     permissions: ["MASTER_VEHICLE_ADD"],
//   }),
//   createVehicle
// );

// // router.post("/", authorizeRoles("ADMIN"), createVehicle);
// router.get("/", getVehicles);
// router.put(
//   "/:id", 
//   authorize({
//     roles: ["ADMIN"],
//     accountTypes: ["VEHICLE"],
//     permissions: ["MASTER_VEHICLE_ADD"],
//   }), 
//   updateVehicle);
// // ✅ Toggle Active
// router.patch(
//   "/:id/toggle",
//   authorize({
//     roles: ["ADMIN"],
//     accountTypes: ["VEHICLE"],
//     permissions: ["MASTER_VEHICLE_ADD"],
//   }),
//   toggleVehicle
// );

// export default router;
