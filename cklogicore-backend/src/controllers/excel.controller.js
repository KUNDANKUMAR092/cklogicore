import ExcelJS from "exceljs";
import Trip from "../models/trip.model.js";
import mongoose from "mongoose";

/**
 * Controller: exportTripsToExcel
 * Logic: Dashboard ke filters ke base par Excel file generate karta hai.
 */
export const exportTripsToExcel = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.user;
    const { 
      startDate, endDate, search, status, 
      companyId, vehicleId, supplierId, target 
    } = req.query;

    // 1. DYNAMIC MATCH QUERY (Dashboard filters sync)
    let matchQuery = { 
      accountId: new mongoose.Types.ObjectId(accountId), 
      isDeleted: false 
    };

    if (status) matchQuery.status = status;
    if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
    if (vehicleId) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
    if (supplierId) matchQuery.supplierId = new mongoose.Types.ObjectId(supplierId);

    if (startDate && endDate) {
      matchQuery.tripDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    // 2. FETCH TRIPS (With Populate for Display Names)
    const trips = await Trip.find(matchQuery)
      .populate("companyId vehicleId supplierId")
      .sort({ tripDate: -1 });

    // 3. EXCEL CONFIGURATION
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Trip Report");

    // Logic for Dynamic Columns based on Target (COMPANY/VEHICLE/SUPPLIER)
    let rateKey = "vehicleRatePerTon";
    let totalKey = "totalAmountForVehicle";
    let entityLabel = "Vehicle";

    if (target === "COMPANY") {
      rateKey = "companyRatePerTon";
      totalKey = "totalAmountForCompany";
      entityLabel = "Company";
    } else if (target === "SUPPLIER") {
      rateKey = "supplierRatePerTon";
      totalKey = "totalAmountForSupplier";
      entityLabel = "Supplier";
    }

    // 4. DEFINE COLUMNS
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Trip ID", key: "tripId", width: 20 },
      { header: "Vehicle No", key: "vehicle", width: 18 },
      { header: "Company", key: "company", width: 25 },
      { header: "Route", key: "route", width: 35 },
      { header: "Weight (MT)", key: "load", width: 12 },
      { header: `${entityLabel} Rate`, key: "rate", width: 15 },
      { header: "Total Amount", key: "total", width: 18 },
      { header: "Status", key: "status", width: 15 }
    ];

    // Admin/Owner ke liye Profit column
    if (accountType === "ADMIN" || accountType === "OWNER") {
      worksheet.addColumn({ header: "Net Profit", key: "profit", width: 15 });
    }

    // 5. STYLING (Header)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2C3E50" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // 6. ADD DATA ROWS & SUMMARY TOTALS
    let grandTotals = { weight: 0, amount: 0, profit: 0 };

    trips.forEach((t) => {
      const amount = t.totalFinancials[totalKey] || 0;
      const profit = t.totalFinancials.profitPerTrip || 0;

      grandTotals.weight += t.totalTonLoad;
      grandTotals.amount += amount;
      grandTotals.profit += profit;

      worksheet.addRow({
        date: t.tripDate ? t.tripDate.toISOString().split("T")[0] : "-",
        tripId: t.tripId,
        vehicle: t.vehicleId?.vehicleNumber || "N/A",
        company: t.companyId?.name || "N/A",
        route: `${t.loadingPoint} ➔ ${t.unloadingPoint}`,
        load: t.totalTonLoad,
        rate: t.rates[rateKey] || 0,
        total: amount,
        status: t.status.toUpperCase(),
        profit: profit
      });
    });

    // 7. SUMMARY FOOTER (Grand Total Row)
    worksheet.addRow([]); // Blank Row
    const totalRow = worksheet.addRow({
      route: "GRAND TOTAL",
      load: grandTotals.weight,
      total: grandTotals.amount,
      profit: grandTotals.profit
    });
    totalRow.font = { bold: true };

    // 8. BORDERS & NUMBER FORMATTING
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" }, left: { style: "thin" },
          bottom: { style: "thin" }, right: { style: "thin" }
        };
      });
    });

    // 9. SEND RESPONSE
    const fileName = `Report_${target || "General"}_${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Excel Export Error:", error);
    res.status(500).json({ success: false, message: "Export failed", error: error.message });
  }
};