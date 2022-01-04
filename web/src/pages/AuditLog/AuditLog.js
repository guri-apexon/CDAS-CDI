/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./AuditLog.scss";
import Paper from "apollo-react/components/Paper";
import moment from "moment";
import Typography from "apollo-react/components/Typography";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Table from "apollo-react/components/Table";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import * as XLSX from "xlsx";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import Button from "apollo-react/components/Button";
import PageHeader from "../../components/DataFlow/PageHeader";
import columns from "./columns.data";
import { rowsWithExtra } from "./rows.data";
import { getAuditLogs } from "../../store/actions/AuditLogsAction";

const breadcrumpItems = [
  { href: "/" },
  {
    title: "Data Flow Settings",
  },
  {
    title: "Audit Log",
  },
];
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

const AuditLog = () => {
  const dispatch = useDispatch();
  const auditLogs = useSelector((state) => state.auditLogs);
  const fetchLogs = (query = "") => {
    dispatch(getAuditLogs(query));
  };
  const onChangeTable = (first, second, third, four, five) => {
    console.log(
      "first, second, third, four, five",
      first,
      second,
      third,
      four,
      five
    );
  };

  const downloadFile = async (e) => {
    const fileExtension = ".xlsx";
    const fileName = `StudyList_${moment(new Date()).format("DDMMYYYY")}`;
    // console.log("inDown", exportHeader);
    const tempObj = {};
    const temp = tableColumns
      .slice(0, -1)
      .filter((d) => d.hidden !== true)
      .map((d) => {
        tempObj[d.accessor] = d.header;
        return d;
      });
    const newData = exportTableRows.map((obj) => {
      const newObj = pick(obj, Object.keys(tempObj));
      return newObj;
    });
    exportToCSV(newData, tempObj, fileName + fileExtension);
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

  useEffect(() => {
    fetchLogs();
  }, []);
  return (
    <main className="audit-logs-wrapper">
      <PageHeader height={60} />
      <Paper className="no-shadow">
        <Box className="top-content">
          <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          <>
            <div className="flex title">
              <img src="assets/svg/datapackage.svg" alt="datapackage" />
              <Typography className="b-font" variant="title">
                CTJ301UC201_10032019_11820AB17BA.rar
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
      <Box padding={3}>
        <Table
          key="frozenExample1"
          title="Data Flow Audit Log"
          columns={columns}
          onChange={onChangeTable}
          rows={auditLogs.data}
          initialSortedColumn="name"
          rowsPerPageOptions={[5, 10, 15, "All"]}
          tablePaginationProps={{
            labelDisplayedRows: ({ from, to, count }) =>
              `${
                count === 1 ? "Employee " : "Employees"
              } ${from}-${to} of ${count}`,
            truncate: true,
          }}
          columnSettings={{ enabled: true, frozenColumnsEnabled: true }}
          CustomHeader={(props) => (
            <CustomButtonHeader downloadFile={downloadFile} {...props} />
          )}

        />
      </Box>
    </main>
  );
};

export default AuditLog;
