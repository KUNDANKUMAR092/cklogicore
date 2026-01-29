const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middlewares/access.middleware");

const r = express.Router();

r.get(
  "/dashboard",
  verifyToken,
  checkPermission("COMPANY_OWNER_DASHBOARD"), 
  (req, res) => {
    res.json({
      role: "COMPANY_OWNER",
      message: "Company Owner Dashboard"
    });
  }
);

r.post(
  "/",
  verifyToken,
  checkPermission("COMPANY_OWNER_CRUD"),
  (req, res) => {
    res.json({ message: "Company Owner created" });
  }
);

r.put(
  "/:id",
  verifyToken,
  checkPermission("COMPANY_OWNER_CRUD"),
  (req, res) => {
    res.json({ message: "Company Owner updated" });
  }
);

r.delete(
  "/:id",
  verifyToken,
  checkPermission("COMPANY_OWNER_CRUD"),
  (req, res) => {
    res.json({ message: "Company Owner deleted" });
  }
);

module.exports = r;

















// const express = require("express");
// const { verifyToken } = require("../middlewares/auth.middleware");
// const { authorizeRoles } = require("../middlewares/role.middleware");

// const r = express.Router();

// r.get(
//   "/company/dashboard",
//   verifyToken,
//   checkAccess("dashboard"),
//   controller.companyDashboard
// );

// r.post(
//   "/company",
//   verifyToken,
//   checkAccess("companyCRUD"),
//   controller.createCompany
// );

// r.put(
//   "/company/:id",
//   verifyToken,
//   checkAccess("companyCRUD"),
//   controller.updateCompany
// );

// r.delete(
//   "/company/:id",
//   verifyToken,
//   checkAccess("companyCRUD"),
//   controller.deleteCompany
// );


// module.exports = r;