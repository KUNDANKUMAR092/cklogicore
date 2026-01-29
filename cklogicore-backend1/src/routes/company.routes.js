const router = require("express").Router();
const { createCompany, getCompanies } = require("../controllers/company.controller");
const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.post("/", createCompany);
router.get("/", getCompanies);

module.exports = router;
