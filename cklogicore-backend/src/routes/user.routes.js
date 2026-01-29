import express from "express";
import { createUser, deleteUser, getUsers, updateUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// ADMIN can see all users
router.get(
  "/",
  protect,
  allowRoles("ADMIN"),
  getUsers
);

// ADMIN can create staff
router.post(
  "/",
  protect,
  allowRoles("ADMIN"),
  createUser
);

// ADMIN can Update staff
router.put(
  "/:id", 
  protect,
  allowRoles("ADMIN"),
  updateUser
);  

// ADMIN can Delete staff
router.delete(
  "/:id", 
  protect,
  allowRoles("ADMIN"),
  deleteUser
);

export default router;
