/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import "./AuditLog.scss";
import { pick } from "lodash";
import moment from "moment";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Table from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import columns from "./columns.data";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import { getAuditLogs } from "../../store/actions/AuditLogsAction";
import { MessageContext } from "../../components/Providers/MessageProvider";
import { exportToCSV } from "../../utils/downloadData";

const AuditLog = () => {
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const auditLogs = useSelector((state) => state.auditLogs);
  const dashboard = useSelector((state) => state.dashboard);
  const auditData = auditLogs.data;
  const dataSetCount = dashboard?.selectedDataFlow?.dataSets;
  const dataflowName = dashboard?.selectedDataFlow?.dataFlowName || "";
  const [sortedColumnValue, setSortedColumnValue] = useState("log_version");
  const [sortOrderValue, setSortOrderValue] = useState("dsc");
  const [inlineFilters, setInlineFilters] = useState([]);

  const [tableRows, setTableRows] = useState([...auditData]);
  const [exportTableRows, setExportTableRows] = useState([...auditData]);
  const [tableColumns, setTableColumns] = useState([...columns]);
  const dispatch = useDispatch();
  const history = useHistory();
  const { dataflowId } = useParams();
  const messageContext = useContext(MessageContext);
  const fetchLogs = () => {
    dispatch(getAuditLogs(dataflowId));
  };

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Data Flow Settings",
      onClick: () => history.push("/dashboard/dataflow-management"),
    },
    {
      title: "Audit Log",
    },
  ];

  const applyFilter = (cols, rows, filts) => {
    let filteredRows = rows;
    Object.values(cols).forEach((column) => {
      if (column.filterFunction) {
        filteredRows = filteredRows.filter((row) => {
          return column.filterFunction(row, filts);
        });
        if (column.sortFunction) {
          filteredRows.sort(
            column.sortFunction(sortedColumnValue, sortOrderValue)
          );
        }
      }
    });
    return filteredRows;
  };

  const exportDataRows = () => {
    const toBeExportRows = [...auditData];
    const sortedFilteredData = applyFilter(
      tableColumns,
      toBeExportRows,
      inlineFilters
    );
    // console.log(
    //   "sortedFilteredData::::",
    //   sortedFilteredData,
    //   tableColumns,
    //   toBeExportRows,
    //   inlineFilters
    // );
    setExportTableRows(sortedFilteredData);
    return sortedFilteredData;
  };

  const downloadFileMethod = async (e) => {
    const fileExtension = ".xlsx";
    const fileName = `${dataflowName}_AuditLog_${moment(new Date()).format(
      "DDMMYYYY"
    )}`;
    // console.log("inDown", exportHeader);
    const exportRows = exportDataRows();
    const tempObj = {};
    // console.log("tableColumns", tableColumns);
    const temp = tableColumns
      .filter((d) => d.hidden !== true && d.ignore !== true)
      .map((d) => {
        tempObj[d.accessor] = d.header;
        return d;
      });
    const newData = exportRows.map((obj) => {
      const newObj = pick(obj, Object.keys(tempObj));
      return newObj;
    });
    exportToCSV(
      newData,
      tempObj,
      fileName + fileExtension,
      "data",
      pageNo,
      rowsPerPageRecord
    );

    if (exportRows.length <= 0) {
      e.preventDefault();
      const message = `There is no data on the screen to download because of which an empty file has been downloaded.`;
      messageContext.showErrorMessage(message);
    } else {
      const message = `File downloaded successfully.`;
      messageContext.showSuccessMessage(message);
    }
  };

  const CustomButtonHeader = ({ toggleFilters, downloadFile }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={DownloadIcon}
        onClick={downloadFile}
        style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
      >
        Download
      </Button>
      <Button
        size="small"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filter
      </Button>
    </div>
  );

  useEffect(() => {
    setTableRows(auditData);
    setExportTableRows(auditData);
  }, [auditData]);
  useEffect(() => {
    fetchLogs();
  }, []);

  const getTableData = React.useMemo(() => (
    <>
      <Table
        title="Data Flow Audit Log"
        columns={tableColumns}
        rows={tableRows}
        initialSortedColumn="log_version"
        sortedColumn={sortedColumnValue}
        sortOrder={sortOrderValue}
        rowsPerPageOptions={[10, 20, 50, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        page={pageNo}
        rowsPerPage={rowsPerPageRecord}
        onChange={(rpp, sc, so, filts, page) => {
          // console.log("onChange", rpp, sc, so, filts, page, others);
          setRowPerPageRecord(rpp);
          setSortedColumnValue(sc);
          setSortOrderValue(so);
          setInlineFilters(filts);
          setPageNo(page);
        }}
        columnSettings={{
          enabled: true,
          defaultColumns: columns,
          onChange: (changeColumns) => {
            setTableColumns(changeColumns);
          },
        }}
        CustomHeader={(props) => (
          <CustomButtonHeader downloadFile={downloadFileMethod} {...props} />
        )}
      />
    </>
  ));

  return (
    <main className="audit-logs-wrapper">
      <Paper className="no-shadow">
        <Box className="top-content">
          <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          <>
            <Button
              icon={<ChevronLeft />}
              size="small"
              style={{
                marginLeft: "-10px",
                marginTop: "-15px",
                marginBottom: "22px",
              }}
              onClick={() => history.push("/dashboard")}
            >
              Back
            </Button>
            <div className="flex title">
              <Typography className="b-font" variant="title">
                {dataflowName}
              </Typography>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="body2" className="b-font">
                {dataSetCount && dataSetCount > 1
                  ? `${dataSetCount} datasets`
                  : `${dataSetCount} dataset`}
              </Typography>
            </div>
          </>
        </Box>
      </Paper>
      <Box padding={3}>{getTableData}</Box>
    </main>
  );
};

export default AuditLog;
