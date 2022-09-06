/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import Check from "apollo-react-icons/Check";
import StatusNegativeIcon from "apollo-react-icons/StatusNegative";
import Arrow2Up from "apollo-react-icons/Arrow2Up";
import Arrow2Down from "apollo-react-icons/Arrow2Down";
// import { Link } from "react-router-dom";
import Link from "apollo-react/components/Link";
import Tag from "apollo-react/components/Tag";
import * as colors from "apollo-react/colors";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import Search from "apollo-react/components/Search";
import SuccessIcon from "apollo-react/icons/StatusCheck";
import ProcessedIcon from "apollo-react-icons/StatusExclamation";
import QuarantineIcon from "apollo-react-icons/EyeHidden";
import Tooltip from "apollo-react/components/Tooltip";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import InfoIcon from "apollo-react-icons/Info";
import Typography from "apollo-react/components/Typography";

import {
  compareDates,
  compareStrings,
  createStringSearchFilter,
  numberSearchFilter,
  compareNumbers,
} from "apollo-react/components/Table";
import { ReactComponent as StaleIcon } from "../../../components/Icons/Stale.svg";
import { ReactComponent as FailureIcon } from "../../../components/Icons/failure.svg";
import { ReactComponent as IssueIcon } from "../../../components/Icons/Issue.svg";
import { ReactComponent as FailedIcon } from "../../../components/Icons/Failed.svg";
import { ReactComponent as InProgressIcon } from "../../../components/Icons/In Progress.svg";

import "../Dashboard.scss";
import { dateFilterCustom, IntegerFilter } from "../../../utils/index";
import { SelectedDataflow } from "../../../store/actions/DashboardAction";

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
          // enableVirtualization
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
  const { canReadIngestionIssues, history } = row;
  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      disabled={!canReadIngestionIssues}
      onClick={() => {
        if (row?.fromAllMonitor) {
          history.push(`/cdihome/ingestion-report/${row.datasetid}`);
        } else {
          const selectedDataflow =
            dashboard?.flowData.filter(
              (data) => data.dataFlowName === row?.dataflow_name
            )[0] || {};
          dispatch(SelectedDataflow(selectedDataflow));
          history.push(`/dashboard/ingestion-report/${row.datasetid}`);
        }
      }}
      // to={`/dashboard/ingestion-report/${row.datasetid}`}
      style={{
        fontWeight: 500,
        color: "#0768FD",
        fontSize: 14,
        textDecoration: "none",
      }}
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

const DownloadStatusCell = ({ row, column: { accessor } }) => {
  const status = row[accessor] || "";
  return (
    <div>
      {status?.toLowerCase() === "quarantined" && (
        <div>
          <Tooltip title="Quarantined" placement="top">
            <Tag
              label="Quarantined"
              className="failedStatus"
              style={{
                backgroundColor: "#FF9300",
                fontWeight: 600,
                color: "#fff",
                minWidth: 100,
              }}
              Icon={QuarantineIcon}
            />
          </Tooltip>
        </div>
      )}
      {status?.toLowerCase() === "failed" && (
        <div>
          <Tooltip title="Failed" placement="top">
            <Tag
              label="Failed"
              className="failedStatus"
              style={{
                backgroundColor: "#e20000",
                fontWeight: 600,
                color: "#fff",
                minWidth: 100,
              }}
              Icon={FailedIcon}
            />
          </Tooltip>
        </div>
      )}
      {status?.toLowerCase() === "successful" && (
        <div>
          <Tooltip title="Successful" placement="top">
            <Tag
              label="Successful"
              className="successStatus"
              style={{
                backgroundColor: "#00c221",
                fontWeight: 600,
                color: "#fff",
                minWidth: 100,
              }}
              Icon={SuccessIcon}
            />
          </Tooltip>
        </div>
      )}

      {(status?.toLowerCase() === "in progress" ||
        status?.toLowerCase() === "queued") && (
        <div>
          <Tag label={status} className="queueStatus" />
        </div>
      )}
    </div>
  );
};
const ProcessStatusCell = ({ row, column: { accessor } }) => {
  const status = row[accessor] || "";
  const { history } = row;
  return (
    <div>
      {status?.toLowerCase() === "failed" && (
        <div>
          <Tooltip title="Failed" placement="top">
            <Tag
              label="Failed"
              className="failedStatus"
              style={{
                backgroundColor: "#e20000",
                fontWeight: 600,
                color: "#fff",
                minWidth: 100,
              }}
              Icon={FailedIcon}
            />
          </Tooltip>
        </div>
      )}
      {status?.toLowerCase() === "successful" && (
        <div>
          <Tooltip title="Successful" placement="top">
            <Tag
              label="Successful"
              className="successStatus"
              style={{
                backgroundColor: "#00c221",
                fontWeight: 600,
                color: "#fff",
                minWidth: 100,
              }}
              Icon={SuccessIcon}
            />
          </Tooltip>
        </div>
      )}
      {status?.toLowerCase() === "in progress" && (
        <div>
          <Tooltip title="In Progress" placement="top">
            <Tag
              label="In Progress"
              className="inProgressStatus"
              style={{
                backgroundColor: "#10558a",
                fontWeight: 600,
                color: "#fff",
                minWidth: 100,
              }}
              Icon={InProgressIcon}
            />
          </Tooltip>
        </div>
      )}
      {status?.toLowerCase() === "processed with errors" && (
        <div>
          <Tooltip title="Processed with errors" placement="top">
            <Tag
              label="Processed"
              className="successStatus"
              style={{
                backgroundColor: "#ff9300",
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                minWidth: 100,
              }}
              onClick={() => {
                if (row?.fromAllMonitor) {
                  history.push(`/cdihome/ingestion-issues/${row.datasetid}`);
                } else {
                  history.push(`/dashboard/ingestion-issues/${row.datasetid}`);
                }
              }}
              Icon={ProcessedIcon}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

const StatusCell = ({ row, column: { accessor } }) => {
  const status = row[accessor] || "";
  const history = useHistory();
  const { canReadIngestionIssues } = row;
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
            disabled={!canReadIngestionIssues}
            onClick={() =>
              history.push(`/dashboard/ingestion-issues/${row.datasetid}`)
            }
            style={{ fontWeight: 500, marginLeft: 8 }}
          >
            View
          </Link>
        </div>
      </div>
    );
  }
  if (status) {
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
  }
  return null;
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

const ActionCell = ({ row }) => {
  const history = useHistory();
  const menuItems = [
    {
      text: "View",
      id: 1,
      onClick: () => {
        if (row?.fromAllMonitor) {
          history.push(`/cdihome/ingestion-report/${row.datasetid}`);
        } else {
          history.push(`/dashboard/ingestion-report/${row.datasetid}`);
        }
      },
    },
    {
      text: "Data Refresh History",
      id: 3,
      onClick: () => {
        if (row?.fromAllMonitor) {
          history.push(`/cdihome/ingestion-report/${row.datasetid}?logs`);
        } else {
          history.push(`/dashboard/ingestion-report/${row.datasetid}?logs`);
        }
      },
    },
    // Not part of current scope
    // {
    //   text: "Refresh Data",
    //   id: 4,
    // },
    // {
    //   text: "Reload Data",
    //   id: 5,
    // },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "end" }}>
      <Tooltip title="Actions" disableFocusListener>
        <IconMenuButton id="actionsDropdown" menuItems={menuItems} size="small">
          <EllipsisVertical />
        </IconMenuButton>
      </Tooltip>
    </div>
  );
};

// 'Failed', 'Blank', 'Processed w/Errors', 'In Progress', and 'Successful'.

const customProcessStatusSortFunction = (accessor, sortOrder) => {
  const POINTS = {
    failed: 1,
    blank: 2,
    "processed with errors": 3,
    "in progress": 4,
    successful: 5,
  };
  return (rowA, rowB) => {
    let result;
    const stringA = (rowA[accessor] || "blank").toLowerCase();
    const stringB = (rowB[accessor] || "blank").toLowerCase();

    if (POINTS[stringA] < POINTS[stringB]) {
      result = -1;
    } else if (POINTS[stringA] > POINTS[stringB]) {
      result = 1;
    } else {
      return 0;
    }

    return sortOrder === "asc" ? result : -result;
  };
};

const fileNameHeader = () => {
  return (
    <div>
      <Typography
        style={{
          color: "#595959",
          fontSize: "14px",
          fontWeight: "500",
          verticalAllign: "middle",
          display: "flex",
        }}
      >
        File Name
        <Tooltip placement="top" title="Package and Dataset Concatenation">
          <InfoIcon
            fontSize="small"
            style={{ color: colors.neutral7, paddingLeft: "5px" }}
          />
        </Tooltip>
      </Typography>
    </div>
  );
};
const columns = [
  {
    header: "Protocol Number",
    accessor: "prot_nbr",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("prot_nbr"),
    filterComponent: TextFieldFilter,
    frozen: true,
  },
  {
    header: "Vendor Source",
    accessor: "vendorsource",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("vendorsource"),
    filterComponent: createAutocompleteFilter("vendorsource"),
    frozen: true,
  },
  {
    header: "Dataset Name (Mnemonic)",
    accessor: "datasetname",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("datasetname"),
    filterComponent: TextFieldFilter,
    customCell: DatasetCell,
    frozen: true,
  },
  {
    header: "Last Download Status",
    accessor: "downloadstatus",
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("downloadstatus"),
    filterComponent: createAutocompleteFilter("downloadstatus"),
    customCell: DownloadStatusCell,
  },
  {
    header: "Last Download Date/Time",
    accessor: "downloadendtime",
    sortFunction: compareStrings,
    filterFunction: dateFilterCustom("downloadendtime"),
    filterComponent: DateFilter,
    customCell: DateCell,
  },
  {
    header: "Last Process Status",
    accessor: "processstatus",
    sortFunction: customProcessStatusSortFunction,
    filterFunction: createStringArraySearchFilter("processstatus"),
    filterComponent: createAutocompleteFilter("processstatus"),
    customCell: ProcessStatusCell,
  },
  {
    header: "Last Process Date/Time",
    accessor: "processendtime",
    sortFunction: compareStrings,
    filterFunction: dateFilterCustom("processendtime"),
    filterComponent: DateFilter,
    customCell: DateCell,
  },
  // {
  //   header: "Dataset Status",
  //   accessor: "jobstatus",
  //   sortFunction: compareStrings,
  //   filterFunction: createStringArraySearchFilter("jobstatus"),
  //   filterComponent: createAutocompleteFilter("jobstatus"),
  //   customCell: JobstatusCell,
  //   frozen: false,
  // },
  // {
  //   header: "Last File Transferred",
  //   accessor: "filename",
  //   sortFunction: compareStrings,
  //   filterFunction: createStringArraySearchFilter("filename"),
  //   filterComponent: createAutocompleteFilter("filename"),
  // },
  // {
  //   header: "Last File Transfer Status",
  //   accessor: "datasetstatus",
  //   sortFunction: compareStrings,
  //   filterFunction: createStringArraySearchFilter("datasetstatus"),
  //   filterComponent: createAutocompleteFilter("datasetstatus"),
  //   customCell: StatusCell,
  // },
  // {
  //   header: "Exceeds % change indicator",
  //   accessor: "exceeds_pct_cng",
  //   sortFunction: compareNumbers,
  //   filterFunction: numberSearchFilter("exceeds_pct_cng"),
  //   filterComponent: IntegerFilter,
  //   customCell: exceedPerCell,
  // },
  // {
  //   header: "Last File Transfer Date",
  //   accessor: "lastfiletransferred",
  //   sortFunction: compareDates,
  //   customCell: DateCell,
  //   filterFunction: dateFilterCustom("lastfiletransferred"),
  //   filterComponent: DateFilter,
  // },
  {
    header: "Last Attempted Date/Time",
    accessor: "lastattempted",
    sortFunction: compareDates,
    customCell: DateCell,
    filterFunction: dateFilterCustom("lastattempted"),
    filterComponent: DateFilter,
  },
  {
    header: "Error message",
    accessor: "errmsg",
    filterFunction: createStringSearchFilter("errmsg"),
    filterComponent: TextFieldFilter,
  },
  {
    header: fileNameHeader(),
    accessor: "filename",
    filterFunction: createStringArraySearchFilter("filename"),
    filterComponent: createAutocompleteFilter("filename"),
  },
  {
    header: "Data Flow Name",
    accessor: "dataflow_name",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("dataflow_name"),
    filterComponent: TextFieldFilter,
  },
];

const ActionColumn = [
  {
    accessor: "action",
    customCell: ActionCell,
    width: 32,
  },
];

const columnsToAdd = [
  // {
  //   header: "Package name",
  //   accessor: "packagename",
  //   filterFunction: createStringArraySearchFilter("packagename"),
  //   filterComponent: createAutocompleteFilter("packagename"),
  // },
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
];

const moreColumnsWithFrozen = [
  ...columns.map((column) => ({ ...column })),
  ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
  ...ActionColumn,
];

export { moreColumnsWithFrozen };

export default columns;
