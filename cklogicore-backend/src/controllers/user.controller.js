// src/controller/userModel.controller.js

import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const isAdmin = (user) => user?.role === ROLES.ADMIN;


export const getUsers = async (req, res) => {
  try {

    // ✅ ADMIN & STAFF both allowed
    if (
      req.user.role !== ROLES.ADMIN &&
      req.user.role !== ROLES.STAFF
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const users = await User.find({
      accountId: req.user.accountId,
    }).select("-password");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};


export const createUser = async (req, res) => {
  try {

    // ✅ Only ADMIN can create
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        message: "Only ADMIN can create users",
      });
    }

    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      accountId: req.user.accountId,
      accountType: req.user.accountType,
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
    });

  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};


export const updateUser = async (req, res) => {
  try {

    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        message: "Only ADMIN can update users",
      });
    }

    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        accountId: req.user.accountId, // same tenant
      },
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
    });
  }
};


export const deleteUser = async (req, res) => {
  try {

    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        message: "Only ADMIN can delete users",
      });
    }

    const { id } = req.params;

    const user = await User.findOneAndDelete({
      _id: id,
      accountId: req.user.accountId, // same tenant
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};