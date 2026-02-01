// src/routes/supplierOwnerModel.routes.js

import express from "express";
import * as supplierCtrl from "../controllers/supplierOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { audit } from "../middlewares/audit.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(supplierCtrl.getSuppliers)
  .post(
    authorize({ module: "ADD_SUPPLIER", action: "true" }), 
    audit("CREATE_SUPPLIER", "SUPPLIER_OWNER"),
    supplierCtrl.createSupplier
  );

router.route("/:id")
  .patch(
    authorize({ module: "ADD_SUPPLIER", action: "true" }),
    audit("UPDATE_SUPPLIER", "SUPPLIER_OWNER"),
    supplierCtrl.updateSupplier
  )
  .delete(
    authorize({ roles: ["OWNER"] }), 
    audit("DELETE_SUPPLIER", "SUPPLIER_OWNER"),
    supplierCtrl.deleteSupplier
  );


router.patch("/:id/toggle-status", 
  authorize({ module: "ADD_SUPPLIER", action: "true" }), 
  audit("TOGGLE_SUPPLIER_STATUS", "SUPPLIER_OWNER"),
  supplierCtrl.toggleSupplierStatus
);

export default router;






// import express from "express";
// import {
//   createSupplier,
//   getSuppliers,
//   updateSupplier,
//   deleteSupplier
// } from "../controllers/supplierOwner.controller.js";

// import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";
// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
// import { ROLES } from "../constants/roles.js";
// import { PERMISSIONS } from "../constants/permissions.js";

// const router = express.Router();

// // 🔐 all supplier routes authMiddleware
// router.use(authMiddleware);

// // ✅ ADMIN can create supplier (ANY tenant type)
// router.post(
//   "/suppliers",
//   authorize({
//     roles: ["STAFF"],
//     accountTypes: ["SUPPLIER"],
//     permissions: ["ADD_SUPPLIER"],
//   }),
//   createSupplier
// );


// // ✅ Any logged-in user can view suppliers
// router.get("/", getSuppliers);

// // ✅ ADMIN only
// router.put(
//   "/:id",
//   authorize({
//     roles: ["STAFF"],
//     accountTypes: ["SUPPLIER"],
//     permissions: ["ADD_SUPPLIER"],
//   }),
//   updateSupplier
// );

// // ✅ ADMIN only
// router.delete(
//   "/:id",
//   authorize({
//     roles: ["STAFF"],
//     accountTypes: ["SUPPLIER"],
//     permissions: ["ADD_SUPPLIER"],
//   }),
//   deleteSupplier
// );

// export default router;