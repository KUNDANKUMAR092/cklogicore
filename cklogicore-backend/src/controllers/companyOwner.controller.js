// src/controller/companyOwner.controller.js

import CompanyOwner from "../models/companyOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { flattenObject } from "../utils/flattenObject.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= CREATE COMPANY ================= */
export const createCompany = catchAsync(async (req, res) => {
  // 🛡️ SECURITY: Company account cannot add other companies
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
  if (exists) return res.status(400).json({ success: false, message: "Company with this mobile already exists" });

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

/* ================= UPDATE COMPANY ================= */
export const updateCompany = catchAsync(async (req, res) => {
  const { id } = req.params;

  const existingCompany = await CompanyOwner.findOne({ 
    _id: id, 
    accountId: req.user.accountId, 
    isDeleted: false 
  });

  if (!existingCompany) {
    return res.status(404).json({ success: false, message: "Company not found" });
  }

  // 🛡️ SECURITY:
  if (!existingCompany.isActive) {
    return res.status(400).json({ 
      success: false, 
      message: "Inactive company cannot be updated. Please activate it first." 
    });
  }

  let updateData = { ...req.body };
  delete updateData._id;
  delete updateData.accountId;
  delete updateData.createdBy;

  const flattenedData = flattenObject(updateData);

  const updatedCompany = await CompanyOwner.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId, isDeleted: false, isActive: true }, // Filter safe side
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).lean();

  res.json({ success: true, message: "Company details updated successfully", data: updatedCompany });
});

/* ================= TOGGLE STATUS ================= */
export const toggleCompanyStatus = catchAsync(async (req, res) => {
  const company = await CompanyOwner.findOne({ 
    _id: req.params.id, 
    accountId: req.user.accountId,
    isDeleted: false 
  });

  if (!company) return res.status(404).json({ success: false, message: "Company not found" });

  company.isActive = !company.isActive;
  await company.save();

  res.json({ success: true, message: `Company ${company.isActive ? "activated" : "deactivated"}` });
});

/* ================= SOFT DELETE ================= */
export const deleteCompany = catchAsync(async (req, res) => {
  const { id } = req.params;
  const company = await CompanyOwner.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } },
    { new: true }
  );

  if (!company) return res.status(404).json({ success: false, message: "Company not found" });
  
  res.locals.entityId = id;
  res.json({ success: true, message: "Company removed successfully" });
});