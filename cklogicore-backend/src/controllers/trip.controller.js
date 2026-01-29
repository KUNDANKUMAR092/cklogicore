import Trip from "../models/trip.model.js";
import AdvancePayment from "../models/advancePayment.model.js";
import { calculateTripProfit } from "../services/profit.service.js";

import Supplier from "../models/supplierOwner.model.js";
import Company from "../models/companyOwner.model.js";
import Vehicle from "../models/vehicleOwner.model.js";

export const addTrip = async (req, res) => {
  try {
    const {
      supplierId,
      companyId,
      vehicleId,
      totalTonLoad,
      rates,
      financials,
      tripDate,
      loadingPoint,
      unloadingPoint
    } = req.body;

    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(403).json({
        message: "AccountId missing. Trip cannot be created."
      });
    }

    if (!accountId) {
      return res.status(401).json({ message: "AccountId missing in token" });
    }

    // 🔐 VALIDATION: all must belong to same tenant
    const supplier = await Supplier.findOne({ _id: supplierId, accountId });
    const company = await Company.findOne({ _id: companyId, accountId });
    const vehicle = await Vehicle.findOne({ _id: vehicleId, accountId });

    if (!supplier || !company || !vehicle) {
      return res.status(400).json({
        message: "Supplier / Company / Vehicle does not belong to your account"
      });
    }

    // delete req.body.accountId;

    const trip = await Trip.create({
      supplierId,
      companyId,
      vehicleId,
      totalTonLoad,
      rates,
      financials,
      tripDate,
      loadingPoint,
      unloadingPoint,
      accountId,
      createdByUserId: req.user._id || req.user.id
    });

    console.log("REQ.USER =", req.user);
    console.log("REQ.BODY =", req.body);
    console.log("ACCOUNT ID =", req.user?.accountId);

    res.status(201).json(trip);
  } catch (err) {
    console.error("TRIP ERROR FULL:", err);

    res.status(500).json({
      message: "Failed to create trip",
      error: err.message,
      name: err.name,
      stack: err.stack
    });
  }
};

// 🔹 Get Trips (with optional filters)
export const getTrips = async (req, res) => {
  const { fromDate, toDate, companyId, supplierId, vehicleId } = req.query;

  let filter = { accountId: req.user.accountId };

  // if (fromDate && toDate) filter.date = { $gte: fromDate, $lte: toDate };
  if (fromDate && toDate) filter.tripDate = { $gte: fromDate, $lte: toDate };
  if (companyId) filter.companyId = companyId;
  if (supplierId) filter.supplierId = supplierId;
  if (vehicleId) filter.vehicleId = vehicleId;

  const trips = await Trip.find(filter)
    .populate("supplierId", "name")
    .populate("companyId", "name")
    .populate("vehicleId", "vehicleNumber");

  res.json(trips);
};

// 🔹 Add Advance Payment
export const addAdvancePayment = async (req, res) => {
  const { paidByRole, receivedByRole, amount, scopeType, tripId, note, date } = req.body;

  const advance = await AdvancePayment.create({
    accountId: req.user.accountId,
    paidByRole,
    receivedByRole,
    amount,
    scopeType,
    tripId: tripId || null,
    note,
    date
  });

  res.json(advance);
};

// 🔹 Get Advance Payments (optional trip filter)
export const getAdvancePayments = async (req, res) => {
  const { tripId } = req.query;

  let filter = { accountId: req.user.accountId };
  if (tripId) filter.tripId = tripId;

  const advances = await AdvancePayment.find(filter);
  res.json(advances);
};


export const recalculateTripProfit = async (req, res) => {
  const trip = await Trip.findOne({
    _id: req.params.id,
    accountId: req.user.accountId
  });

  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  trip.profit = calculateTripProfit(trip);
  await trip.save();

  res.json({ profit: trip.profit });
};
