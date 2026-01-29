const Excel = require("exceljs");
const Transport = require("../models/transport.model");

exports.download = async (req, res) => {
  try {
    const type = req.query.type;
    const data = await Transport.find();

    const wb = new Excel.Workbook();
    const sh = wb.addWorksheet("LogiCore");

    // ✅ Excel columns
    sh.columns = [
      { header: "Vehicle", key: "vehicle" },
      { header: "Weight", key: "weight" },
      { header: "Company", key: "company" },
      { header: "Owner", key: "owner" },
      { header: "Profit", key: "profit" },
    ];

    data.forEach((d) => {
      const row = {
        vehicle: d.vehicle?.number,
        weight: d.weight?.loadingWeight,
        company: d.pricing?.companyPricePerTon,
        owner: d.pricing?.ownerPricePerTon,
        profit: d.pricing?.profitPerTon,
      };

      if (type === "company") {
        delete row.owner;
        delete row.profit;
      }

      if (type === "owner") {
        delete row.company;
        delete row.profit;
      }

      sh.addRow(row);
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=logicore.xlsx"
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// const Excel = require("exceljs");
// const Transport = require("../models/transport.model");

// exports.download = async (req, res) => {
//   const type = req.query.type;
//   const data = await Transport.find();

//   const wb = new Excel.Workbook();
//   const sh = wb.addWorksheet("LogiCore");

//   sh.columns = [
//     { header: "Vehicle", key: "vehicle" },
//     { header: "Weight", key: "weight" },
//     { header: "Company", key: "company" },
//     { header: "Owner", key: "owner" },
//     { header: "Profit", key: "profit" }
//   ];

//   data.forEach(d => {
//     const row = {
//       vehicle: d.vehicle.number,
//       weight: d.weight.loadingWeight,
//       company: d.pricing.companyPricePerTon,
//       owner: d.pricing.ownerPricePerTon,
//       profit: d.pricing.profitPerTon
//     };
//     if (type === "company") delete row.owner, delete row.profit;
//     if (type === "owner") delete row.company, delete row.profit;
//     sh.addRow(row);
//   });

//   res.setHeader("Content-Disposition", "attachment; filename=logicore.xlsx");
//   await wb.xlsx.write(res);
//   res.end();
// };
