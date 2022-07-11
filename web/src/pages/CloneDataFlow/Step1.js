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

import searchStudy from "../../services/ApiServices";
import Highlighted from "../../components/Common/Highlighted";

import { debounceFunction } from "../../utils";

const Step1 = ({
  classes,
  setSelectedStudy,
  goToPreviousStep,
  goToNextStep,
  handleCancel,
  nextDisabled,
  breadcrumbItems,
  goToDashboard,
}) => {
  const [searchTxt, setSearchTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState([]);

  const searchTrigger = useCallback(
    (e, el) => {
      const newValue = e.target.value;
      setSearchTxt(newValue);
      if (newValue !== "") {
        if (el === "study") {
          debounceFunction(async () => {
            setLoading(true);
            const newStudies = await searchStudy(newValue);
            setStudies(newStudies?.studies ? newStudies.studies : []);
            setLoading(false);
          }, 1000);
        }
      }
    },
    [searchTxt]
  );

  const setStudyDetails = async (study) => {
    // setLoadingTableData(true);
    await setSelectedStudy(study, 1);
    // await setSearchTxt("");
    // await setStudies([]);
    // await setDatflows([]);
    // setLoadingTableData(false);
  };

  const FormatCell = ({ row, column: { accessor } }) => {
    if (!row[accessor]) {
      return false;
    }
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className="result-row"
        onClick={() => setStudyDetails(row)}
        role="menu"
        tabIndex={0}
      >
        <Highlighted text={row[accessor]} highlight={searchTxt} />
      </div>
    );
  };

  const studyColumns = [
    {
      header: "Protocol Number",
      accessor: "protocolnumber",
      customCell: FormatCell,
      width: "34%",
    },
    {
      header: "Sponsor",
      accessor: "sponsorname",
      customCell: FormatCell,
      width: "41%",
    },
    {
      header: "Project Code",
      accessor: "projectcode",
      customCell: FormatCell,
      width: "25%",
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
          Select a Study to Clone Data Flow from
        </Typography>
      </div>
      <Divider />
      <div className={classes.mainSection}>
        <Typography variant="caption">Search for a study</Typography>
        <Search
          // onKeyDown={searchTrigger}
          style={{ marginTop: "0px" }}
          placeholder="Search"
          value={searchTxt}
          onChange={(e) => searchTrigger(e, "study")}
          fullWidth
        />
        {loading ? (
          <Box display="flex" className="loader-container">
            <ApolloProgress />
          </Box>
        ) : (
          <Paper className={classes.mt24}>
            <div className="study-list-table scrollable-table">
              <Table
                columns={studyColumns}
                rows={studies}
                rowId="prot_id"
                hidePagination
                hasScroll
                maxHeight="40vh"
                emptyProps={{
                  text:
                    searchTxt === "" && !loading ? "" : "No data to display",
                }}
              />
            </div>
          </Paper>
        )}
        <div className={`${classes.mt24} flex justify-between`}>
          {/* <Button disabled onClick={goToPreviousStep}>
            Previous
          </Button> */}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            disabled={nextDisabled}
            onClick={goToNextStep}
            variant="primary"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default Step1;
