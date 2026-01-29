// src/controllers/settlement.controller.js
import Trip from "../models/trip.model.js";
import AdvancePayment from "../models/advancePayment.model.js";
import { calculateSettlement } from "../services/settlement.service.js";

export const getSettlement = async (req, res) => {
  const { fromDate, toDate } = req.query;

  const trips = await Trip.find({
    accountId: req.user.accountId,
    date: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    }
  });

  const advances = await AdvancePayment.find({
    accountId: req.user.accountId
  });

  const settlement = calculateSettlement(trips, advances);

  res.json({
    period: { fromDate, toDate },
    ...settlement
  });
};
