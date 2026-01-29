// src/services/settlement.service.js
export const calculateSettlement = (trips, advances) => {
  const totalTripAmount = trips.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const totalAdvance = advances.reduce(
    (sum, a) => sum + a.amount,
    0
  );

  return {
    totalTripAmount,
    totalAdvance,
    balance: totalTripAmount - totalAdvance
  };
};
