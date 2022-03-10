import moment from "moment";
import React from "react";
import {
  compareDates,
  compareNumbers,
  compareStrings,
  createStringSearchFilter,
  dateFilterV2,
} from "apollo-react/components/Table";
import { TextFieldFilter, DateFilter } from "../../utils/index";

const DateCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const date =
    rowValue && moment(rowValue, "MM/DD/YYYY").isValid()
      ? moment(rowValue).format("DD-MMM-YYYY HH:mm A")
      : moment().format("DD-MMM-YYYY HH:mm A");

  return <span>{date}</span>;
};

const columns = [
  {
    header: "Data Package Name",
    accessor: "name",
    sortFunction: compareNumbers,
    filterFunction: createStringSearchFilter("name"),
    filterComponent: TextFieldFilter,
    frozen: true,
  },
  {
    header: "Dataset Name (Mnemonic)",
    accessor: "dataset_name",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("dataset_name"),
    filterComponent: TextFieldFilter,
    frozen: true,
  },
  {
    header: "Audit Version",
    accessor: "log_version",
    sortFunction: compareStrings,
    // customCell: VersionCell,
    filterFunction: createStringSearchFilter("log_version"),
    filterComponent: TextFieldFilter,
    width: 70,
    align: "right",
  },
  {
    header: "Column Name",
    accessor: "column_name",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("column_name"),
    filterComponent: TextFieldFilter,
    width: 120,
  },
  {
    header: "Update Date",
    accessor: "update_dt",
    sortFunction: compareDates,
    customCell: DateCell,
    filterFunction: dateFilterV2("update_dt"),
    filterComponent: DateFilter,
  },
  {
    header: "User",
    accessor: "user_name",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("user_name"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Attribute",
    accessor: "attribute",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("attribute"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Old Value",
    accessor: "old_val",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("old_val"),
    filterComponent: TextFieldFilter,
    width: 120,
  },
  {
    header: "New Value",
    accessor: "new_val",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("new_val"),
    filterComponent: TextFieldFilter,
    width: 150,
  },
];

export default columns;
