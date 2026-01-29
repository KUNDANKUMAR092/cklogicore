// src/utils/excel.helper.js
import XLSX from "xlsx";

export const generateExcel = (data, sheetName = "Sheet1") => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};
