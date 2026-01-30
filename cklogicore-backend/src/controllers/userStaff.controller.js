import UserStaff from "../models/userStaff.model.js";
import bcrypt from "bcryptjs";

/* ================= CREATE STAFF ================= */

export const createStaff = async (req, res) => {
  try {

    const { name, email, password, permissions } = req.body;

    // Duplicate check
    const exists = await UserStaff.findOne({
      email,
      accountId: req.user.accountId,
      isDeleted: false
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Staff already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const staff = await UserStaff.create({
      name,
      email,
      password: hashed,
      permissions,
      accountId: req.user.accountId,
      accountType: req.user.accountType,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      staffId: staff._id
    });

  } catch (err) {
    console.error("CREATE STAFF:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create staff"
    });
  }
};


/* ================= GET STAFF (PAGINATION + FILTER) ================= */

export const getStaffs = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all"
    } = req.query;

    const query = {
      accountId: req.user.accountId,
      isDeleted: false
    };

    // Status filter
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    // Search
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") }
      ];
    }

    const skip = (page - 1) * limit;

    const total = await UserStaff.countDocuments(query);

    const staffs = await UserStaff.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      staffs
    });

  } catch (err) {
    console.error("GET STAFF:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch staff"
    });
  }
};


/* ================= UPDATE STAFF ================= */

export const updateStaff = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, email, permissions } = req.body;

    const staff = await UserStaff.findOneAndUpdate(
      {
        _id: id,
        accountId: req.user.accountId,
        isDeleted: false
      },
      { name, email, permissions },
      { new: true }
    ).select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    res.json({
      success: true,
      message: "Staff updated",
      staff
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};


/* ================= TOGGLE ACTIVE ================= */

export const toggleStaffStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const staff = await UserStaff.findOne({
      _id: id,
      accountId: req.user.accountId,
      isDeleted: false
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    staff.isActive = !staff.isActive;

    await staff.save();

    res.json({
      success: true,
      message: `Staff ${staff.isActive ? "activated" : "deactivated"}`
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Status change failed"
    });
  }
};


/* ================= SOFT DELETE ================= */

export const deleteStaff = async (req, res) => {
  try {

    const { id } = req.params;

    const staff = await UserStaff.findOneAndUpdate(
      {
        _id: id,
        accountId: req.user.accountId
      },
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    res.json({
      success: true,
      message: "Staff deleted"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};
