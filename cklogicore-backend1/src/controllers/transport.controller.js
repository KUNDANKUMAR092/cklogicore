const Transport = require("../models/transport.model");
const Company = require("../models/companyOwner.model");
const Supplier = require("../models/supplierOwner.model");
const Vehicle = require("../models/vehicleOwner.model");

exports.createTransport = async (req, res) => {
  const { companyId, supplierId, vehicleId, loadTotalTon, unloadTotalTon } =
    req.body;

  const company = await Company.findById(companyId);
  const supplier = await Supplier.findById(supplierId);
  const vehicle = await Vehicle.findById(vehicleId);

  const transport = await Transport.create({
    ...req.body,
    companyPerTonRate: company.perTonRate,
    vehiclePerTonRate: vehicle.perTonRate,
    supplierProfitPerTon: supplier.profitPerTon,

    companyTotalAmount: unloadTotalTon * company.perTonRate,
    vehicleTotalAmount: unloadTotalTon * vehicle.perTonRate,
    supplierTotalProfit: unloadTotalTon * supplier.profitPerTon,

    createdBy: req.user.userId,
    createdByRole: req.user.role,
  });

  res.status(201).json(transport);
};

exports.getTransports = async (req, res) => {
  const filter =
    req.user.role === "ADMIN"
      ? {}
      : { createdBy: req.user.userId };

  const data = await Transport.find(filter)
    .populate("companyId")
    .populate("supplierId")
    .populate("vehicleId");

  res.json(data);
};
