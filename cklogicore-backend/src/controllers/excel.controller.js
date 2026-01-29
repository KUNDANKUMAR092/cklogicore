import ExcelJS from "exceljs";
import Transport from "../models/trip.model.js";

// 🔹 Export Trips to Excel
export const exportExcel = async (req, res) => {
  try {
    const { view, fromDate, toDate, companyId, vehicleId, supplierId } = req.query;

    let filter = { accountId: req.user.accountId };

    if (fromDate && toDate) filter.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    if (companyId) filter.companyId = companyId;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (supplierId) filter.supplierId = supplierId;

    const trips = await Transport.find(filter)
      .populate("supplierId", "name")
      .populate("companyId", "name")
      .populate("vehicleId", "vehicleNumber");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Trips Report");

    // Header & Data according to view
    if (view === "company") {
      sheet.addRow([
        "Date",
        "From",
        "To",
        "Company Name",
        "Supplier Name",
        "Total Ton Load",
        "Company Rate Per Ton",
        "Amount for Company"
      ]);

      trips.forEach((t) => {
        const amount = t.companyRatePerTon * t.totalTonLoad;
        sheet.addRow([
          t.date.toISOString().split("T")[0],
          t.from,
          t.to,
          t.companyId.name,
          t.supplierId.name,
          t.totalTonLoad,
          t.companyRatePerTon,
          amount
        ]);
      });
    } else if (view === "vehicle") {
      sheet.addRow([
        "Date",
        "From",
        "To",
        "Vehicle Number",
        "Supplier Name",
        "Total Ton Load",
        "Vehicle Rate Per Ton",
        "Amount for Vehicle"
      ]);

      trips.forEach((t) => {
        const amount = t.vehicleRatePerTon * t.totalTonLoad;
        sheet.addRow([
          t.date.toISOString().split("T")[0],
          t.from,
          t.to,
          t.vehicleId.vehicleNumber,
          t.supplierId.name,
          t.totalTonLoad,
          t.vehicleRatePerTon,
          amount
        ]);
      });
    } else if (view === "supplier") {
      sheet.addRow([
        "Date",
        "From",
        "To",
        "Company Name",
        "Vehicle Number",
        "Total Ton Load",
        "Company Rate",
        "Vehicle Rate",
        "Profit",
        "Amount for Company",
        "Amount for Vehicle"
      ]);

      trips.forEach((t) => {
        const amountCompany = t.companyRatePerTon * t.totalTonLoad;
        const amountVehicle = t.vehicleRatePerTon * t.totalTonLoad;
        const profit = amountCompany - amountVehicle;

        sheet.addRow([
          t.date.toISOString().split("T")[0],
          t.from,
          t.to,
          t.companyId.name,
          t.vehicleId.vehicleNumber,
          t.totalTonLoad,
          t.companyRatePerTon,
          t.vehicleRatePerTon,
          profit,
          amountCompany,
          amountVehicle
        ]);
      });
    } else {
      return res.status(400).json({ message: "Invalid view type" });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=trips_${view}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel export failed", error: err.message });
  }
};
