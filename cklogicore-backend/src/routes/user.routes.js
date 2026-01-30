import express from "express";
import { createUser, deleteUser, getUsers, updateUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN can see all users
router.get(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  getUsers
);

// ADMIN can create staff
router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  createUser
);

// ADMIN can Update staff
router.put(
  "/:id", 
  authMiddleware,
  allowRoles("ADMIN"),
  updateUser
);  

// ADMIN can Delete staff
router.delete(
  "/:id", 
  authMiddleware,
  allowRoles("ADMIN"),
  deleteUser
);

export default router;
