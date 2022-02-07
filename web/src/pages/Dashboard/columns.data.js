import Bullseye from "apollo-react-icons/Bullseye";
import Cog from "apollo-react-icons/Cog";
import Question from "apollo-react-icons/Question";
import Rocket from "apollo-react-icons/Rocket";
import Services from "apollo-react-icons/Services";
import User3 from "apollo-react-icons/User3";
import moment from "moment";
import React from "react";

import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import {
  compareDates,
  compareStrings,
  createSelectFilterComponent,
  dateFilterV2,
} from "apollo-react/components/Table";
import { TextField } from "apollo-react/components/TextField/TextField";

export const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      type="number"
      style={{ width: 74 }}
      margin="none"
      size="small"
    />
  );
};

const DateFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <div style={{ minWidth: 230 }}>
      <div style={{ position: "absolute", top: 0, paddingRight: 4 }}>
        <DateRangePickerV2
          value={filters[accessor] || [null, null]}
          name={accessor}
          onChange={(value) =>
            updateFilterValue({
              target: { name: accessor, value },
            })
          }
          startLabel=""
          endLabel=""
          placeholder=""
          fullWidth
          margin="none"
          size="small"
        />
      </div>
    </div>
  );
};

const DateCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const date =
    rowValue && moment(rowValue, "MM/DD/YYYY").isValid()
      ? moment(rowValue, "MM/DD/YYYY").format("M/D/YYYY")
      : rowValue;

  return <span>{date}</span>;
};

const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleInputChange = (event, newValue, reason) => {
      if (reason !== "reset") {
        setInputValue(newValue);
      }
    };

    const value = filters[accessor];

    return (
      <div
        style={{
          minWidth: 144,
          maxWidth: 200,
          position: "relative",
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={value ? value.map((label) => ({ label })) : []}
          name={accessor}
          source={source}
          onChange={(event, v) =>
            updateFilterValue({
              target: {
                name: accessor,
                value: v.map(({ label }) => label),
              },
            })
          }
          fullWidth
          multiple
          chipColor="white"
          size="small"
          forcePopupIcon
          showCheckboxes
          limitChips={1}
          alwaysLimitChips
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          showSelectAll
          inputValue={inputValue}
          onInputChange={handleInputChange}
        />
      </div>
    );
  };

const departments = [
  "Design",
  "Engineering",
  "Human Resources",
  "Marketing",
  "QA",
];

const departmentIcons = {
  Design: Rocket,
  Engineering: Cog,
  "Human Resources": User3,
  Marketing: Services,
  QA: Bullseye,
};

const DepartmentCell = ({ row, column: { accessor } }) => {
  const department = row[accessor];
  const Icon = departmentIcons[department] || Question;
  return (
    <div style={{ position: "relative" }}>
      <Icon fontSize="small" style={{ position: "relative", top: 5 }} />
      {department || "Unknown"}
    </div>
  );
};

export function createStringArraySearchFilter(accessor) {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
}

const columns = [
  {
    header: "Dataset Name",
    accessor: "datasetname",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("datasetname"),
  },
  {
    header: "Vendor Source",
    accessor: "vendorsource",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("vendorsource"),
    filterComponent: createSelectFilterComponent(departments, {
      size: "small",
      multiple: true,
    }),
  },
  {
    header: "Current Job Status",
    accessor: "datastatus",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("datastatus"),
    filterComponent: createSelectFilterComponent(departments, {
      size: "small",
      multiple: true,
    }),
    customCell: DepartmentCell,
  },
  {
    header: "Last File Transfered",
    accessor: "filename",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("filename"),
    filterComponent: createSelectFilterComponent(departments, {
      size: "small",
      multiple: true,
    }),
  },
  {
    header: "Last Transfer Status",
    accessor: "childstatus",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("childstatus"),
    filterComponent: createSelectFilterComponent(departments, {
      size: "small",
      multiple: true,
    }),
    customCell: DepartmentCell,
  },
  {
    header: "Exceed % Change",
    accessor: "exceeds_pct_cng",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("exceeds_pct_cng"),
    filterComponent: createSelectFilterComponent(departments, {
      size: "small",
      multiple: true,
    }),
    customCell: DepartmentCell,
  },
  {
    header: "Last Transfer Date",
    accessor: "lastfiletransferred",
    sortFunction: compareDates,
    customCell: DateCell,
    filterFunction: dateFilterV2("lastfiletransferred"),
    filterComponent: DateFilter,
  },
];

const columnsToAdd = [
  {
    header: "Package name",
    accessor: "packagename",
  },
  {
    header: "File Name",
    accessor: "filename",
  },
  {
    header: "Clinical Data Type",
    accessor: "clinicaldatatypename",
  },
  {
    header: "Load Type",
    accessor: "loadType",
  },
  {
    header: "Last Download Transactions",
    accessor: "downloadtrnx",
  },
  {
    header: "Last Process Transactions",
    accessor: "processtrnx",
  },
  {
    header: "Download Ending Offset Value",
    accessor: "offset_val",
  },
  {
    header: "Error message",
    accessor: "errmsg",
  },
];

const moreColumnsWithFrozenWithoutActions = [
  ...columns.map((column) => ({ ...column })).slice(0, -1),
  ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
];

const moreColumnsWithFrozen = [
  ...moreColumnsWithFrozenWithoutActions,
  columns.slice(-1)[0],
];

moreColumnsWithFrozen[0].frozen = true;
moreColumnsWithFrozen[1].frozen = true;
moreColumnsWithFrozen[2].frozen = true;

export { moreColumnsWithFrozen, moreColumnsWithFrozenWithoutActions };

export default columns;
