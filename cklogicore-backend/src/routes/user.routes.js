// src/routes/user.routes.js

import express from "express";
import { createUser, deleteUser, getUsers, updateUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = express.Router();

// ADMIN can see all users
router.get(
  "/",
  authMiddleware,
  authorize({
    roles: ["ADMIN"]
  }),
  getUsers
);

// ADMIN can create staff
router.post(
  "/",
  authMiddleware,
  authorize({
    roles: ["ADMIN"]
  }),
  createUser
);

// ADMIN can Update staff
router.put(
  "/:id", 
  authMiddleware,
  authorize({
    roles: ["ADMIN"]
  }),
  updateUser
);  

// ADMIN can Delete staff
router.delete(
  "/:id", 
  authMiddleware,
  authorize({
    roles: ["ADMIN"]
  }),
  deleteUser
);

export default router;
