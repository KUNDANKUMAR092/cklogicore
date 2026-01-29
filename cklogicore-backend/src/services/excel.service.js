// src/services/excel.service.js
export const formatTripsForExcel = (trips, viewType) => {
  return trips.map(trip => {
    const base = {
      Date: trip.date,
      From: trip.from,
      To: trip.to,
      Quantity: trip.quantity,
      Vehicle: trip.vehicleNumber
    };

    if (viewType === "COMPANY") {
      return {
        ...base,
        "Company Rate": trip.companyRatePerTon,
        "Total Amount": trip.companyRatePerTon * trip.quantity
      };
    }

    if (viewType === "VEHICLE") {
      return {
        ...base,
        "Vehicle Rate": trip.vehicleRatePerTon,
        "Total Amount": trip.vehicleRatePerTon * trip.quantity
      };
    }

    // SUPPLIER
    return {
      ...base,
      "Company Rate": trip.companyRatePerTon,
      "Vehicle Rate": trip.vehicleRatePerTon,
      Profit:
        (trip.companyRatePerTon - trip.vehicleRatePerTon) * trip.quantity
    };
  });
};
