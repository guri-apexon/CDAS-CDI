import * as XLSX from "xlsx";

export const exportToCSV = (
  exportData,
  headers,
  fileName,
  sheetName,
  pageNo,
  rowsPerPageRecord
) => {
  // console.log("data for export", exportData, headers, fileName, sheetName, pageNo, rowsPerPageRecord);
  const wb = XLSX.utils.book_new();
  let ws = XLSX.worksheet;
  const rowPerPage =
    rowsPerPageRecord === "All" ? exportData.length : rowsPerPageRecord;
  const from = pageNo * rowPerPage;
  const to = from + rowPerPage;
  const newData = exportData.slice(from, to);
  newData.unshift(headers);
  ws = XLSX.utils.json_to_sheet(newData, { skipHeader: true });
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
};

export default function exportToCSVWithoutFilter(
  exportData,
  fileName,
  sheetName
) {
  // console.log("data for export", exportData, sheetName, fileName);
  const wb = XLSX.utils.book_new();
  let ws = XLSX.worksheet;
  ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
