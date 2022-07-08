/* eslint-disable no-script-url */
import React from "react";
import { useHistory } from "react-router-dom";

import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Divider from "apollo-react/components/Divider";
import Table from "apollo-react/components/Table";
import Paper from "apollo-react/components/Paper";

const Step3 = ({
  classes,
  goToPreviousStep,
  dataFlowSource,
  nextDisabled,
  goToNextStep,
  handleCancel,
  breadcrumbItems,
  goToDashboard,
}) => {
  const boldCell = ({ row, column: { accessor } }) => {
    if (accessor === "testflag") {
      return (
        <span className={classes.bold}>
          {row[accessor] === 0 ? "Production" : "Test"}
        </span>
      );
    }
    return <span className={classes.bold}>{row[accessor]}</span>;
  };

  const dfColumns = [
    {
      header: "Data Flow Name",
      accessor: "name",
      customCell: boldCell,
    },
  ];

  const selectedDfColumns = [
    {
      header: "Vendor Source",
      accessor: "vendorname",
      customCell: boldCell,
    },
    {
      header: "Description",
      accessor: "description",
      customCell: boldCell,
    },
    {
      header: "Type",
      accessor: "testflag",
      customCell: boldCell,
    },
    {
      header: "External Source System",
      accessor: "externalsystemname",
      customCell: boldCell,
    },
    {
      header: "Location Type",
      accessor: "locationtype",
      customCell: boldCell,
    },
    {
      header: "Adapter",
      accessor: "type",
      customCell: boldCell,
    },
  ];

  const DfDetailsColumns = [
    {
      header: "Datapackage Name",
      accessor: "datapackagename",
      width: "35%",
      customCell: ({ row, column: { accessor } }) => {
        return <>{row[accessor] ? row[accessor] : "-----------------------"}</>;
      },
    },
    {
      header: "Dataset Name",
      accessor: "datasetname",
      width: "40%",
      customCell: ({ row, column: { accessor } }) => {
        return <>{row[accessor] ? row[accessor] : "-----------------------"}</>;
      },
    },
  ];

  return (
    <>
      <div className={classes.contentHeader}>
        <BreadcrumbsUI
          className={classes.breadcrumbs}
          id="dataflow-breadcrumb"
          items={breadcrumbItems}
        />
        <Button
          onClick={goToDashboard}
          className="back-btn"
          icon={<ChevronLeft />}
          size="small"
        >
          Back to Dashboard
        </Button>
        <Typography
          variant="title1"
          className={`${classes.title} ${classes.bold}`}
        >
          Select Data Flow from Study
        </Typography>
        <Typography
          variant="title3"
          className={`${classes.ml8} ${classes.bold}`}
        >
          Verify data flow to clone
        </Typography>
      </div>
      <Divider />
      <div className={classes.mainSection}>
        {!dataFlowSource?.length ? (
          <>
            <br />
            <Typography>No data available for this dataflow</Typography>
          </>
        ) : (
          <>
            <Typography className={classes.bold}>Data Flow Details</Typography>
            <Paper className={classes.mt8}>
              <span className="selected-study-table  nohover transparent">
                <Table
                  className={classes.mt24}
                  columns={dfColumns}
                  rows={dataFlowSource?.[0] ? [dataFlowSource?.[0]] : []}
                  // rowId="vendorname"
                  hidePagination
                />
              </span>
              <span className="selected-study-table nohover transparent">
                <Table
                  className={classes.mt24}
                  columns={selectedDfColumns}
                  rows={dataFlowSource?.[0] ? [dataFlowSource?.[0]] : []}
                  // rowId="vendorname"
                  hidePagination
                />
              </span>
            </Paper>

            <Typography className={`${classes.mt24} ${classes.bold}`}>
              Data Packages & Datasets
            </Typography>

            <Paper className={classes.mt12}>
              <span className="selected-study-table">
                <Table
                  columns={DfDetailsColumns}
                  rows={dataFlowSource || []}
                  rowId="employeeId"
                  hidePagination
                />
              </span>
            </Paper>
          </>
        )}
        <div className={`${classes.mt24} flex justify-between`}>
          {/* <Button onClick={goToPreviousStep}>Previous</Button> */}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" onClick={goToNextStep}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default Step3;
