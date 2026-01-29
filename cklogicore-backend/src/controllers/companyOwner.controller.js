import CompanyOwner from "../models/companyOwner.model.js";
import { logAudit } from "../utils/auditLogger.js";

export const createCompany = async (req, res) => {
  const { name, address, gstNo } = req.body;
  const company = await CompanyOwner.create({
    name, address, gstNo, accountId: req.user.accountId
  });

  // 🔍 AUDIT LOG
  await logAudit({
    accountId: req.user.accountId,
    userId: req.user._id,
    action: "CREATE",
    entity: "Company",
    entityId: company._id,
    changes: req.body
  });

  res.json(company);
};

export const getCompanies = async (req, res) => {
  const companies = await CompanyOwner.find({ accountId: req.user.accountId });
  res.json(companies);
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const updated = await CompanyOwner.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId },
    req.body,
    { new: true }
  );
  res.json(updated);
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  await CompanyOwner.findOneAndDelete({ _id: id, accountId: req.user.accountId });

  // 🔍 AUDIT LOG
  await logAudit({
    accountId: req.user.accountId,
    userId: req.user._id,
    action: "DELETE",
    entity: "Company",
    entityId: company._id,
    changes: { isDeleted: true }
  });

  res.json({ message: "Deleted successfully" });
};
