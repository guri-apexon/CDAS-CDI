import { pick } from "lodash";
import * as XLSX from "xlsx";
import { convertLocalFormat } from ".";

export const exportToCSV = (
  exportData,
  headers,
  fileName,
  sheetName,
  pageNo,
  rowsPerPageRecord
) => {
  const wb = XLSX.utils.book_new();
  const rowPerPage =
    rowsPerPageRecord === "All" ? exportData.length : rowsPerPageRecord;
  const from = pageNo * rowPerPage;
  const to = from + rowPerPage;
  const newData = exportData.slice(from, to);
  // const newData = newData.map((x) => ({
  //   ...x,
  //   update_dt: convertLocalFormat(x.update_dt),
  // }));
  newData.unshift(headers);

  const ws = XLSX.utils.json_to_sheet(newData, { skipHeader: true });
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
// *****************************
// Download Table Rows Feature Start
// *****************************
const applyFilter = (cols, rows, filts, sortedColumn, sortedValue) => {
  let filteredRows = rows;
  Object.values(cols).forEach((column) => {
    if (column.filterFunction) {
      filteredRows = filteredRows.filter((row) => {
        return column.filterFunction(row, filts);
      });
      if (column.sortFunction) {
        filteredRows.sort(column.sortFunction(sortedColumn, sortedValue));
      }
    }
  });
  return filteredRows;
};
const exportDataRows = (
  rows,
  columns,
  setExportRows,
  inlineFilters,
  sortedColumn,
  sortedValue
) => {
  const toBeExportRows = [...rows];
  const sortedFilteredData = applyFilter(
    columns,
    toBeExportRows,
    inlineFilters,
    sortedColumn,
    sortedValue
  );
  if (setExportRows) setExportRows(sortedFilteredData);
  return sortedFilteredData;
};

export const downloadRows = (props) => {
  const {
    name,
    ext,
    columns,
    pageNo,
    rowsPerPage,
    event,
    toast,
    rows,
    setExportRows,
    inlineFilters,
    sortedColumn,
    sortedValue,
    showHidden,
  } = props;
  // console.log("inDown", exportHeader);
  const exportRows = exportDataRows(
    rows,
    columns,
    setExportRows,
    inlineFilters,
    sortedColumn,
    sortedValue
  );
  const tempObj = {};
  // console.log("exportRows", exportRows);
  (showHidden
    ? columns
    : columns.filter((d) => d.hidden !== true && d.ignore !== true)
  ).forEach((d) => {
    tempObj[d.accessor] = d.header;
  });
  const newData = exportRows.map((obj) => {
    const newObj = pick(obj, Object.keys(tempObj));
    return newObj;
  });
  exportToCSV(newData, tempObj, `${name}.${ext}`, "data", pageNo, rowsPerPage);
  if (exportRows.length <= 0) {
    if (event) event.preventDefault();
    const message = `There is no data on the screen to download because of which an empty file has been downloaded.`;
    if (toast) toast.showErrorMessage(message);
  } else {
    const message = `File downloaded successfully.`;
    if (toast) toast.showSuccessMessage(message);
  }
};
// *****************************
// Download Table Rows Feature End
// *****************************
