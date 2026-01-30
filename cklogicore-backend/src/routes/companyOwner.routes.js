import express from "express";
import {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany
} from "../controllers/companyOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { checkPermission } from "../middlewares/accountPermission.middleware.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(authMiddleware);

// router.post("/", authorizeRoles("ADMIN"), createCompany);
router.post(
  "/companies",
  checkPermission({
    allowFor: [ACCOUNT_TYPES.SUPPLIER, ACCOUNT_TYPES.VEHICLE],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_COMPANY,
  }),
  createCompany
);
router.get("/", getCompanies);
router.put(
  "/:id", 
  checkPermission({
    allowFor: [ACCOUNT_TYPES.SUPPLIER, ACCOUNT_TYPES.VEHICLE],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_COMPANY,
  }), 
  updateCompany);
router.delete(
  "/:id", 
  checkPermission({
    allowFor: [ACCOUNT_TYPES.SUPPLIER, ACCOUNT_TYPES.VEHICLE],
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF],
    requiredPermission: PERMISSIONS.ADD_COMPANY,
  }), 
  deleteCompany);

export default router;
