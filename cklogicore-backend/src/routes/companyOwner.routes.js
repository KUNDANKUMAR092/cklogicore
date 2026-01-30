import express from "express";
import {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany
} from "../controllers/companyOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/companies",
  authorize({
    roles: ["ADMIN"],
    accountTypes: ["COMPANY"],
    permissions: ["MASTER_COMPANY_ADD"],
  }),
  createCompany
);
router.get("/", getCompanies);
router.put(
  "/:id", 
  authorize({
    roles: ["ADMIN"],
    accountTypes: ["COMPANY"],
    permissions: ["MASTER_COMPANY_ADD"],
  }), 
  updateCompany);
router.delete(
  "/:id", 
  authorize({
    roles: ["ADMIN"],
    accountTypes: ["COMPANY"],
    permissions: ["MASTER_COMPANY_ADD"],
  }), 
  deleteCompany);

export default router;
