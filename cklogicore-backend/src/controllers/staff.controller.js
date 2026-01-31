import Staff from "../models/staff.model.js";
import bcrypt from "bcryptjs";

const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// 1. ADD NEW STAFF (Only Owner can do this)
export const addStaff = catchAsync(async (req, res) => {
  const { name, email, password, mobile, role, permissions } = req.body;
  const { accountId } = req.user; // Token se Owner ki ID

  // Check if email already exists
  const exists = await Staff.findOne({ email });
  if (exists) return res.status(400).json({ message: "This email is already registered as staff" });

  const hashedPassword = await bcrypt.hash(password, 12);

  const staff = await Staff.create({
    name,
    email,
    password: hashedPassword,
    mobile,
    role,
    permissions, // Example: { canManageTrips: true, canViewReports: false }
    accountId
  });

  res.status(201).json({ 
    success: true, 
    message: "Staff member added successfully", 
    data: { id: staff._id, name: staff.name, email: staff.email, role: staff.role } 
  });
});

// 2. GET ALL STAFF (Owner apne saare staff dekh sakta hai)
export const getAllStaff = catchAsync(async (req, res) => {
  const staffList = await Staff.find({ 
    accountId: req.user.accountId, 
    isDeleted: false 
  }).select("-password");

  res.json({ success: true, data: staffList });
});

// 3. UPDATE STAFF (Permissions ya Details change karne ke liye)
export const updateStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Security check: Owner sirf apne hi staff ko update kar sake
  const staff = await Staff.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId },
    { $set: req.body },
    { new: true, runValidators: true }
  ).select("-password");

  if (!staff) return res.status(404).json({ message: "Staff member not found" });

  res.json({ success: true, message: "Staff updated successfully", data: staff });
});

// 4. SOFT DELETE STAFF
export const deleteStaff = catchAsync(async (req, res) => {
  const staff = await Staff.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json({ success: true, message: "Staff removed successfully" });
});