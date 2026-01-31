import Trip from "../models/trip.model.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. CREATE TRIP
export const createTrip = catchAsync(async (req, res) => {
  const trip = await Trip.create({
    ...req.body,
    accountId: req.user.accountId,
    createdByUserId: req.user.userId
  });

  res.status(201).json({ success: true, data: trip });
});

// 2. GET ALL TRIPS (With Pagination & Filters)
export const getTrips = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const query = { accountId: req.user.accountId, isDeleted: false };

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { loadingPoint: { $regex: search, $options: "i" } },
      { unloadingPoint: { $regex: search, $options: "i" } }
    ];
  }

  const [total, trips] = await Promise.all([
    Trip.countDocuments(query),
    Trip.find(query)
      .populate("supplierId", "name mobile")
      .populate("companyId", "name mobile")
      .populate("vehicleId", "vehicleNumber")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
  ]);

  res.json({ success: true, total, data: trips });
});

// 3. UPDATE TRIP
export const updateTrip = catchAsync(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId, isDeleted: false },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ success: true, data: trip });
});

// 4. TOGGLE STATUS (Active/Inactive)
export const toggleTripStatus = catchAsync(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, accountId: req.user.accountId });
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  trip.isActive = !trip.isActive;
  await trip.save();
  res.json({ success: true, message: `Trip ${trip.isActive ? "Activated" : "Deactivated"}` });
});

// 5. SOFT DELETE
export const deleteTrip = catchAsync(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true, deletedAt: new Date() }
  );
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ success: true, message: "Trip deleted successfully" });
});






// import Trip from "../models/trip.model.js";
// import AdvancePayment from "../models/advancePayment.model.js";
// import { calculateTripProfit } from "../services/profit.service.js";

// import Supplier from "../models/supplierOwner.model.js";
// import Company from "../models/companyOwner.model.js";
// import Vehicle from "../models/vehicleOwner.model.js";


// // 🔹 Get Trips (with optional filters)
// export const getTrips = async (req, res) => {
//   const { fromDate, toDate, companyId, supplierId, vehicleId } = req.query;

//   let filter = {
//     accountId: req.user.accountId,
//     // isDeleted: false
//   };


//   // if (fromDate && toDate) filter.date = { $gte: fromDate, $lte: toDate };
//   if (fromDate && toDate) filter.tripDate = { $gte: fromDate, $lte: toDate };
//   if (companyId) filter.companyId = companyId;
//   if (supplierId) filter.supplierId = supplierId;
//   if (vehicleId) filter.vehicleId = vehicleId;

//   const trips = await Trip.find(filter)
//     .populate("supplierId", "name")
//     .populate("companyId", "name")
//     .populate("vehicleId", "vehicleNumber");

//   res.json(trips);
// };

// // 🔹 Add Trips (with optional filters)
// export const addTrip = async (req, res) => {
//   try {
//     const {
//       supplierId,
//       companyId,
//       vehicleId,
//       totalTonLoad,
//       rates,
//       financials,
//       tripDate,
//       loadingPoint,
//       unloadingPoint
//     } = req.body;

//     // ✅ Basic Validation
//     if (!supplierId || !companyId || !vehicleId || !totalTonLoad) {
//       return res.status(400).json({
//         message: "supplierId, companyId, vehicleId, totalTonLoad are required"
//       });
//     }


//     const accountId = req.user.accountId;

//     if (!accountId) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // 🔐 VALIDATION: all must belong to same tenant
//     const supplier = await Supplier.findOne({ _id: supplierId, accountId });
//     const company = await Company.findOne({ _id: companyId, accountId });
//     const vehicle = await Vehicle.findOne({ _id: vehicleId, accountId });

//     if (!supplier || !company || !vehicle) {
//       return res.status(400).json({
//         message: "Supplier / Company / Vehicle does not belong to your account"
//       });
//     }

//     // delete req.body.accountId;

//     const trip = await Trip.create({
//       supplierId,
//       companyId,
//       vehicleId,
//       totalTonLoad,
//       rates,
//       financials,
//       tripDate,
//       loadingPoint,
//       unloadingPoint,
//       accountId,
//       createdByUserId: req.user._id || req.user.id
//     });

//     console.log("REQ.USER =", req.user);
//     console.log("REQ.BODY =", req.body);
//     console.log("ACCOUNT ID =", req.user?.accountId);

//     res.status(201).json(trip);
//   } catch (err) {
//     console.error("TRIP ERROR FULL:", err);

//     res.status(500).json({
//       message: "Failed to create trip",
//       error: err.message,
//       name: err.name,
//       stack: err.stack
//     });
//   }
// };

// // 🔹 updateTrip
// export const updateTrip = async (req, res) => {
//   try {
//     const trip = await Trip.findOneAndUpdate(
//       {
//         _id: req.params.id,
//         accountId: req.user.accountId,
//         isDeleted: false
//       },
//       {
//         $set: req.body
//       },
//       {
//         new: true,
//         runValidators: true
//       }
//     );

//     if (!trip) {
//       return res.status(404).json({ message: "Trip not found" });
//     }

//     res.json(trip);

//   } catch (err) {
//     console.error("UPDATE TRIP ERROR:", err);

//     res.status(500).json({
//       message: "Failed to update trip",
//       error: err.message
//     });
//   }
// };


// // 🔹 Toggle Trip (Enable / Disable)
// export const toggleTrip = async (req, res, next) => {
//   try {
//     const trip = await Trip.findOne({
//       _id: req.params.id,
//       accountId: req.user.accountId
//     });

//     if (!trip) {
//       return res.status(404).json({ message: "Trip not found" });
//     }

//     // Toggle
//     const newState = !trip.isDeleted;

//     trip.isDeleted = newState;
//     trip.status = newState ? "cancelled" : "pending";
//     trip.deletedAt = newState ? new Date() : null; // ✅ ADD

//     await trip.save();

//     res.json(trip);

//   } catch (err) {
//     next(err); // ✅ IMPORTANT
//   }
// };



// // 🔹 Add Advance Payment
// export const addAdvancePayment = async (req, res) => {
//   const { paidByRole, receivedByRole, amount, scopeType, tripId, note, date } = req.body;

//   const advance = await AdvancePayment.create({
//     accountId: req.user.accountId,
//     paidByRole,
//     receivedByRole,
//     amount,
//     scopeType,
//     tripId: tripId || null,
//     note,
//     date
//   });

//   res.json(advance);
// };

// // 🔹 Get Advance Payments (optional trip filter)
// export const getAdvancePayments = async (req, res) => {
//   const { tripId } = req.query;

//   let filter = { accountId: req.user.accountId };
//   if (tripId) filter.tripId = tripId;

//   const advances = await AdvancePayment.find(filter);
//   res.json(advances);
// };


// export const recalculateTripProfit = async (req, res) => {
//   const trip = await Trip.findOne({
//     _id: req.params.id,
//     accountId: req.user.accountId,
//     isDeleted: false
//   });

//   if (!trip) {
//     return res.status(404).json({ message: "Trip not found" });
//   }

//   trip.profit = calculateTripProfit(trip);
//   await trip.save();

//   res.json({ profit: trip.profit });
// };

