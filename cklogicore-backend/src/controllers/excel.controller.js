import ExcelJS from "exceljs";
import Trip from "../models/trip.model.js";
import mongoose from "mongoose";

export const exportTripsToExcel = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.user;
    const { startDate, endDate, search, status, companyId, vehicleId, supplierId, target } = req.query;

    let matchQuery = { accountId: new mongoose.Types.ObjectId(accountId), isDeleted: false };
    if (status) matchQuery.status = status;
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
    if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
    if (supplierId && mongoose.Types.ObjectId.isValid(supplierId)) matchQuery.supplierId = new mongoose.Types.ObjectId(supplierId);

    if (startDate && endDate) {
      matchQuery.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const trips = await Trip.find(matchQuery).populate("companyId vehicleId supplierId").sort({ tripDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Trip Report");

    // --- 1. COLUMNS CONFIGURATION ---
    if (target === "SUPPLIER") {
      worksheet.columns = [
        { header: "Date", key: "date", width: 12 },
        { header: "Vehicle No", key: "vehicle", width: 15 },
        { header: "Company", key: "company", width: 20 },
        { header: "Route", key: "route", width: 30 },
        { header: "Weight", key: "load", width: 10 },
        { header: "Co. Rate", key: "coRate", width: 12 },
        { header: "Co. Gross", key: "coGross", width: 15 },
        { header: "Co. Diesel", key: "coDiesel", width: 15 },
        { header: "Co. Other Exp", key: "coOtherExp", width: 15 },
        { header: "Co. Pending", key: "coPending", width: 15 },
        { header: "Veh. Rate", key: "vehRate", width: 12 },
        { header: "Veh. Gross", key: "vehGross", width: 15 },
        { header: "Spl. Diesel", key: "splDiesel", width: 15 },
        { header: "Spl. Other Exp", key: "splOtherExp", width: 15 },
        { header: "Veh. Pending", key: "vehPending", width: 15 },
        { header: "My Profit", key: "profit", width: 15 }
      ];
    } else if (target === "VEHICLE") {
      // ✅ Special View for Vehicle: Added Company Diesel & Company Other Exp
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Trip ID", key: "tripId", width: 20 },
        { header: "Vehicle No", key: "vehicle", width: 18 },
        { header: "Company", key: "company", width: 25 },
        { header: "Route", key: "route", width: 35 },
        { header: "Weight (MT)", key: "load", width: 12 },
        { header: `Veh. Rate`, key: "rate", width: 15 },
        { header: "Gross Amount", key: "gross", width: 18 },
        { header: "Co. Diesel", key: "coDiesel", width: 15 },    // New
        { header: "Co. Other Exp", key: "coOtherExp", width: 15 }, // New
        { header: "Spl. Diesel", key: "splDiesel", width: 15 },
        { header: "Spl. Other Exp", key: "otherExp", width: 18 },
        { header: "Pending Bal", key: "pending", width: 18 }
      ];
    } else {
      // Standard View for COMPANY
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Trip ID", key: "tripId", width: 20 },
        { header: "Vehicle No", key: "vehicle", width: 18 },
        { header: "Company", key: "company", width: 25 },
        { header: "Route", key: "route", width: 35 },
        { header: "Weight (MT)", key: "load", width: 12 },
        { header: `Co. Rate`, key: "rate", width: 15 },
        { header: "Gross Amount", key: "gross", width: 18 },
        { header: "Diesel", key: "diesel", width: 15 },
        { header: "Other Exp", key: "otherExp", width: 18 },
        { header: "Pending Bal", key: "pending", width: 18 }
      ];
    }

    if ((accountType === "ADMIN" || accountType === "OWNER") && target !== "SUPPLIER") {
      worksheet.addColumn({ header: "Net Profit", key: "profit", width: 15 });
    }

    // Header Styling
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2C3E50" } };
      cell.alignment = { horizontal: "center" };
    });

    // --- 2. DATA ROWS & TOTALS ---
    let totals = { weight: 0, coGross: 0, coDiesel: 0, coOtherExp: 0, coPending: 0, vehGross: 0, splDiesel: 0, splOtherExp: 0, vehPending: 0, profit: 0, gross: 0, diesel: 0, otherExp: 0, pending: 0 };

    trips.forEach((t) => {
      const c = t.calculated || {};
      const f = t.financials || {};
      totals.weight += (t.totalTonLoad || 0);
      totals.profit += (c.tripProfit || 0);

      const coOtherExp = (c.companyTotalExpense || 0) - (f.companyDiesel || 0);
      const splOtherExp = (c.supplierTotalExpense || 0) - (f.supplierDiesel || 0);

      if (target === "SUPPLIER") {
        totals.coGross += (c.companyGrossAmount || 0);
        totals.coDiesel += (f.companyDiesel || 0);
        totals.coOtherExp += coOtherExp;
        totals.coPending += (c.companyPendingAmount || 0);
        totals.vehGross += (c.vehicleGrossAmount || 0);
        totals.splDiesel += (f.supplierDiesel || 0);
        totals.splOtherExp += splOtherExp;
        totals.vehPending += (c.vehiclePendingAmount || 0);

        worksheet.addRow({
          date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
          vehicle: t.vehicleId?.vehicleNumber || "N/A",
          company: t.companyId?.name || "N/A",
          route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
          load: t.totalTonLoad,
          coRate: t.rates?.companyRatePerTon || 0,
          coGross: c.companyGrossAmount || 0,
          coDiesel: f.companyDiesel || 0,
          coOtherExp: coOtherExp,
          coPending: c.companyPendingAmount || 0,
          vehRate: t.rates?.vehicleRatePerTon || 0,
          vehGross: c.vehicleGrossAmount || 0,
          splDiesel: f.supplierDiesel || 0,
          splOtherExp: splOtherExp,
          vehPending: c.vehiclePendingAmount || 0,
          profit: c.tripProfit || 0
        });
      } else if (target === "VEHICLE") {
        // ✅ Vehicle Row: Individual Company & Supplier details
        totals.gross += (c.vehicleGrossAmount || 0);
        totals.coDiesel += (f.companyDiesel || 0);
        totals.coOtherExp += coOtherExp;
        totals.splDiesel += (f.supplierDiesel || 0);
        totals.otherExp += splOtherExp;
        totals.pending += (c.vehiclePendingAmount || 0);

        worksheet.addRow({
          date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
          tripId: t.tripId,
          vehicle: t.vehicleId?.vehicleNumber || "N/A",
          company: t.companyId?.name || "N/A",
          route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
          load: t.totalTonLoad,
          rate: t.rates?.vehicleRatePerTon || 0,
          gross: c.vehicleGrossAmount || 0,
          coDiesel: f.companyDiesel || 0,
          coOtherExp: coOtherExp,
          splDiesel: f.supplierDiesel || 0,
          otherExp: splOtherExp,
          pending: c.vehiclePendingAmount || 0,
          profit: c.tripProfit || 0
        });
      } else {
        // Company Row
        const isCo = target === "COMPANY";
        const rowGross = c.companyGrossAmount || 0;
        const rowDiesel = f.companyDiesel || 0;
        const rowOtherExp = (c.companyTotalExpense || 0) - rowDiesel;
        const rowPend = c.companyPendingAmount || 0;

        totals.gross += rowGross;
        totals.diesel += rowDiesel;
        totals.otherExp += rowOtherExp;
        totals.pending += rowPend;

        worksheet.addRow({
          date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
          tripId: t.tripId,
          vehicle: t.vehicleId?.vehicleNumber || "N/A",
          company: t.companyId?.name || "N/A",
          route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
          load: t.totalTonLoad,
          rate: t.rates?.companyRatePerTon || 0,
          gross: rowGross,
          diesel: rowDiesel,
          otherExp: rowOtherExp,
          pending: rowPend,
          profit: c.tripProfit || 0
        });
      }
    });

    // --- 3. FOOTER & COLORING ---
    worksheet.addRow([]);
    const totalRow = worksheet.addRow({});
    totalRow.getCell(1).value = "GRAND TOTAL";
    totalRow.font = { bold: true };

    let footerValues = {};
    if (target === "SUPPLIER") {
      footerValues = { load: totals.weight, coGross: totals.coGross, coDiesel: totals.coDiesel, coOtherExp: totals.coOtherExp, coPending: totals.coPending, vehGross: totals.vehGross, splDiesel: totals.splDiesel, splOtherExp: totals.splOtherExp, vehPending: totals.vehPending, profit: totals.profit };
    } else if (target === "VEHICLE") {
      footerValues = { load: totals.weight, gross: totals.gross, coDiesel: totals.coDiesel, coOtherExp: totals.coOtherExp, splDiesel: totals.splDiesel, otherExp: totals.otherExp, pending: totals.pending, profit: totals.profit };
    } else {
      footerValues = { load: totals.weight, gross: totals.gross, diesel: totals.diesel, otherExp: totals.otherExp, pending: totals.pending, profit: totals.profit };
    }

    worksheet.columns.forEach((col, index) => {
      const cell = totalRow.getCell(index + 1);
      if (footerValues[col.key] !== undefined) {
        cell.value = footerValues[col.key];
        const colors = { load:'FFEBEE', gross:'E8F5E9', coGross:'E8F5E9', vehGross:'E8F5E9', diesel:'FFF3E0', coDiesel:'FFF3E0', splDiesel:'FFF3E0', otherExp:'FFF3E0', coOtherExp:'FFF3E0', splOtherExp:'FFF3E0', pending:'E3F2FD', vehPending:'E3F2FD', coPending:'E3F2FD', profit:'F3E5F5' };
        if (colors[col.key]) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors[col.key] } };
      }
    });

    worksheet.eachRow(r => r.eachCell(c => c.border = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} }));

    const fileName = `Report_${target}_${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("EXCEL EXPORT ERROR:", error);
    res.status(500).json({ success: false, message: "Export failed" });
  }
};












// import ExcelJS from "exceljs";
// import Trip from "../models/trip.model.js";
// import mongoose from "mongoose";

// export const exportTripsToExcel = async (req, res, next) => {
//   try {
//     const { accountId, accountType } = req.user;
//     const { 
//       startDate, endDate, search, status, 
//       companyId, vehicleId, supplierId, target 
//     } = req.query;

//     // 1. DYNAMIC MATCH QUERY
//     let matchQuery = { 
//       accountId: new mongoose.Types.ObjectId(accountId), 
//       isDeleted: false 
//     };

//     if (status) matchQuery.status = status;
//     if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
//     if (vehicleId) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
//     if (supplierId) matchQuery.supplierId = new mongoose.Types.ObjectId(supplierId);

//     if (startDate && endDate) {
//       matchQuery.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     if (search) {
//       matchQuery.$or = [
//         { tripId: { $regex: search, $options: "i" } },
//         { loadingPoint: { $regex: search, $options: "i" } },
//         { unloadingPoint: { $regex: search, $options: "i" } }
//       ];
//     }

//     const trips = await Trip.find(matchQuery)
//       .populate("companyId vehicleId supplierId")
//       .sort({ tripDate: -1 });

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Trip Report");

//     // --- 2. DYNAMIC COLUMNS CONFIGURATION ---
//     if (target === "SUPPLIER") {
//       worksheet.columns = [
//         { header: "Date", key: "date", width: 12 },
//         { header: "Vehicle No", key: "vehicle", width: 15 },
//         { header: "Company", key: "company", width: 20 },
//         { header: "Route", key: "route", width: 30 },
//         { header: "Weight", key: "load", width: 10 },
//         { header: "Co. Rate", key: "coRate", width: 12 },      // Added back
//         { header: "Co. Gross", key: "coGross", width: 15 },
//         { header: "Co. Expense", key: "coExp", width: 15 },
//         { header: "Co. Pending", key: "coPending", width: 15 },
//         { header: "Veh. Rate", key: "vehRate", width: 12 },      // Added back
//         { header: "Veh. Gross", key: "vehGross", width: 15 },
//         { header: "Spl. Expense", key: "splExp", width: 15 },
//         { header: "Veh. Pending", key: "vehPending", width: 15 },
//         { header: "My Profit", key: "profit", width: 15 }
//       ];
//     } else {
//       const isCo = target === "COMPANY";
//       const keys = {
//         rate: isCo ? "companyRatePerTon" : "vehicleRatePerTon",
//         gross: isCo ? "companyGrossAmount" : "vehicleGrossAmount",
//         expense: isCo ? "companyTotalExpense" : "vehicleTotalExpense",
//         pending: isCo ? "companyPendingAmount" : "vehiclePendingAmount",
//         label: isCo ? "Company" : "Vehicle"
//       };

//       worksheet.columns = [
//         { header: "Date", key: "date", width: 15 },
//         { header: "Trip ID", key: "tripId", width: 20 },
//         { header: "Vehicle No", key: "vehicle", width: 18 },
//         { header: "Company", key: "company", width: 25 },
//         { header: "Route", key: "route", width: 35 },
//         { header: "Weight (MT)", key: "load", width: 12 },
//         { header: `${keys.label} Rate`, key: "rate", width: 15 },
//         { header: "Gross Amount", key: "gross", width: 18 },
//         { header: "Expenses/Adv", key: "expense", width: 18 },
//         { header: "Pending Bal", key: "pending", width: 18 }
//       ];

//       if (accountType === "ADMIN" || accountType === "OWNER") {
//         worksheet.addColumn({ header: "Net Profit", key: "profit", width: 15 });
//       }
//     }

//     // Header Styling
//     const headerRow = worksheet.getRow(1);
//     headerRow.eachCell((cell) => {
//       cell.font = { bold: true, color: { argb: "FFFFFF" } };
//       cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2C3E50" } };
//       cell.alignment = { horizontal: "center", vertical: "middle" };
//     });

//     // --- 3. DATA ROWS LOGIC ---
//     let totals = { weight: 0, coGross: 0, coExp: 0, coPending: 0, vehGross: 0, splExp: 0, vehPending: 0, profit: 0, gross: 0, expense: 0, pending: 0 };

//     trips.forEach((t) => {
//       const c = t.calculated || {};
//       totals.weight += (t.totalTonLoad || 0);
//       totals.profit += (c.tripProfit || 0);

//       if (target === "SUPPLIER") {
//         totals.coGross += (c.companyGrossAmount || 0);
//         totals.coExp += (c.companyTotalExpense || 0);
//         totals.coPending += (c.companyPendingAmount || 0);
//         totals.vehGross += (c.vehicleGrossAmount || 0);
//         totals.splExp += (c.supplierTotalExpense || 0);
//         totals.vehPending += (c.vehiclePendingAmount || 0);

//         worksheet.addRow({
//           date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
//           vehicle: t.vehicleId?.vehicleNumber || "N/A",
//           company: t.companyId?.name || "N/A",
//           route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
//           load: t.totalTonLoad,
//           coRate: t.rates?.companyRatePerTon || 0,
//           coGross: c.companyGrossAmount || 0,
//           coExp: c.companyTotalExpense || 0,
//           coPending: c.companyPendingAmount || 0,
//           vehRate: t.rates?.vehicleRatePerTon || 0,
//           vehGross: c.vehicleGrossAmount || 0,
//           splExp: c.supplierTotalExpense || 0,
//           vehPending: c.vehiclePendingAmount || 0,
//           profit: c.tripProfit || 0
//         });
//       } else {
//         const isCo = target === "COMPANY";
//         const rowGross = isCo ? c.companyGrossAmount : c.vehicleGrossAmount;
//         const rowExp = isCo ? c.companyTotalExpense : c.vehicleTotalExpense;
//         const rowPend = isCo ? c.companyPendingAmount : c.vehiclePendingAmount;
//         const rowRate = isCo ? t.rates?.companyRatePerTon : t.rates?.vehicleRatePerTon;

//         totals.gross += (rowGross || 0);
//         totals.expense += (rowExp || 0);
//         totals.pending += (rowPend || 0);

//         worksheet.addRow({
//           date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
//           tripId: t.tripId,
//           vehicle: t.vehicleId?.vehicleNumber || "N/A",
//           company: t.companyId?.name || "N/A",
//           route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
//           load: t.totalTonLoad,
//           rate: rowRate || 0,
//           gross: rowGross || 0,
//           expense: rowExp || 0,
//           pending: rowPend || 0,
//           profit: c.tripProfit || 0
//         });
//       }
//     });

//     // --- 4. SUMMARY FOOTER ---
//     worksheet.addRow([]);
//     const totalRow = worksheet.addRow(target === "SUPPLIER" ? {
//       route: "GRAND TOTAL",
//       load: totals.weight,
//       coGross: totals.coGross,
//       coExp: totals.coExp,
//       coPending: totals.coPending,
//       vehGross: totals.vehGross,
//       splExp: totals.splExp,
//       vehPending: totals.vehPending,
//       profit: totals.profit
//     } : {
//       route: "GRAND TOTAL",
//       load: totals.weight,
//       gross: totals.gross,
//       expense: totals.expense,
//       pending: totals.pending,
//       profit: totals.profit
//     });
//     totalRow.font = { bold: true };

//     worksheet.eachRow(r => r.eachCell(c => c.border = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} }));

//     const fileName = `Report_${target || "General"}_${Date.now()}.xlsx`;
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (error) {
//     console.error("Excel Error:", error);
//     res.status(500).json({ success: false, message: "Export failed" });
//   }
// };
// //   try {
// //     const { accountId, accountType } = req.user;
// //     const { 
// //       startDate, endDate, search, status, 
// //       companyId, vehicleId, supplierId, target 
// //     } = req.query;

// //     // 1. DYNAMIC MATCH QUERY
// //     let matchQuery = { 
// //       accountId: new mongoose.Types.ObjectId(accountId), 
// //       isDeleted: false 
// //     };

// //     if (status) matchQuery.status = status;
// //     if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
// //     if (vehicleId) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
// //     if (supplierId) matchQuery.supplierId = new mongoose.Types.ObjectId(supplierId);

// //     if (startDate && endDate) {
// //       matchQuery.tripDate = { 
// //         $gte: new Date(startDate), 
// //         $lte: new Date(endDate) 
// //       };
// //     }

// //     // 2. FETCH TRIPS (Populated for Display Names)
// //     const trips = await Trip.find(matchQuery)
// //       .populate("companyId vehicleId supplierId")
// //       .sort({ tripDate: -1 });

// //     // 3. EXCEL CONFIGURATION
// //     const workbook = new ExcelJS.Workbook();
// //     const worksheet = workbook.addWorksheet("Trip Report");

// //     /**
// //      * DYNAMIC KEYS MAPPING (Based on your new 'calculated' structure)
// //      */
// //     let keys = {
// //       rate: "vehicleRatePerTon",
// //       gross: "vehicleGrossAmount",
// //       expense: "vehicleTotalExpense",
// //       pending: "vehiclePendingAmount",
// //       label: "Vehicle"
// //     };

// //     if (target === "COMPANY") {
// //       keys = {
// //         rate: "companyRatePerTon",
// //         gross: "companyGrossAmount",
// //         expense: "companyTotalExpense",
// //         pending: "companyPendingAmount",
// //         label: "Company"
// //       };
// //     } else if (target === "SUPPLIER") {
// //       keys = {
// //         rate: "supplierRatePerTon",
// //         gross: "supplierGrossAmount",
// //         expense: "supplierTotalExpense",
// //         pending: "supplierPendingAmount",
// //         label: "Supplier"
// //       };
// //     }

// //     // 4. DEFINE COLUMNS
// //     worksheet.columns = [
// //       { header: "Date", key: "date", width: 15 },
// //       { header: "Trip ID", key: "tripId", width: 20 },
// //       { header: "Vehicle No", key: "vehicle", width: 18 },
// //       { header: "Company", key: "company", width: 25 },
// //       { header: "Route", key: "route", width: 35 },
// //       { header: "Weight (MT)", key: "load", width: 12 },
// //       { header: `${keys.label} Rate`, key: "rate", width: 15 },
// //       { header: "Gross Amount", key: "gross", width: 18 },
// //       { header: "Expenses/Adv", key: "expense", width: 18 },
// //       { header: "Pending Bal", key: "pending", width: 18 },
// //       { header: "Status", key: "status", width: 15 }
// //     ];

// //     // Admin/Owner ke liye Net Profit column
// //     if (accountType === "ADMIN" || accountType === "OWNER") {
// //       worksheet.addColumn({ header: "Net Profit", key: "profit", width: 15 });
// //     }

// //     // 5. HEADER STYLING
// //     const headerRow = worksheet.getRow(1);
// //     headerRow.eachCell((cell) => {
// //       cell.font = { bold: true, color: { argb: "FFFFFF" } };
// //       cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2C3E50" } };
// //       cell.alignment = { horizontal: "center", vertical: "middle" };
// //     });

// //     // 6. ADD DATA ROWS
// //     let grandTotals = { weight: 0, gross: 0, expense: 0, pending: 0, profit: 0 };

// //     trips.forEach((t) => {
// //       const c = t.calculated || {};
      
// //       grandTotals.weight += (t.totalTonLoad || 0);
// //       grandTotals.gross += (c[keys.gross] || 0);
// //       grandTotals.expense += (c[keys.expense] || 0);
// //       grandTotals.pending += (c[keys.pending] || 0);
// //       grandTotals.profit += (c.tripProfit || 0);

// //       worksheet.addRow({
// //         date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
// //         tripId: t.tripId,
// //         vehicle: t.vehicleId?.vehicleNumber || "N/A",
// //         company: t.companyId?.name || "N/A",
// //         route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
// //         load: t.totalTonLoad,
// //         rate: t.rates[keys.rate] || 0,
// //         gross: c[keys.gross] || 0,
// //         expense: c[keys.expense] || 0,
// //         pending: c[keys.pending] || 0,
// //         status: t.status.toUpperCase(),
// //         profit: c.tripProfit || 0
// //       });
// //     });

// //     // 7. SUMMARY FOOTER
// //     worksheet.addRow([]); // Blank Row
// //     const totalRow = worksheet.addRow({
// //       route: "GRAND TOTAL",
// //       load: grandTotals.weight,
// //       gross: grandTotals.gross,
// //       expense: grandTotals.expense,
// //       pending: grandTotals.pending,
// //       profit: grandTotals.profit
// //     });
// //     totalRow.font = { bold: true };
// //     totalRow.getCell('gross').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECF0F1' } };

// //     // 8. BORDERS & FORMATTING
// //     worksheet.eachRow((row) => {
// //       row.eachCell((cell) => {
// //         cell.border = {
// //           top: { style: "thin" }, left: { style: "thin" },
// //           bottom: { style: "thin" }, right: { style: "thin" }
// //         };
// //       });
// //     });

// //     // 9. SEND RESPONSE
// //     const fileName = `Report_${target || "General"}_${Date.now()}.xlsx`;
// //     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
// //     res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

// //     await workbook.xlsx.write(res);
// //     res.end();

// //   } catch (error) {
// //     console.error("Excel Export Error:", error);
// //     res.status(500).json({ success: false, message: "Export failed", error: error.message });
// //   }
// // };










// // import ExcelJS from "exceljs";
// // import Trip from "../models/trip.model.js";
// // import mongoose from "mongoose";

// // /**
// //  * Controller: exportTripsToExcel
// //  * Logic: Dashboard ke filters ke base par Excel file generate karta hai.
// //  */
// // export const exportTripsToExcel = async (req, res, next) => {
// //   try {
// //     const { accountId, accountType } = req.user;
// //     const { 
// //       startDate, endDate, search, status, 
// //       companyId, vehicleId, supplierId, target 
// //     } = req.query;

// //     // 1. DYNAMIC MATCH QUERY (Dashboard filters sync)
// //     let matchQuery = { 
// //       accountId: new mongoose.Types.ObjectId(accountId), 
// //       isDeleted: false 
// //     };

// //     if (status) matchQuery.status = status;
// //     if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
// //     if (vehicleId) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
// //     if (supplierId) matchQuery.supplierId = new mongoose.Types.ObjectId(supplierId);

// //     if (startDate && endDate) {
// //       matchQuery.tripDate = { 
// //         $gte: new Date(startDate), 
// //         $lte: new Date(endDate) 
// //       };
// //     }

// //     // 2. FETCH TRIPS (With Populate for Display Names)
// //     const trips = await Trip.find(matchQuery)
// //       .populate("companyId vehicleId supplierId")
// //       .sort({ tripDate: -1 });

// //     // 3. EXCEL CONFIGURATION
// //     const workbook = new ExcelJS.Workbook();
// //     const worksheet = workbook.addWorksheet("Trip Report");

// //     // Logic for Dynamic Columns based on Target (COMPANY/VEHICLE/SUPPLIER)
// //     let rateKey = "vehicleRatePerTon";
// //     let totalKey = "totalAmountForVehicle";
// //     let entityLabel = "Vehicle";

// //     if (target === "COMPANY") {
// //       rateKey = "companyRatePerTon";
// //       totalKey = "totalAmountForCompany";
// //       entityLabel = "Company";
// //     } else if (target === "SUPPLIER") {
// //       rateKey = "supplierRatePerTon";
// //       totalKey = "totalAmountForSupplier";
// //       entityLabel = "Supplier";
// //     }

// //     // 4. DEFINE COLUMNS
// //     worksheet.columns = [
// //       { header: "Date", key: "date", width: 15 },
// //       { header: "Trip ID", key: "tripId", width: 20 },
// //       { header: "Vehicle No", key: "vehicle", width: 18 },
// //       { header: "Company", key: "company", width: 25 },
// //       { header: "Route", key: "route", width: 35 },
// //       { header: "Weight (MT)", key: "load", width: 12 },
// //       { header: `${entityLabel} Rate`, key: "rate", width: 15 },
// //       { header: "Total Amount", key: "total", width: 18 },
// //       { header: "Status", key: "status", width: 15 }
// //     ];

// //     // Admin/Owner ke liye Profit column
// //     if (accountType === "ADMIN" || accountType === "OWNER") {
// //       worksheet.addColumn({ header: "Net Profit", key: "profit", width: 15 });
// //     }

// //     // 5. STYLING (Header)
// //     const headerRow = worksheet.getRow(1);
// //     headerRow.eachCell((cell) => {
// //       cell.font = { bold: true, color: { argb: "FFFFFF" } };
// //       cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2C3E50" } };
// //       cell.alignment = { horizontal: "center", vertical: "middle" };
// //     });

// //     // 6. ADD DATA ROWS & SUMMARY TOTALS
// //     let grandTotals = { weight: 0, amount: 0, profit: 0 };

// //     trips.forEach((t) => {
// //       const amount = t.totalFinancials[totalKey] || 0;
// //       const profit = t.totalFinancials.profitPerTrip || 0;

// //       grandTotals.weight += t.totalTonLoad;
// //       grandTotals.amount += amount;
// //       grandTotals.profit += profit;

// //       worksheet.addRow({
// //         date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
// //         tripId: t.tripId,
// //         vehicle: t.vehicleId?.vehicleNumber || "N/A",
// //         company: t.companyId?.name || "N/A",
// //         route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
// //         load: t.totalTonLoad,
// //         rate: t.rates[rateKey] || 0,
// //         total: amount,
// //         status: t.status.toUpperCase(),
// //         profit: profit
// //       });
// //     });

// //     // 7. SUMMARY FOOTER (Grand Total Row)
// //     worksheet.addRow([]); // Blank Row
// //     const totalRow = worksheet.addRow({
// //       route: "GRAND TOTAL",
// //       load: grandTotals.weight,
// //       total: grandTotals.amount,
// //       profit: grandTotals.profit
// //     });
// //     totalRow.font = { bold: true };

// //     // 8. BORDERS & NUMBER FORMATTING
// //     worksheet.eachRow((row) => {
// //       row.eachCell((cell) => {
// //         cell.border = {
// //           top: { style: "thin" }, left: { style: "thin" },
// //           bottom: { style: "thin" }, right: { style: "thin" }
// //         };
// //       });
// //     });

// //     // 9. SEND RESPONSE
// //     const fileName = `Report_${target || "General"}_${Date.now()}.xlsx`;
// //     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
// //     res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

// //     await workbook.xlsx.write(res);
// //     res.end();

// //   } catch (error) {
// //     console.error("Excel Export Error:", error);
// //     res.status(500).json({ success: false, message: "Export failed", error: error.message });
// //   }
// // };