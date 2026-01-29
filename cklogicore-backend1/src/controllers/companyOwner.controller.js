const Company = require("../models/companyOwner.model");

exports.createCompany = async (req, res) => {
  const company = await Company.create({
    ...req.body,
    createdBy: req.user.userId,
  });

  res.status(201).json(company);
};

exports.getCompanies = async (req, res) => {
  const filter =
    req.user.role === "ADMIN"
      ? {}
      : { createdBy: req.user.userId };

  const companies = await Company.find(filter);
  res.json(companies);
};
