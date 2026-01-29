const express = require("express");
const router = express.Router();

const excelController = require("../controllers/excel.controller");

router.get("/download", excelController.download);

module.exports = router;




// const express = require("express");
// const r = express.Router();
// const c = require("../controllers/excel.controller");
// const auth = require("../middlewares/auth.middleware");

// r.get("/download", auth, c.download);
// module.exports = r;
