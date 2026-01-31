import UserStaff from "../models/userStaff.model.js";
import bcrypt from "bcryptjs";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= CREATE STAFF ================= */
export const createStaff = catchAsync(async (req, res) => {
  const { name, email, password, permissions } = req.body;

  // 1. Tenant Isolation: Check duplicate email ONLY in this account
  const exists = await UserStaff.findOne({
    email,
    accountId: req.user.accountId,
    isDeleted: false
  }).lean();

  if (exists) return res.status(400).json({ message: "Staff email already exists in your company" });

  const hashed = await bcrypt.hash(password, 12);

  // 2. Data creation with secure fields from req.user
  const staff = await UserStaff.create({
    name,
    email,
    password: hashed,
    permissions,
    accountId: req.user.accountId,    // From Auth Middleware
    accountType: req.user.accountType, // From Auth Middleware
    createdBy: req.user.userId,
    isActive: true
  });

  res.status(201).json({ success: true, message: "Staff created successfully" });
});

/* ================= GET STAFFS (Optimized) ================= */
export const getStaffs = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "all" } = req.query;

  const query = {
    accountId: req.user.accountId, // Multi-tenant Filter
    isDeleted: false
  };

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  // Parallel Execution for speed
  const [total, staffs] = await Promise.all([
    UserStaff.countDocuments(query),
    UserStaff.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean()
  ]);

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / limit),
    data: staffs
  });
});

/* ================= UPDATE STAFF ================= */
export const updateStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  const staff = await UserStaff.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId, isDeleted: false },
    { name, permissions },
    { new: true, runValidators: true }
  ).select("-password").lean();

  if (!staff) return res.status(404).json({ message: "Staff not found" });

  res.json({ success: true, message: "Staff updated", data: staff });
});

/* ================= SOFT DELETE ================= */
export const deleteStaff = catchAsync(async (req, res) => {
  const staff = await UserStaff.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!staff) return res.status(404).json({ message: "Staff not found" });

  res.json({ success: true, message: "Staff deleted" });
});

/* ================= TOGGLE STAFF STATUS (Activate/Deactivate) ================= */
export const toggleStaffStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 1. Staff dhoondo jo usi account ka ho aur soft-delete na hua ho
  const staff = await UserStaff.findOne({
    _id: id,
    accountId: req.user.accountId,
    isDeleted: false
  });

  if (!staff) return res.status(404).json({ message: "Staff member not found" });

  // 2. Status toggle karo (Flip logic)
  staff.isActive = !staff.isActive;
  await staff.save();

  res.json({
    success: true,
    message: `Staff ${staff.isActive ? "activated" : "deactivated"} successfully`,
    data: { 
      id: staff._id, 
      isActive: staff.isActive 
    }
  });
});



















// import UserStaff from "../models/userStaff.model.js";
// import bcrypt from "bcryptjs";

// /* ================= CREATE STAFF ================= */

// export const createStaff = async (req, res) => {
//   try {

//     const { name, email, password, permissions } = req.body;

//     // Duplicate check
//     const exists = await UserStaff.findOne({
//       email,
//       accountId: req.user.accountId,
//       isDeleted: false
//     });

//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "Staff already exists"
//       });
//     }

//     if (!password || password.length < 6) {
//       return res.status(400).json({
//         message: "Password too short"
//       });
//     }

//     const hashed = await bcrypt.hash(password, 12);

//     const staff = await UserStaff.create({
//       name,
//       email,
//       password: hashed,
//       permissions,
//       accountId: req.user.accountId,
//       accountType: req.user.accountType,
//       createdBy: req.user.userId,
//       role: "STAFF",
//       isActive: true
//     });

//     res.status(201).json({
//       success: true,
//       message: "Staff created successfully",
//       staff
//     });

//   } catch (err) {
//     console.error("CREATE STAFF:", err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to create staff"
//     });
//   }
// };


// /* ================= GET STAFF (PAGINATION + FILTER) ================= */

// export const getStaffs = async (req, res) => {
//   try {

//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       status = "all"
//     } = req.query;

//     const query = {
//       accountId: req.user.accountId,
//       isDeleted: false
//     };

//     // Status filter
//     if (status === "active") query.isActive = true;
//     if (status === "inactive") query.isActive = false;

//     // Search
//     if (search) {
//       query.$or = [
//         { name: new RegExp(search, "i") },
//         { email: new RegExp(search, "i") }
//       ];
//     }

//     const skip = (page - 1) * limit;

//     const total = await UserStaff.countDocuments(query);

//     const staffs = await UserStaff.find(query)
//       .select("-password")
//       .skip(skip)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       total,
//       page: Number(page),
//       pages: Math.ceil(total / limit),
//       staffs
//     });

//   } catch (err) {
//     console.error("GET STAFF:", err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch staff"
//     });
//   }
// };


// /* ================= UPDATE STAFF ================= */

// export const updateStaff = async (req, res) => {
//   try {

//     const { id } = req.params;
//     const { name, email, permissions } = req.body;

//     const staff = await UserStaff.findOneAndUpdate(
//       {
//         _id: id,
//         accountId: req.user.accountId,
//         isDeleted: false
//       },
//       { name, email, permissions },
//       { new: true }
//     ).select("-password");

//     if (!staff) {
//       return res.status(404).json({
//         success: false,
//         message: "Staff not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Staff updated",
//       staff
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: "Update failed"
//     });
//   }
// };


// /* ================= TOGGLE ACTIVE ================= */

// export const toggleStaffStatus = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const staff = await UserStaff.findOne({
//       _id: id,
//       accountId: req.user.accountId,
//       isDeleted: false
//     });

//     if (!staff) {
//       return res.status(404).json({
//         success: false,
//         message: "Staff not found"
//       });
//     }

//     staff.isActive = !staff.isActive;

//     await staff.save();

//     res.json({
//       success: true,
//       message: `Staff ${staff.isActive ? "activated" : "deactivated"}`
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: "Status change failed"
//     });
//   }
// };


// /* ================= SOFT DELETE ================= */

// export const deleteStaff = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const staff = await UserStaff.findOneAndUpdate(
//       {
//         _id: id,
//         accountId: req.user.accountId
//       },
//       { isDeleted: true, isActive: false },
//       { new: true }
//     );

//     if (!staff) {
//       return res.status(404).json({
//         success: false,
//         message: "Staff not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Staff deleted"
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: "Delete failed"
//     });
//   }
// };
