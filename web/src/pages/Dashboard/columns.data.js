/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import Check from "apollo-react-icons/Check";
import StatusNegativeIcon from "apollo-react-icons/StatusNegative";
import Arrow2Up from "apollo-react-icons/Arrow2Up";
import Arrow2Down from "apollo-react-icons/Arrow2Down";

import Link from "apollo-react/components/Link";
import Tag from "apollo-react/components/Tag";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import Search from "apollo-react/components/Search";

import {
  compareDates,
  compareStrings,
  createStringSearchFilter,
  numberSearchFilter,
  dateFilterV2,
  compareNumbers,
} from "apollo-react/components/Table";
import { ReactComponent as StaleIcon } from "../../components/Icons/Stale.svg";
import { ReactComponent as FailureIcon } from "../../components/Icons/failure.svg";
import { ReactComponent as IssueIcon } from "../../components/Icons/Issue.svg";
import "./Dashboard.scss";
import { IntegerFilter } from "../../utils/index";

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
    rowValue && moment(rowValue, "YYYY-MM-DD HH:mm:ss").isValid()
      ? moment(rowValue, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY hh:mm A")
      : rowValue;

  return <span>{date}</span>;
};

const createAutocompleteFilter =
  (key) =>
  ({ accessor, filters, updateFilterValue }) => {
    const [inputValue, setInputValue] = React.useState("");
    const dashboard = useSelector((state) => state.dashboard);
    const rowData = dashboard.ingestionData?.datasets || [];
    const source = Array.from(
      new Set(
        rowData
          .filter((data) => data[key])
          .map((data) => ({ label: data[key] }))
          .map((item) => item.label)
      )
    )
      .map((label) => {
        return { label };
      })
      .sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });
    const handleInputChange = (event, newValue, reason) => {
      if (reason !== "reset") {
        setInputValue(newValue);
      }
    };

    const value = filters[accessor];

    return (
      <div
        style={{
          minWidth: 150,
          maxWidth: 300,
          position: "relative",
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={value ? value.map((label) => ({ label })) : []}
          name={accessor}
          source={source || []}
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

const DatasetCell = ({ row, column: { accessor } }) => {
  const dataset = row[accessor];
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      onClick={() => console.log("link clicked")}
      style={{ fontWeight: 500 }}
    >
      {dataset}
    </Link>
  );
};

const JobstatusCell = ({ row, column: { accessor } }) => {
  const status = row[accessor] || "";
  return (
    <div>
      {status?.toLowerCase() === "up-to-date" && (
        <div style={{ position: "relative" }}>
          <Check
            style={{
              position: "relative",
              top: 4,
              fontSize: 14,
              color: "#00C221",
              marginRight: 8,
            }}
          />
          {status}
        </div>
      )}
      {status?.toLowerCase() === "stale" && (
        <div>
          <Tag
            label={status}
            className="staleAlertStatus"
            style={{
              backgroundColor: "#e2000012",
              fontWeight: 600,
              color: "#E20000",
            }}
            Icon={StaleIcon}
          />
        </div>
      )}
      {status?.toLowerCase() === "failed" && (
        <div>
          <Tag
            label={status}
            className="failedStatus"
            style={{
              backgroundColor: "#e20000",
              fontWeight: 600,
              color: "#fff",
            }}
            Icon={FailureIcon}
          />
        </div>
      )}
      {status?.toLowerCase() === "inactive" && (
        <div>
          <Tag label={status} color="#B5B5B5" />
        </div>
      )}
      {(status?.toLowerCase() === "processing" ||
        status?.toLowerCase() === "queued" ||
        status?.toLowerCase() === "skipped") && (
        <div>
          <Tag label={status} className="queueStatus" />
        </div>
      )}
    </div>
  );
};

const StatusCell = ({ row, column: { accessor } }) => {
  const status = row[accessor] || "";
  if (
    status?.toLowerCase() === "loaded without issues" ||
    status?.toLowerCase() === "successful" ||
    status?.toLowerCase() === "in progress"
  ) {
    return (
      <div>
        <div style={{ position: "relative" }}>
          <Check
            style={{
              position: "relative",
              top: 4,
              fontSize: 14,
              color: "#00C221",
              marginRight: 8,
            }}
          />
          {status}
        </div>
      </div>
    );
  }
  if (
    status?.toLowerCase() === "quarantined" ||
    status?.toLowerCase() === "queued for new file check" ||
    status?.toLowerCase() === "skipped"
  ) {
    return (
      <div>
        <div style={{ position: "relative" }}>
          <StatusNegativeIcon
            style={{
              position: "relative",
              top: 4,
              fontSize: 14,
              color: "#e20000",
              marginRight: 8,
            }}
          />
          {status}
        </div>
      </div>
    );
  }
  if (status?.toLowerCase() === "loaded with ingestion issues") {
    return (
      <div>
        <div style={{ position: "relative" }}>
          <IssueIcon
            style={{
              position: "relative",
              top: 4,
              marginRight: 8,
              width: "14px",
              height: "17px",
            }}
          />
          {status}
          <Link
            onClick={() => console.log("link clicked")}
            style={{ fontWeight: 500, marginLeft: 8 }}
          >
            View
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ position: "relative" }}>
        <FailureIcon
          style={{
            position: "relative",
            top: 4,
            marginRight: 8,
            width: "14px",
            height: "17px",
          }}
        />
        {status}
      </div>
    </div>
  );
};

const exceedPerCell = ({ row, column: { accessor } }) => {
  const exceed = row[accessor] || "";
  return (
    <div>
      {exceed > 0 && (
        <div style={{ position: "relative" }}>
          <Arrow2Up
            style={{
              position: "relative",
              top: 4,
              marginRight: 8,
              width: "14px",
              height: "17px",
            }}
          />
          {`${Math.abs(exceed)}%`}
        </div>
      )}
      {exceed < 0 && (
        <div style={{ position: "relative" }}>
          <Arrow2Down
            style={{
              position: "relative",
              top: 4,
              marginRight: 8,
              width: "14px",
              height: "17px",
            }}
          />
          {`${Math.abs(exceed)} %`}
        </div>
      )}
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

const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <Search
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      fullWidth
      margin="none"
      size="small"
    />
  );
};

const columns = [
  {
    header: "Dataset Name",
    accessor: "datasetname",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("datasetname"),
    filterComponent: TextFieldFilter,
    customCell: DatasetCell,
  },
  {
    header: "Vendor Source",
    accessor: "vendorsource",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("vendorsource"),
    filterComponent: createAutocompleteFilter("vendorsource"),
  },
  {
    header: "Dataset Status",
    accessor: "jobstatus",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("jobstatus"),
    filterComponent: createAutocompleteFilter("jobstatus"),
    customCell: JobstatusCell,
  },
  {
    header: "Last File Transferred",
    accessor: "filename",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("filename"),
    filterComponent: createAutocompleteFilter("filename"),
  },
  {
    header: "Last File Transfer Status",
    accessor: "datasetstatus",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("datasetstatus"),
    filterComponent: createAutocompleteFilter("datasetstatus"),
    customCell: StatusCell,
  },
  {
    header: "Exceeds % change indicator",
    accessor: "exceeds_pct_cng",
    sortFunction: compareNumbers,
    filterFunction: numberSearchFilter("exceeds_pct_cng"),
    filterComponent: IntegerFilter,
    customCell: exceedPerCell,
  },
  {
    header: "Last File Transfer Date",
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
    filterFunction: createStringArraySearchFilter("packagename"),
    filterComponent: createAutocompleteFilter("packagename"),
  },
  {
    header: "File Name",
    accessor: "mnemonicfile",
    filterFunction: createStringArraySearchFilter("mnemonicfile"),
    filterComponent: createAutocompleteFilter("mnemonicfile"),
  },
  {
    header: "Clinical Data Type",
    accessor: "clinicaldatatypename",
    filterFunction: createStringArraySearchFilter("clinicaldatatypename"),
    filterComponent: createAutocompleteFilter("clinicaldatatypename"),
  },
  {
    header: "Load Type",
    accessor: "loadtype",
    filterFunction: createStringArraySearchFilter("loadtype"),
    filterComponent: createAutocompleteFilter("loadtype"),
  },
  {
    header: "Last Download Transactions",
    accessor: "downloadtrnx",
    filterFunction: createStringArraySearchFilter("downloadtrnx"),
    filterComponent: createAutocompleteFilter("downloadtrnx"),
  },
  {
    header: "Last Process Transactions",
    accessor: "processtrnx",
    filterFunction: createStringArraySearchFilter("processtrnx"),
    filterComponent: createAutocompleteFilter("processtrnx"),
  },
  {
    header: "Download Ending Offset Value",
    accessor: "offset_val",
    filterFunction: createStringArraySearchFilter("offset_val"),
    filterComponent: createAutocompleteFilter("offset_val"),
  },
  {
    header: "Error message",
    accessor: "errmsg",
    filterFunction: createStringSearchFilter("errmsg"),
    filterComponent: TextFieldFilter,
  },
];

const moreColumnsWithFrozen = [
  ...columns.map((column) => ({ ...column })),
  ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
];

moreColumnsWithFrozen[0].frozen = true;
moreColumnsWithFrozen[1].frozen = true;
moreColumnsWithFrozen[2].frozen = true;

export { moreColumnsWithFrozen };

export default columns;
