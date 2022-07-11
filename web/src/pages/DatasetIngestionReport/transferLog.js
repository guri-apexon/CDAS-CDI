/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import moment from "moment";
import Typography from "apollo-react/components/Typography";
import SelectButton from "apollo-react/components/SelectButton";
import MenuItem from "apollo-react/components/MenuItem";
import Modal from "apollo-react/components/Modal";
import TextField from "apollo-react/components/TextField";
import Button from "apollo-react/components/Button";
import Link from "apollo-react/components/Link";
import Tag from "apollo-react/components/Tag";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import FileIcon from "apollo-react-icons/File";
import Check from "apollo-react-icons/Check";
import FileZipIcon from "apollo-react-icons/FileZip";
import Tooltip from "apollo-react/components/Tooltip";
import StatusNegativeIcon from "apollo-react-icons/StatusNegative";
import StatusCheck from "apollo-react-icons/StatusCheck";
import StatusDotOutline from "apollo-react-icons/StatusDotOutline";
import StatusExclamation from "apollo-react-icons/StatusExclamation";
import Table, {
  createStringSearchFilter,
  compareStrings,
  compareNumbers,
  compareDates,
} from "apollo-react/components/Table";
import Search from "apollo-react/components/Search";
import {
  getTransferLog,
  getDatasetIngestionTransferLog,
} from "../../store/actions/IngestionReportAction";
import {
  createStringArraySearchFilter,
  createSourceFromKey,
  createAutocompleteFilter,
  secondsToHms,
  DateFilter,
  dateFilterCustom,
} from "../../utils/index";

import { ReactComponent as FailedIcon } from "../../components/Icons/Failed.svg";
import { ReactComponent as IssueIcon } from "../../components/Icons/Issue.svg";
import { ReactComponent as InprogressIcon } from "../../components/Icons/In Progress.svg";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../components/Common/usePermission";

const TimeCell = ({ row, column: { accessor } }) => {
  const value = row[accessor];
  const time = value ? secondsToHms(value) : "";
  return <span>{time}</span>;
};

const FileNameCell = ({ row, column: { accessor } }) => {
  const value = row[accessor];
  const packageName = row.PackageName;
  return (
    <>
      <span>{value}</span>
      {packageName && (
        <>
          <br />
          <span style={{ display: "flex" }}>
            {" "}
            <FileZipIcon
              fontSize="extraSmall"
              style={{ color: "#999999", marginRight: 5 }}
            />
            {packageName}
          </span>
        </>
      )}
    </>
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

const StatusCell = ({ row, column: { accessor } }) => {
  const status = row[accessor] || "";
  const { canReadIngestionIssues } = row;
  const [open, setOpen] = useState(false);

  // if (
  //   status?.toLowerCase() === "loaded without issues" ||
  //   status?.toLowerCase() === "successful"
  // ) {
  //   return (
  //     <div>
  //       <Tag
  //         label={status}
  //         className=""
  //         style={{
  //           backgroundColor: "#00C221",
  //           color: "#FFFFFF",
  //           Width: 100,
  //         }}
  //         Icon={SuccessIcon}
  //       />
  //     </div>
  //   );
  // }
  // if (status?.toLowerCase() === "in progress") {
  //   return (
  //     <div>
  //       <Tag
  //         label={status}
  //         className=""
  //         style={{
  //           backgroundColor: "#00C221",
  //           color: "#FFFFFF",
  //           Width: 100,
  //         }}
  //         Icon={InprogressIcon}
  //       />
  //     </div>
  //   );
  // }
  // if (
  //   status?.toLowerCase() === "quarantined"
  //   // status?.toLowerCase() === "queued for new file check" ||
  //   // status?.toLowerCase() === "skipped"
  // ) {
  //   return (
  //     <div>
  //       <Tag
  //         label={status}
  //         className=""
  //         style={{
  //           backgroundColor: "#FF9300",
  //           color: "#FFFFFF",
  //           Width: 100,
  //         }}
  //         Icon={QuarantineIcon}
  //       />
  //     </div>
  //   );
  // }
  // if (status?.toLowerCase() === "queued for new file check") {
  //   return (
  //     <div>
  //       <Tag
  //         label="Queued"
  //         className=""
  //         style={{
  //           backgroundColor: "#10558A",
  //           color: "#FFFFFF",
  //           Width: 100,
  //         }}
  //         Icon={IssueIcon}
  //       />
  //     </div>
  //   );
  // }
  // if (status?.toLowerCase() === "loaded with issues") {
  //   return (
  //     <div>
  //       <Tag
  //         label="Processed"
  //         className=""
  //         style={{
  //           backgroundColor: "#FF9300",
  //           color: "#FFFFFF",
  //           width: 100,
  //         }}
  //         Icon={ProcessedIcon}
  //       />
  //       <Link
  //         disabled={!canReadIngestionIssues}
  //         onClick={() => console.log("link clicked")}
  //         style={{ fontWeight: 500, marginLeft: 8 }}
  //       >
  //         View
  //       </Link>
  //     </div>
  //   );
  // }
  return (
    <div>
      {status?.toLowerCase() === "successful" && (
        <div>
          <Tag
            label="Successful"
            style={{
              backgroundColor: "#00C221",
              color: "#FFFFFF",
              minWidth: 100,
            }}
            Icon={StatusCheck}
          />
        </div>
      )}
      {status?.toLowerCase() === "processed with errors" && (
        <div>
          <Tooltip
            variant="dark"
            title={open && status}
            placement="top"
            style={{ marginRight: 48 }}
          >
            <Tag
              label="Processed"
              style={{
                backgroundColor: "#FF9300",
                color: "#FFFFFF",
                minwidth: 100,
              }}
              onMouseOver={() => setOpen(true)}
              Icon={StatusExclamation}
            />
          </Tooltip>
          <Link
            disabled={!canReadIngestionIssues}
            onClick={() => console.log("link clicked")}
            style={{ fontWeight: 500, marginLeft: 8 }}
          >
            View
          </Link>
        </div>
      )}
      {status?.toLowerCase() === "queued" && (
        <div>
          <Tag
            label={status}
            style={{
              backgroundColor: "#10558A",
              color: "#FFFFFF",
              minWidth: 100,
            }}
            Icon={StatusDotOutline}
          />
        </div>
      )}
      {status?.toLowerCase() === "failed" && (
        <div>
          <Tag
            label={status}
            style={{
              backgroundColor: "#E20000",
              color: "#FFFFFF",
              minWidth: 100,
            }}
            Icon={FailedIcon}
          />
        </div>
      )}
      {status?.toLowerCase() === "skipped" && (
        <div>
          <Tag
            label={status}
            style={{
              backgroundColor: "#E20000",
              color: "#FFFFFF",
              minWidth: 100,
            }}
            Icon={FailedIcon}
          />
        </div>
      )}
      {status?.toLowerCase() === "in progress" && (
        <div>
          <Tag
            label={status}
            style={{
              backgroundColor: "#00C221",
              color: "#FFFFFF",
              minWidth: 100,
            }}
            Icon={InprogressIcon}
          />
        </div>
      )}
      {/* <div style={{ position: "relative" }}>
        <Tag
          label={status}
          className=""
          style={{
            backgroundColor: "#E20000",
            color: "#FFFFFF",
            Width: 100,
          }}
          Icon={FailedIcon}
        />
      </div> */}
    </div>
  );
};

const SearchTextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
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

const generateColumns = (tableRows = []) => {
  return [
    {
      header: "Transfer Date",
      accessor: "TransferDate",
      customCell: DateCell,
      sortFunction: compareDates,
      filterFunction: dateFilterCustom("TransferDate"),
      filterComponent: DateFilter,
      frozen: true,
      width: 180,
    },
    {
      header: "File Name",
      accessor: "FileName",
      customCell: FileNameCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("FileName"),
      filterComponent: SearchTextFieldFilter,
      frozen: true,
      fixedWidth: false,
    },
    {
      header: "File Transfer Status",
      accessor: "FileTransferStatus",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("FileTransferStatus"),
      filterComponent: createAutocompleteFilter(
        createSourceFromKey(tableRows, "FileTransferStatus")
      ),
      width: 250,
    },
    {
      header: "Download Time",
      accessor: "DownloadTime",
      customCell: TimeCell,
      sortFunction: compareNumbers,
    },
    {
      header: "Process Time",
      accessor: "ProcessTime",
      customCell: TimeCell,
      sortFunction: compareNumbers,
    },
    {
      header: "Download Transactions",
      accessor: "DownloadTransactions",
      sortFunction: compareNumbers,
    },
    {
      header: "Process Transactions",
      accessor: "ProcessTransactions",
      sortFunction: compareNumbers,
    },
    {
      header: "New Records",
      accessor: "NewRecords",
      sortFunction: compareNumbers,
    },
    {
      header: "Modified Records",
      accessor: "ModifiedRecords",
      sortFunction: compareNumbers,
    },
    {
      header: "Download Date",
      accessor: "DownloadDate",
      customCell: DateCell,
      sortFunction: compareDates,
      hidden: true,
    },
    {
      header: "Process Date",
      accessor: "ProcessDate",
      customCell: DateCell,
      sortFunction: compareDates,
      hidden: true,
    },
    {
      header: "Last Complete",
      accessor: "LastCompleted",
      customCell: DateCell,
      sortFunction: compareDates,
      hidden: true,
    },
    {
      header: "Last Attempt",
      accessor: "LastAttempted",
      customCell: DateCell,
      sortFunction: compareDates,
      hidden: true,
    },
    {
      header: "Error Message",
      accessor: "errmsg",
      hidden: true,
    },
  ];
};

const TransferLog = ({ datasetProperties, transferLogFilter }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const { loading, transferHistory } = useSelector(
    (state) => state.ingestionReports
  );

  const dashboard = useSelector((state) => state.dashboard);
  const { prot_id: protId } = dashboard?.selectedCard;

  const { canEnabled: canReadIngestionIssues } = useStudyPermission(
    Categories.MENU,
    Features.CDI_INGESTION_ISSUES,
    protId
  );

  const [totalLog, setTotalLog] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [, setHasUpdated] = useState(false);
  const columns = generateColumns(tableRows);
  const [columnsState, setColumns] = useState([...columns]);
  const [loadType, setLoadType] = useState("");
  const { datasetId } = params;
  const [selectedMenuText, setSelectedMenuText] = useState(
    "Within past 10 days"
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [errorInput, setErrorInput] = useState(false);
  const [customValue, setCustomValue] = useState(null);

  const changeCustomDays = (val) => {
    if (val < 1 || val > 120) {
      setErrorInput(true);
      return false;
    }
    setCustomValue(val);
    setSelectedMenuText(`Within past ${val} days`);
    setErrorInput(false);
    return null;
  };

  // const getData = () => {
  //   dispatch(getTransferLog(datasetId));
  // };

  const getFileHistoryData = (days = "") => {
    const date = moment().utc().format("YYYY-MM-DD");
    dispatch(getDatasetIngestionTransferLog(datasetId, days, date));
    setMenuOpen(false);
  };

  const selectChangeView = (val) => {
    if (val === "custom") {
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
      getFileHistoryData(val);
      setSelectedMenuText(`Within past ${val} days`);
    }
  };
  useEffect(() => {
    if (datasetProperties?.loadType?.toLowerCase() === "incremental") {
      setLoadType(datasetProperties?.loadType);
    } else {
      setLoadType("Cumulative");
    }
  }, [datasetProperties]);

  useEffect(() => {
    getFileHistoryData("10");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const rows =
      transferHistory?.records?.length > 0 && transferLogFilter
        ? transferHistory?.records.filter((rec) => {
            if (transferLogFilter === "ingestion_issues") {
              return (
                rec.FileTransferStatus?.toLowerCase() === "loaded with issues"
              );
            }
            if (transferLogFilter === "failed") {
              return (
                rec.FileTransferStatus?.toLowerCase() === "failed" ||
                rec.FileTransferStatus?.toLowerCase().includes("error")
              );
            }
            return rec;
          })
        : transferHistory?.records;

    setTableRows(rows ?? []);
    setTotalLog(transferHistory.totalSize ?? 0);
    const col = generateColumns(transferHistory?.records);
    setColumns([...col]);
  }, [loading, transferHistory, transferLogFilter]);

  const CustomHeader = ({ toggleFilters }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" style={{ fontSize: 14, marginRight: 10 }}>
          Change View:
        </Typography>
        <SelectButton
          size="small"
          placeholder="Within past 10 days"
          style={{ marginRight: 10 }}
          onChange={selectChangeView}
          displayText={selectedMenuText}
          noDeselect
        >
          <MenuItem value="10">Within past 10 days</MenuItem>
          <MenuItem value="30">Within past 30 days</MenuItem>
          <MenuItem value="custom">Custom date range</MenuItem>
        </SelectButton>
      </div>
      <Button
        id="addLocationBtn"
        icon={<DownloadIcon />}
        size="small"
        style={{ marginLeft: 16 }}
      >
        Download
      </Button>
      <Button
        size="small"
        id="filterBtn"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filters
      </Button>
    </div>
  );

  return (
    <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 24 }}>
      <Table
        title={`${loadType} File Transfer Log`}
        subtitle={
          <div style={{ display: "flex", alignItems: "center" }}>
            <FileIcon
              style={{ width: 15, height: 17, color: "#999", marginRight: 8 }}
            />
            <span style={{ marginTop: 2, lineHeight: "24px" }}>
              {`${totalLog} File Transfers`}
            </span>
          </div>
        }
        columns={columnsState}
        rows={tableRows.map((row) => ({ ...row, canReadIngestionIssues }))}
        rowId="src_loc_id"
        initialSortedColumn="TransferDate"
        initialSortOrder="desc"
        rowsPerPageOptions={[10, 50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "File" : "Files"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        CustomHeader={(props) => <CustomHeader {...props} />}
        columnSettings={{
          enabled: true,
          onChange: (clumns) => {
            setHasUpdated(true);
            setColumns(clumns);
          },
          defaultColumns: columns,
          frozenColumnsEnabled: true,
        }}
      />
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Choose Custom Days"
        message={
          <TextField
            type="number"
            label="Choose upto past 120 days"
            value={customValue}
            inputProps={{ min: 1, max: 120, pattern: "[0-9]" }}
            onChange={(e) => changeCustomDays(e.target.value)}
            helperText={errorInput ? "Select valid input" : null}
            error={errorInput}
          />
        }
        buttonProps={[
          {
            label: "Ok",
            disabled: errorInput || !customValue,
            onClick: () => getFileHistoryData(customValue),
          },
        ]}
      />
    </div>
  );
};

export default TransferLog;
