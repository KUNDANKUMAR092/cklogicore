// supplierOwner.controller.js

import SupplierOwner from "../models/supplierOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { flattenObject } from "../utils/flattenObject.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= CREATE SUPPLIER ================= */
export const createSupplier = catchAsync(async (req, res) => {
  // 🛡️ SECURITY: Supplier account cannot add other suppliers
  if (req.user.accountType === ACCOUNT_TYPES.SUPPLIER) {
    return res.status(403).json({ 
      success: false, 
      message: "Suppliers cannot add other suppliers." 
    });
  }

  const { mobile } = req.body;

  const exists = await SupplierOwner.findOne({ 
    mobile, 
    accountId: req.user.accountId, 
    isDeleted: false 
  });
  if (exists) return res.status(400).json({ success: false, message: "Supplier with this mobile already exists" });

  const supplier = await SupplierOwner.create({
    ...req.body,
    accountId: req.user.accountId,
    createdBy: req.user.userId
  });

  res.status(201).json({ success: true, data: supplier });
});

/* ================= GET SUPPLIERS ================= */
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

/* ================= UPDATE SUPPLIER ================= */
export const updateSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;

  let updateData = { ...req.body };
  delete updateData._id;
  delete updateData.accountId;
  delete updateData.createdBy;

  const flattenedData = flattenObject(updateData);

  const supplier = await SupplierOwner.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId, isDeleted: false },
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).lean();

  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" });
  }

  res.json({ success: true, message: "Supplier details updated successfully", data: supplier });
});

/* ================= TOGGLE STATUS ================= */
export const toggleSupplierStatus = catchAsync(async (req, res) => {
  const supplier = await SupplierOwner.findOne({ 
    _id: req.params.id, 
    accountId: req.user.accountId,
    isDeleted: false 
  });

  if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

  supplier.isActive = !supplier.isActive;
  await supplier.save();

  res.json({ success: true, message: `Supplier ${supplier.isActive ? "activated" : "deactivated"}` });
});

/* ================= SOFT DELETE ================= */
export const deleteSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const supplier = await SupplierOwner.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } },
    { new: true }
  );

  if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
  
  res.locals.entityId = id;
  res.json({ success: true, message: "Supplier removed successfully" });
});