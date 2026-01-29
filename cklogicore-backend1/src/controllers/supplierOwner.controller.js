const Supplier = require("../models/supplierOwner.model");

exports.createSupplier = async (req, res) => {
  const supplier = await Supplier.create({
    ...req.body,
    createdBy: req.user.userId,
  });

  res.status(201).json(supplier);
};

exports.getSuppliers = async (req, res) => {
  const filter =
    req.user.role === "ADMIN"
      ? {}
      : { createdBy: req.user.userId };

  const suppliers = await Supplier.find(filter);
  res.json(suppliers);
};
