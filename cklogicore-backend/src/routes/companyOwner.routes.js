// src/routes/companyOwner.routes.js

import express from "express";
import * as companyCtrl from "../controllers/companyOwner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { audit } from "../middlewares/audit.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(companyCtrl.getCompanies)
  .post(
    // 🛡️ Middleware key check
    authorize({ module: "ADD_COMPANY", action: "true" }), 
    audit("CREATE_COMPANY", "COMPANY_OWNER"),
    companyCtrl.createCompany
  );

router.route("/:id")
  .patch(
    authorize({ module: "ADD_COMPANY", action: "true" }),
    audit("UPDATE_COMPANY", "COMPANY_OWNER"),
    companyCtrl.updateCompany 
  )
  .delete(
    authorize({ roles: ["OWNER"] }),
    audit("DELETE_COMPANY", "COMPANY_OWNER"),
    companyCtrl.deleteCompany
  );

router.patch("/:id/toggle-status",
  authorize({ module: "ADD_COMPANY", action: "true" }),
  audit("TOGGLE_COMPANY_STATUS", "COMPANY_OWNER"),
  companyCtrl.toggleCompanyStatus
);

export default router;