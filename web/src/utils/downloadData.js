import * as XLSX from "xlsx";

export const exportToCSV = (
  exportData,
  headers,
  fileName,
  sheetName,
  pageNo,
  rowsPerPageRecord
) => {
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
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

export const downloadTemplate = () => {
  const headers = {
    protocol: "Protocol",
    vName: "Variable Label",
    cName: "Column Name/Designator",
    format: "Format",
    dType: "Data Type",
    primay: "Primary(Y/N)",
    unique: "Unique(Y/N)",
    required: "Required(Y/N)",
    minLen: "Min length",
    maxLen: "Max length",
    lov: "List of values",
  };

  const exportData = [];
  const fileName = "dataset_columns_import_template.csv";
  const sheetName = "sheet 1";
  const pageNo = 1;
  const rowsPerPageRecord = 5;
  exportToCSV(
    exportData,
    headers,
    fileName,
    sheetName,
    pageNo,
    rowsPerPageRecord
  );
};
