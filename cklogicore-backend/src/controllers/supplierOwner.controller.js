// supplierOwner.controller.js
import SupplierOwner from "../models/supplierOwner.model.js";
import { logAudit } from "../utils/auditLogger.js";


// 🔹 Create Supplier
export const createSupplier = async (req, res) => {
  const { name, email, mobile } = req.body;

  const supplier = await SupplierOwner.create({
    name,
    email,
    mobile,
    accountId: req.user.accountId
  });

  // 🔍 AUDIT LOG
  await logAudit({
    accountId: req.user.accountId,
    userId: req.user._id,
    action: "CREATE",
    entity: "Supplier",
    entityId: supplier._id,
    changes: req.body
  });

  res.json(supplier);
};

// 🔹 Get all suppliers (Dropdown)
export const getSuppliers = async (req, res) => {
  const suppliers = await SupplierOwner.find({
    accountId: req.user.accountId
  });

  res.json(suppliers);
};

// 🔹 Update Supplier
export const updateSupplier = async (req, res) => {
  const updated = await SupplierOwner.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    req.body,
    { new: true }
  );

  res.json(updated);
};

// 🔹 Delete Supplier
// export const deleteSupplier = async (req, res) => {
//   await SupplierOwner.findOneAndDelete({
//     _id: req.params.id,
//     accountId: req.user.accountId
//   });

//   res.json({ message: "Deleted successfully" });
// };

export const deleteSupplier = async (req, res) => {
  const supplier = await SupplierOwner.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true },
    { new: true }
  );

  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found" });
  }

  // 🔍 AUDIT LOG
  await logAudit({
    accountId: req.user.accountId,
    userId: req.user._id,
    action: "DELETE",
    entity: "Supplier",
    entityId: supplier._id,
    changes: { isDeleted: true }
  });

  res.json({ message: "Supplier deleted (soft)" });
};


