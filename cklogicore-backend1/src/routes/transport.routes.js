// src/routes/transport.routes.js

const express = require("express");
const router = express.Router();

const {
  createTransport,
} = require("../controllers/transport.controller");

// ✅ yahan second argument ek FUNCTION hai
router.post("/create", createTransport);

module.exports = router;
