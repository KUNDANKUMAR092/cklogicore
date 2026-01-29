import express from "express";
import {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany
} from "../controllers/companyOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", authorizeRoles("ADMIN"), createCompany);
router.get("/", getCompanies);
router.put("/:id", authorizeRoles("ADMIN"), updateCompany);
router.delete("/:id", authorizeRoles("ADMIN"), deleteCompany);

export default router;
