import Trip from "../models/trip.model.js";

export const supplierReport = async (req, res) => {
  const report = await Trip.aggregate([
    { $match: { accountId: req.user.accountId } },
    {
      $group: {
        _id: "$supplierId",
        totalTrips: { $sum: 1 },
        totalProfit: { $sum: "$profit" }
      }
    }
  ]);

  res.json(report);
};

export const vehicleReport = async (req, res) => {
  const report = await Trip.aggregate([
    { $match: { accountId: req.user.accountId } },
    {
      $group: {
        _id: "$vehicleId",
        totalTrips: { $sum: 1 },
        totalProfit: { $sum: "$profit" }
      }
    }
  ]);

  res.json(report);
};

export const companyReport = async (req, res) => {
  const report = await Trip.aggregate([
    {
      $match: {
        accountId: req.user.accountId
      }
    },
    {
      $group: {
        _id: "$companyId",
        totalTrips: { $sum: 1 },
        totalProfit: { $sum: "$profit" }
      }
    }
  ]);

  res.json(report);
};

export const profitSummary = async (req, res) => {
  try {
    const data = await Trip.aggregate([
      {
        $match: {
          accountId: req.user.accountId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalProfit: { $sum: "$profit" }
        }
      }
    ]);

    res.json(data[0] || { totalTrips: 0, totalProfit: 0 });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate profit summary" });
  }
};

