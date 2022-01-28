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
import ButtonGroup from "apollo-react/components/ButtonGroup";
import PageHeader from "../../components/DataFlow/PageHeader";
import columns from "./columns.data";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import { getAuditLogs } from "../../store/actions/AuditLogsAction";
import { MessageContext } from "../../components/MessageProvider";
import { exportToCSV } from "../../utils/downloadData";

const AuditLog = () => {
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const auditLogs = useSelector((state) => state.auditLogs);
  const auditData = auditLogs.data;
  const [sortedColumnValue, setSortedColumnValue] = useState("dateadded");
  const [sortOrderValue, setSortOrderValue] = useState("asc");
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
      onClick: () => history.push("/dataflow-management"),
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
        console.log("filteredRows", filteredRows);
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
    setExportTableRows(sortedFilteredData);
    return sortedFilteredData;
  };

  const downloadFileMethod = async (e) => {
    const fileExtension = ".xlsx";
    const fileName = `AuditLog_${moment(new Date()).format("DDMMYYYY")}`;
    // console.log("inDown", exportHeader);
    const tempObj = {};
    const temp = tableColumns
      .filter((d) => d.hidden !== true)
      .map((d) => {
        tempObj[d.accessor] = d.header;
        return d;
      });
    const newData = exportTableRows.map((obj) => {
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
    const exportRows = exportDataRows();
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
        style={{ marginRight: "8px", border: "none" }}
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
        initialSortedColumn="name"
        sortedColumn={sortedColumnValue}
        sortOrder={sortOrderValue}
        rowsPerPageOptions={[10, 50, 100, "All"]}
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
      <PageHeader height={60} />
      <Paper className="no-shadow">
        <Box className="top-content">
          <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          <>
            <div className="flex title">
              <DataPackageIcon />
              <Typography className="b-font" variant="title">
                ACUSPHERE-NP-1998-CXA27260
              </Typography>
            </div>
            <div className="flex flex-center justify-between">
              <Typography variant="body2" className="b-font">
                6 datasets
              </Typography>
              <ButtonGroup
                alignItems="right"
                buttonProps={[
                  {
                    label: "Cancel",
                    size: "small",
                  },
                  {
                    label: "Save",
                    size: "small",
                  },
                ]}
              />
            </div>
          </>
        </Box>
      </Paper>
      <Box padding={3}>{getTableData}</Box>
    </main>
  );
};

export default AuditLog;
