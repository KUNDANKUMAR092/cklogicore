export const calculateTripProfit = (trip) => {
  const {
    totalTonLoad,
    rates,
    financials
  } = trip;

  const companyFreight =
    totalTonLoad * (rates?.companyRatePerTon || 0);

  const vehicleCost =
    totalTonLoad * (rates?.vehicleRatePerTon || 0);

  const expenses =
    (financials?.dieselCost || 0) +
    (financials?.tollCost || 0) +
    (financials?.driverExpense || 0) +
    (financials?.otherExpense || 0);

  return companyFreight - vehicleCost - expenses;
};
