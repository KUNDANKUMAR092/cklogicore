// src/controllers/advancePayment.controller.js
import AdvancePayment from "../models/advancePayment.model.js";

export const addAdvancePayment = async (req, res) => {
  const {
    tripId,
    paidTo,
    paidBy,
    amount,
    paymentType // TRIP | TOTAL
  } = req.body;

  const advance = await AdvancePayment.create({
    tripId,
    paidTo,
    paidBy,
    amount,
    paymentType,
    accountId: req.user.accountId,
    createdBy: req.user.userId
  });

  res.json(advance);
};
