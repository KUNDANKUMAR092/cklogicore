import Vehicle from "../models/vehicleOwner.model.js";
import { logAudit } from "../utils/auditLogger.js";

export const createVehicle = async (req, res) => {
  const { vehicleNumber, ownerName, mobile } = req.body;
  const vehicle = await Vehicle.create({
    vehicleNumber,
    ownerName,
    mobile,
    accountId: req.user.accountId
  });

  // 🔍 AUDIT LOG
  await logAudit({
    accountId: req.user.accountId,
    userId: req.user._id,
    action: "CREATE",
    entity: "Vehicle",
    entityId: vehicle._id,
    changes: req.body
  });

  res.json(vehicle);
};

export const getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ accountId: req.user.accountId });
  res.json(vehicles);
};

export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const updated = await Vehicle.findOneAndUpdate(
    { _id: id, accountId: req.user.accountId },
    req.body,
    { new: true }
  );
  res.json(updated);
};

export const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  await Vehicle.findOneAndDelete({ _id: id, accountId: req.user.accountId });

  // 🔍 AUDIT LOG
  await logAudit({
    accountId: req.user.accountId,
    userId: req.user._id,
    action: "DELETE",
    entity: "Vehicle",
    entityId: vehicle._id,
    changes: { isDeleted: true }
  });


  res.json({ message: "Deleted successfully" });
};
