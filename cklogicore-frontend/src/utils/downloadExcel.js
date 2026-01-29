import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export const downloadExcel = (data, role) => {
  const filtered = data.map(item => {
    if (role === "company") { delete item.ownerPrice; delete item.profit }
    if (role === "owner") { delete item.companyPrice; delete item.profit }
    return item
  })
  const ws = XLSX.utils.json_to_sheet(filtered)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data")
  const excel = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  saveAs(new Blob([excel]), "transport.xlsx")
}



