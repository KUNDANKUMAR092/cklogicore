// supplierOwner.controller.js

import SupplierOwner from "../models/supplierOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= CREATE SUPPLIER ================= */
export const createSupplier = catchAsync(async (req, res) => {
  // 🛡️ Logic Check: Jo khud Supplier hai wo dusre supplier add nahi karega
  if (req.user.accountType === ACCOUNT_TYPES.SUPPLIER) {
    return res.status(403).json({ 
      success: false,
      message: "Suppliers cannot add other suppliers." 
    });
  }

  const exists = await SupplierOwner.findOne({ 
    mobile: req.body.mobile, 
    accountId: req.user.accountId, 
    isDeleted: false 
  }).lean();

  if (exists) return res.status(400).json({ message: "Supplier with this mobile already exists" });

  const supplier = await SupplierOwner.create({
    ...req.body,
    accountId: req.user.accountId,
    createdBy: req.user.userId
  });

  res.status(201).json({ success: true, data: supplier });
});

/* ================= TOGGLE STATUS (Active/Deactive) ================= */
export const toggleStatus = catchAsync(async (req, res) => {
  const supplier = await SupplierOwner.findOne({ 
    _id: req.params.id, 
    accountId: req.user.accountId,
    isDeleted: false 
  });

  if (!supplier) return res.status(404).json({ message: "Supplier not found" });

  supplier.isActive = !supplier.isActive;
  await supplier.save();

  res.json({ 
    success: true, 
    message: `Supplier ${supplier.isActive ? "activated" : "deactivated"} successfully` 
  });
});

/* ================= GET ALL (With Status Filter) ================= */
export const getSuppliers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "all" } = req.query;
  
  const query = { accountId: req.user.accountId, isDeleted: false };
  
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } }
    ];
  }

  const [total, suppliers] = await Promise.all([
    SupplierOwner.countDocuments(query),
    SupplierOwner.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean()
  ]);

  res.json({ success: true, total, data: suppliers });
});

// Update aur Delete functions pehle jaise hi rahenge...

/* ================= UPDATE SUPPLIER ================= */
export const updateSupplier = catchAsync(async (req, res) => {
  const supplier = await SupplierOwner.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  ).lean();

  if (!supplier) return res.status(404).json({ message: "Supplier not found" });

  res.json({ success: true, data: supplier });
});

/* ================= DELETE (SOFT) ================= */
export const deleteSupplier = catchAsync(async (req, res) => {
  const supplier = await SupplierOwner.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true }
  );
  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  res.json({ success: true, message: "Supplier removed" });
});







// 
// import SupplierOwner from "../models/supplierOwner.model.js";
// import { logAudit } from "../utils/auditLogger.js";


// // 🔹 Create Supplier
// export const createSupplier = async (req, res) => {
//   const { name, email, mobile } = req.body;

//   const supplier = await SupplierOwner.create({
//     name,
//     email,
//     mobile,
//     accountId: req.user.accountId
//   });

//   // 🔍 AUDIT LOG
//   await logAudit({
//     accountId: req.user.accountId,
//     userId: req.user._id,
//     action: "CREATE",
//     entity: "Supplier",
//     entityId: supplier._id,
//     changes: req.body
//   });

//   res.json(supplier);
// };

// // 🔹 Get all suppliers (Dropdown)
// export const getSuppliers = async (req, res) => {
//   const suppliers = await SupplierOwner.find({
//     accountId: req.user.accountId
//   });

//   res.json(suppliers);
// };

// // 🔹 Update Supplier
// export const updateSupplier = async (req, res) => {
//   const updated = await SupplierOwner.findOneAndUpdate(
//     { _id: req.params.id, accountId: req.user.accountId },
//     req.body,
//     { new: true }
//   );

//   res.json(updated);
// };

// // 🔹 Delete Supplier
// // export const deleteSupplier = async (req, res) => {
// //   await SupplierOwner.findOneAndDelete({
// //     _id: req.params.id,
// //     accountId: req.user.accountId
// //   });

// //   res.json({ message: "Deleted successfully" });
// // };

// export const deleteSupplier = async (req, res) => {
//   const supplier = await SupplierOwner.findOneAndUpdate(
//     { _id: req.params.id, accountId: req.user.accountId },
//     { isDeleted: true },
//     { new: true }
//   );

//   if (!supplier) {
//     return res.status(404).json({ message: "Supplier not found" });
//   }

//   // 🔍 AUDIT LOG
//   await logAudit({
//     accountId: req.user.accountId,
//     userId: req.user._id,
//     action: "DELETE",
//     entity: "Supplier",
//     entityId: supplier._id,
//     changes: { isDeleted: true }
//   });

//   res.json({ message: "Supplier deleted (soft)" });
// };

// export const getMySupplierProfile = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const supplier = await Supplier.findOne({
//       createdBy: userId,
//       isActive: true,
//     });

//     if (!supplier) {
//       return res.status(404).json({
//         message: "Profile not found",
//       });
//     }

//     res.json(supplier);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };