/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "./AuditLog.scss";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Table from "apollo-react/components/Table";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import PageHeader from "../../components/DataFlow/PageHeader";
import columns from "./columns.data";
// import { rowsWithExtra } from "./rows.data";
import { getAuditLogs } from "../../store/actions/AuditLogsAction";

const breadcrumpItems = [
  { href: "/dashboard" },
  {
    title: "Data Flow Settings",
    href: "/dataflow-management",
  },
  {
    title: "Audit Log",
  },
];
const AuditLog = ({ match }) => {
  const dispatch = useDispatch();
  const { dataflowId } = useParams();
  const auditLogs = useSelector((state) => state.auditLogs);
  const fetchLogs = () => {
    dispatch(getAuditLogs(dataflowId));
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
      <Box padding={3}>
        <Table
          key="frozenExample1"
          title="Data Flow Audit Log"
          columns={columns}
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
          columnSettings={{
            enabled: true,
            frozenColumnsEnabled: true,
            defaultColumns: columns,
          }}
        />
      </Box>
    </main>
  );
};

export default AuditLog;
