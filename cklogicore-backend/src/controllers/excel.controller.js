import ExcelJS from "exceljs";
import Trip from "../models/trip.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

export const exportTripsToExcel = async (req, res, next) => {
  try {
    const { startDate, endDate, target, status, companyId, vehicleId } = req.query;
    const { accountType, accountId } = req.user;

    // 1. Filter Query (Same as UI)
    const query = { accountId, isDeleted: false };
    if (startDate && endDate) query.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    if (status) query.status = status;
    if (companyId) query.companyId = companyId;
    if (vehicleId) query.vehicleId = vehicleId;

    const trips = await Trip.find(query)
      .populate("supplierId companyId vehicleId")
      .sort({ tripDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Trip Report");

    // 2. Decide Columns based on Target & AccountType
    let columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Trip ID", key: "tripId", width: 15 },
      { header: "Vehicle No", key: "vehicle", width: 15 },
      { header: "Loading Point", key: "loading", width: 20 },
      { header: "Unloading Point", key: "unloading", width: 20 },
      { header: "Weight (Ton)", key: "load", width: 10 },
    ];

    // 🛡️ Logic for Dynamic Amounts
    let rateField = "";
    let amountField = "";
    let headerLabel = "";

    if (target === ACCOUNT_TYPES.COMPANY) {
      rateField = "companyRatePerTon";
      amountField = "totalAmountForCompany";
      headerLabel = "Company Rate";
    } else {
      rateField = "vehicleRatePerTon";
      amountField = "totalAmountForVehicle";
      headerLabel = "Vehicle Rate";
    }

    columns.push(
      { header: headerLabel, key: "rate", width: 12 },
      { header: "Total Amount", key: "total", width: 15 }
    );

    worksheet.columns = columns;

    // 3. Header Styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

    // 4. Cumulative Totals Initialization
    let totalWeight = 0;
    let grandTotalAmount = 0;
    let totalProfitSum = 0;

    // 5. Data Rows
    trips.forEach((trip) => {
      const weight = trip.totalTonLoad || 0;
      const rate = trip.rates[rateField] || 0;
      const amount = trip.totalFinancials[amountField] || 0;
      const profit = trip.totalFinancials.profitPerTrip || 0;

      totalWeight += weight;
      grandTotalAmount += amount;
      totalProfitSum += profit;

      worksheet.addRow({
        date: trip.tripDate ? trip.tripDate.toISOString().split("T")[0] : "N/A",
        tripId: trip.tripId || "N/A",
        vehicle: trip.vehicleId?.vehicleNumber || "N/A",
        loading: trip.loadingPoint,
        unloading: trip.unloadingPoint,
        load: weight,
        rate: rate,
        total: amount
      });
    });

    // 6. 📊 Summary Section (at the end of Excel)
    worksheet.addRow([]); // Blank row
    
    const summaryHeader = worksheet.addRow(["--- SUMMARY REPORT ---"]);
    summaryHeader.font = { bold: true, size: 12 };

    worksheet.addRow(["Total Trips:", trips.length]);
    worksheet.addRow(["Total Weight (Tons):", totalWeight]);
    worksheet.addRow([`Total ${headerLabel} Amount:`, grandTotalAmount]);

    // 🛡️ Show Profit ONLY if the user is the OWNER or specific role
    // Middleman/Owner needs to see profit in their own excel
    if (accountType === ACCOUNT_TYPES.SUPPLIER || accountType === 'OWNER') {
        const profitRow = worksheet.addRow(["Total Net Profit:", totalProfitSum]);
        profitRow.font = { bold: true, color: { argb: 'FF00B050' } }; // Green for Profit
    }

    // 7. Borders & Formatting
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // 8. Send File
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Report_${target}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};





// import ExcelJS from "exceljs";
// import Trip from "../models/trip.model.js";
// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

// export const exportTripsToExcel = async (req, res, next) => {
//   try {
//     const { startDate, endDate, target } = req.query; // target can be 'COMPANY' or 'VEHICLE'
//     const { accountType, accountId } = req.user;

//     const query = { accountId, isDeleted: false };
//     if (startDate && endDate) {
//       query.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     const trips = await Trip.find(query)
//       .populate("supplierId", "name")
//       .populate("companyId", "name")
//       .populate("vehicleId", "vehicleNumber")
//       .sort({ tripDate: -1 });

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Statement");

//     // --- Dynamic Column Configuration ---
//     let columns = [
//       { header: "Date", key: "date", width: 12 },
//       { header: "Vehicle No", key: "vehicle", width: 15 },
//       { header: "Loading Point", key: "loading", width: 20 },
//       { header: "Unloading Point", key: "unloading", width: 20 },
//       { header: "Weight (Ton)", key: "load", width: 10 },
//     ];

//     // Decide Rate & Amount based on Target
//     let rateKey = "";
//     let headerName = "";

//     if (target === ACCOUNT_TYPES.COMPANY) {
//       rateKey = "companyRatePerTon";
//       headerName = "Rate/Ton (Company)";
//     } else if (target === ACCOUNT_TYPES.VEHICLE || target === ACCOUNT_TYPES.SUPPLIER) {
//       rateKey = "vehicleRatePerTon";
//       headerName = "Rate/Ton (Vehicle)";
//     } else {
//       return res.status(400).json({ message: "Please specify a valid target (COMPANY or VEHICLE)" });
//     }

//     columns.push(
//       { header: headerName, key: "rate", width: 15 },
//       { header: "Total Amount", key: "total", width: 15 }
//     );

//     worksheet.columns = columns;

//     // Header Styling (Professional Dark Blue)
//     worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

//     let grandTotal = 0;

//     trips.forEach(trip => {
//       const currentRate = trip.rates[rateKey] || 0;
//       const totalAmount = trip.totalTonLoad * currentRate;
//       grandTotal += totalAmount;

//       worksheet.addRow({
//         date: trip.tripDate ? trip.tripDate.toISOString().split('T')[0] : "N/A",
//         vehicle: trip.vehicleId?.vehicleNumber || "N/A",
//         loading: trip.loadingPoint,
//         unloading: trip.unloadingPoint,
//         load: trip.totalTonLoad,
//         rate: currentRate,
//         total: totalAmount
//       });
//     });

//     // Final Total Row
//     const totalRow = worksheet.addRow({
//       loading: "GRAND TOTAL",
//       total: grandTotal
//     });
//     totalRow.font = { bold: true };

//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename=Bill_${target}.xlsx`);

//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (error) {
//     next(error);
//   }
// };









// import ExcelJS from "exceljs";
// import Transport from "../models/trip.model.js";

// // 🔹 Export Trips to Excel
// export const exportExcel = async (req, res) => {
//   try {
//     const { view, fromDate, toDate, companyId, vehicleId, supplierId } = req.query;

//     let filter = { accountId: req.user.accountId };

//     if (fromDate && toDate) filter.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
//     if (companyId) filter.companyId = companyId;
//     if (vehicleId) filter.vehicleId = vehicleId;
//     if (supplierId) filter.supplierId = supplierId;

//     const trips = await Transport.find(filter)
//       .populate("supplierId", "name")
//       .populate("companyId", "name")
//       .populate("vehicleId", "vehicleNumber");

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Trips Report");

//     // Header & Data according to view
//     if (view === "company") {
//       sheet.addRow([
//         "Date",
//         "From",
//         "To",
//         "Company Name",
//         "Supplier Name",
//         "Total Ton Load",
//         "Company Rate Per Ton",
//         "Amount for Company"
//       ]);

//       trips.forEach((t) => {
//         const amount = t.companyRatePerTon * t.totalTonLoad;
//         sheet.addRow([
//           t.date.toISOString().split("T")[0],
//           t.from,
//           t.to,
//           t.companyId.name,
//           t.supplierId.name,
//           t.totalTonLoad,
//           t.companyRatePerTon,
//           amount
//         ]);
//       });
//     } else if (view === "vehicle") {
//       sheet.addRow([
//         "Date",
//         "From",
//         "To",
//         "Vehicle Number",
//         "Supplier Name",
//         "Total Ton Load",
//         "Vehicle Rate Per Ton",
//         "Amount for Vehicle"
//       ]);

//       trips.forEach((t) => {
//         const amount = t.vehicleRatePerTon * t.totalTonLoad;
//         sheet.addRow([
//           t.date.toISOString().split("T")[0],
//           t.from,
//           t.to,
//           t.vehicleId.vehicleNumber,
//           t.supplierId.name,
//           t.totalTonLoad,
//           t.vehicleRatePerTon,
//           amount
//         ]);
//       });
//     } else if (view === "supplier") {
//       sheet.addRow([
//         "Date",
//         "From",
//         "To",
//         "Company Name",
//         "Vehicle Number",
//         "Total Ton Load",
//         "Company Rate",
//         "Vehicle Rate",
//         "Profit",
//         "Amount for Company",
//         "Amount for Vehicle"
//       ]);

//       trips.forEach((t) => {
//         const amountCompany = t.companyRatePerTon * t.totalTonLoad;
//         const amountVehicle = t.vehicleRatePerTon * t.totalTonLoad;
//         const profit = amountCompany - amountVehicle;

//         sheet.addRow([
//           t.date.toISOString().split("T")[0],
//           t.from,
//           t.to,
//           t.companyId.name,
//           t.vehicleId.vehicleNumber,
//           t.totalTonLoad,
//           t.companyRatePerTon,
//           t.vehicleRatePerTon,
//           profit,
//           amountCompany,
//           amountVehicle
//         ]);
//       });
//     } else {
//       return res.status(400).json({ message: "Invalid view type" });
//     }

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", `attachment; filename=trips_${view}.xlsx`);

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Excel export failed", error: err.message });
//   }
// };
