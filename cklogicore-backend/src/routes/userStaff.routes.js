import express from "express";
import * as staffCtrl from "../controllers/userStaff.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { audit } from "../middlewares/audit.middleware.js";
import { createStaffSchema, updateStaffSchema } from "../validations/staff.validation.js";

const router = express.Router();

// Sabhi routes ke liye login zaroori hai
router.use(authMiddleware);

// Sirf OWNER hi staff manage kar sakta hai
router.use(authorize({ roles: ["OWNER"] }));

router.route("/")
  .get(staffCtrl.getStaffs)
  .post(
    validate(createStaffSchema), 
    audit("CREATE_STAFF", "USER_STAFF"), 
    staffCtrl.createStaff
  );

router.route("/:id")
  .patch(
    validate(updateStaffSchema), 
    audit("UPDATE_STAFF", "USER_STAFF"), 
    staffCtrl.updateStaff
  )
  .delete(
    audit("DELETE_STAFF", "USER_STAFF"), 
    staffCtrl.deleteStaff
  );

router.patch(
  "/:id/toggle-status",
  authorize({ roles: ["OWNER"] }),
  audit("TOGGLE_STATUS", "USER_STAFF"), 
  staffCtrl.toggleStaffStatus
);

export default router;







// import express from "express";

// import {
//   createStaff,
//   getStaffs,
//   updateStaff,
//   toggleStaffStatus,
//   deleteStaff
// } from "../controllers/userStaff.controller.js";

// import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";


// const router = express.Router();

// router.use(authMiddleware, authorize);

// /* ADMIN ONLY */

// router.post(
//   "/", 
//   authMiddleware,
//   authorize({ roles: ["OWNER"] }),
//   createStaff
// );

// router.get(
//   "/", 
//   authMiddleware,
//   authorize({ roles: ["OWNER"] }),
//   getStaffs
// );

// router.put(
//   "/:id", 
//   authMiddleware,
//   authorize({ roles: ["OWNER"] }),
//   updateStaff
// );

// router.patch(
//   "/:id/toggle", 
//   authMiddleware,
//   authorize({ roles: ["OWNER"] }),
//   toggleStaffStatus
// );

// router.delete(
//   "/:id", 
//   authMiddleware,
//   authorize({ roles: ["OWNER"] }),
//   deleteStaff
// );

// export default router;
