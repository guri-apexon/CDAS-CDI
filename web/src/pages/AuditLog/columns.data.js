import Bullseye from "apollo-react-icons/Bullseye";
import Cog from "apollo-react-icons/Cog";
import OpenNew from "apollo-react-icons/OpenNew";
import Pencil from "apollo-react-icons/Pencil";
import Question from "apollo-react-icons/Question";
import Rocket from "apollo-react-icons/Rocket";
import Services from "apollo-react-icons/Services";
import User3 from "apollo-react-icons/User3";
import moment from "moment";
import React from "react";

import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import IconButton from "apollo-react/components/IconButton";
import {
  compareDates,
  compareNumbers,
  compareStrings,
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
} from "apollo-react/components/Table";
import { TextField } from "apollo-react/components/TextField/TextField";
import { rows } from "./rows.data";

const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      fullWidth
      margin="none"
      size="small"
    />
  );
};

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

const VersionCell = ({ row, column: { accessor } }) => {
  const version = row[accessor];
  return <span>{`${version}.0`}</span>;
};

const DateCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const date =
    rowValue && moment(rowValue, "MM/DD/YYYY").isValid()
      ? moment(rowValue, "MM/DD/YYYY").format("MM/DD/YYYY")
      : moment(rowValue).format("DD-MMM-YYYY HH:mm A");

  return <span>{date}</span>;
};

const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const ref = React.useRef();
    const [height, setHeight] = React.useState(0);
    const [isFocused, setIsFocused] = React.useState(false);
    const value = filters[accessor];

    React.useEffect(() => {
      const curHeight = ref?.current?.getBoundingClientRect().height;
      if (curHeight !== height) {
        setHeight(curHeight);
      }
    }, [value, isFocused, height]);

    return (
      <div
        style={{
          minWidth: 144,
          maxWidth: 200,
          position: "relative",
          height,
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
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
        />
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
    accessor: "audit_vers",
    sortFunction: compareStrings,
    customCell: VersionCell,
    filterFunction: createStringSearchFilter("audit_vers"),
    filterComponent: TextFieldFilter,
    width: 70,
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
    accessor: "audit_updt_dt",
    sortFunction: compareDates,
    customCell: DateCell,
    filterFunction: dateFilterV2("audit_updt_dt"),
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
