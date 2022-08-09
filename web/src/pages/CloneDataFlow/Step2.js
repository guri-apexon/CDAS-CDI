/* eslint-disable no-script-url */
import React, { useState, useCallback } from "react";

import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Divider from "apollo-react/components/Divider";
import Search from "apollo-react/components/Search";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Box from "apollo-react/components/Box";
import Table from "apollo-react/components/Table";
import Paper from "apollo-react/components/Paper";

import {
  searchDataflows,
  fetchDataFlowSource,
} from "../../services/ApiServices";
import Highlighted from "../../components/Common/Highlighted";

import { debounceFunction } from "../../utils";

const Step2 = ({
  classes,
  selectedStudy,
  setSelectedStudy,
  goToPreviousStep,
  setDataFlowSource,
  goToNextStep,
  nextDisabled,
  handleCancel,
  breadcrumbItems,
  goToDashboard,
}) => {
  const [searchTxt, setSearchTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const [datflows, setDatflows] = useState([]);

  const searchDataflow = useCallback(
    (e, el) => {
      e.preventDefault();
      const newValue = e.target.value;
      setSearchTxt(e.target.value);
      if (newValue !== "") {
        if (el === "dataflow") {
          debounceFunction(async () => {
            setLoading(true);
            const newDataflows = await searchDataflows(
              newValue,
              selectedStudy?.prot_id
            );
            setDatflows(newDataflows.dataflows ? newDataflows.dataflows : []);
            setLoading(false);
          }, 1000);
        }
      }
    },
    [searchTxt, selectedStudy]
  );

  const setStudyDetails = async (study) => {
    // setLoadingTableData(true);
    await setSelectedStudy(study, 2);
    // await setSearchTxt("");
    // await setStudies([]);
    // await setDatflows([]);
    // setLoadingTableData(false);
  };

  const handleDataFlowSelect = async (row) => {
    const data = await fetchDataFlowSource(row.dataflowid);
    await setDataFlowSource(data);
    await setStudyDetails({ ...selectedStudy, dataflow: row });
  };

  const FormatCell = ({ row, column: { accessor } }) => {
    if (row[accessor]) {
      const innerEl = (
        <Highlighted text={row[accessor]} highlight={searchTxt} />
      );
      return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          className="result-row"
          onClick={() => {
            handleDataFlowSelect(row);
          }}
          role="menu"
          tabIndex={0}
        >
          {innerEl}
        </div>
      );
    }
    return null;
  };

  const boldCell = ({ row, column: { accessor } }) => {
    return <span className={classes.bold}>{row[accessor]}</span>;
  };

  const selectedStudyColumns = [
    {
      header: "Protocol Number",
      accessor: "protocolnumber",
      width: "30%",
      customCell: boldCell,
    },
    {
      header: "Sponsor",
      accessor: "sponsorname",
      width: "45%",
      customCell: boldCell,
    },
    {
      header: "Project Code",
      accessor: "projectcode",
      width: "25%",
      customCell: boldCell,
    },
  ];

  const dataflowColumns = [
    {
      header: "Data Flow Name",
      accessor: "dataFlowName",
      width: "22%",
      customCell: FormatCell,
    },
    {
      header: "Vendor Source",
      accessor: "vendorSource",
      width: "21%",
      customCell: FormatCell,
    },
    {
      header: "Description",
      accessor: "description",
      width: "25%",
      customCell: FormatCell,
    },
    {
      header: "External Source System",
      accessor: "externalSourceSystem",
      width: "22%",
      customCell: FormatCell,
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
      </div>
      <Divider />
      <div className={classes.mainSection}>
        <div>
          <Typography className={classes.bold}>Study Information</Typography>
          <Paper className={classes.mt8}>
            <span className="selected-study-table">
              <Table
                columns={selectedStudyColumns}
                rows={[selectedStudy || {}]}
                rowId="prot_id"
                hidePagination
              />
            </span>
          </Paper>
        </div>
        <div className={classes.mt24}>
          <Typography className={classes.bold}>Data Flow</Typography>
          <Typography className={`flex ${classes.mt12}`} variant="caption">
            Search for a Data Flow
          </Typography>
          <Search
            className={`${classes.mt0} search-box`}
            placeholder="Search"
            value={searchTxt}
            onChange={(e) => searchDataflow(e, "dataflow")}
            fullWidth
          />
          {loading ? (
            <Box display="flex" className="loader-container">
              <ApolloProgress />
            </Box>
          ) : (
            <Paper className={`${classes.tableCursor} ${classes.mt24}`}>
              <Table
                columns={dataflowColumns}
                rows={datflows}
                rowId="dataflowid"
                hidePagination
                hasScroll
                maxHeight="40vh"
                emptyProps={{
                  text:
                    searchTxt === "" && !loading ? "" : "No data to display",
                }}
              />
            </Paper>
          )}
        </div>
        <div className={`${classes.mt24} flex justify-between`}>
          {/* <Button onClick={goToPreviousStep}>Previous</Button> */}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            disabled={nextDisabled}
            variant="primary"
            onClick={goToNextStep}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default Step2;
