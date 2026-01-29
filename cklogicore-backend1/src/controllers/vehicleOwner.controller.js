const Vehicle = require("../models/vehicleOwner.model");

exports.createVehicle = async (req, res) => {
  const vehicle = await Vehicle.create({
    ...req.body,
    createdBy: req.user.userId,
  });

  res.status(201).json(vehicle);
};

exports.getVehicles = async (req, res) => {
  const filter =
    req.user.role === "ADMIN"
      ? {}
      : { createdBy: req.user.userId };

  const vehicles = await Vehicle.find(filter);
  res.json(vehicles);
};
