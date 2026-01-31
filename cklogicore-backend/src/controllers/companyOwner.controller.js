// src/controller/companyOwner.controller.js

import CompanyOwner from "../models/companyOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= CREATE COMPANIES ================= */
export const createCompany = catchAsync(async (req, res) => {
  // 🛡️ SECURITY: Khud Company hokar doosri company add nahi kar sakte
  if (req.user.accountType === ACCOUNT_TYPES.COMPANY) {
    return res.status(403).json({ 
      success: false, 
      message: "Companies cannot add other companies. Please manage your own profile." 
    });
  }

  const { mobile } = req.body;

  const exists = await CompanyOwner.findOne({ 
    mobile, 
    accountId: req.user.accountId, 
    isDeleted: false 
  });
  if (exists) return res.status(400).json({ message: "Company with this mobile already exists" });

  const company = await CompanyOwner.create({
    ...req.body,
    accountId: req.user.accountId,
    createdBy: req.user.userId
  });

  res.status(201).json({ success: true, data: company });
});

/* ================= GET COMPANIES ================= */
export const getCompanies = catchAsync(async (req, res) => {
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

  const [total, companies] = await Promise.all([
    CompanyOwner.countDocuments(query),
    CompanyOwner.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean()
  ]);

  res.json({ success: true, total, data: companies });
});

/* ================= UPDATE COMPANIES ================= */
export const updateCompany = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 🛡️ Ensure ki company usi account ki ho aur deleted na ho
  const company = await CompanyOwner.findOneAndUpdate(
    { 
      _id: id, 
      accountId: req.user.accountId, 
      isDeleted: false 
    },
    { $set: req.body }, // Body mein jo bhi fields aayenge wo update ho jayenge
    { new: true, runValidators: true }
  ).lean();

  if (!company) {
    return res.status(404).json({ success: false, message: "Company not found" });
  }

  res.json({ 
    success: true, 
    message: "Company details updated successfully", 
    data: company 
  });
});

/* ================= TOGGLE STATUS COMPANIES ================= */
export const toggleCompanyStatus = catchAsync(async (req, res) => {
  const company = await CompanyOwner.findOne({ 
    _id: req.params.id, 
    accountId: req.user.accountId,
    isDeleted: false 
  });

  if (!company) return res.status(404).json({ message: "Company not found" });

  company.isActive = !company.isActive;
  await company.save();

  res.json({ success: true, message: `Company ${company.isActive ? "activated" : "deactivated"}` });
});

/* ================= SOFT DELETE COMPANIES ================= */
export const deleteCompany = catchAsync(async (req, res) => {
  const company = await CompanyOwner.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true, isActive: false }
  );
  if (!company) return res.status(404).json({ message: "Company not found" });
  res.json({ success: true, message: "Company removed successfully" });
});






// import CompanyOwner from "../models/companyOwner.model.js";
// import { logAudit } from "../utils/auditLogger.js";

// export const createCompany = async (req, res) => {
//   const { name, address, gstNo } = req.body;
//   const company = await CompanyOwner.create({
//     name, address, gstNo, accountId: req.user.accountId
//   });

//   // 🔍 AUDIT LOG
//   await logAudit({
//     accountId: req.user.accountId,
//     userId: req.user._id,
//     action: "CREATE",
//     entity: "Company",
//     entityId: company._id,
//     changes: req.body
//   });

//   res.json(company);
// };

// export const getCompanies = async (req, res) => {
//   const companies = await CompanyOwner.find({ accountId: req.user.accountId });
//   res.json(companies);
// };

// export const updateCompany = async (req, res) => {
//   const { id } = req.params;
//   const updated = await CompanyOwner.findOneAndUpdate(
//     { _id: id, accountId: req.user.accountId },
//     req.body,
//     { new: true }
//   );
//   res.json(updated);
// };

// export const deleteCompany = async (req, res) => {
//   const { id } = req.params;
//   await CompanyOwner.findOneAndDelete({ _id: id, accountId: req.user.accountId });

//   // 🔍 AUDIT LOG
//   await logAudit({
//     accountId: req.user.accountId,
//     userId: req.user._id,
//     action: "DELETE",
//     entity: "Company",
//     entityId: company._id,
//     changes: { isDeleted: true }
//   });

//   res.json({ message: "Deleted successfully" });
// };
