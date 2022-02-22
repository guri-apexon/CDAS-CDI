/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
// import { reduxForm, submit, getFormValues } from "redux-form";
import { useDispatch, connect, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
// import compose from "@hypnosphi/recompose/compose";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import Tooltip from "apollo-react/components/Tooltip";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Search from "apollo-react/components/Search";
// import Autocomplete from "apollo-react/components/Autocomplete";
import Accordion from "apollo-react/components/Accordion";
import AccordionDetails from "apollo-react/components/AccordionDetails";
import AccordionSummary from "apollo-react/components/AccordionSummary";
import OpenNew from "apollo-react-icons/OpenNew";
import Pencil from "apollo-react-icons/Pencil";
import IconButton from "apollo-react/components/IconButton";
import Table from "apollo-react/components/Table";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Box from "apollo-react/components/Box";
import { debounceFunction } from "../../../utils";
import Highlighted from "../../../components/Common/Highlighted";
import searchStudy, {
  searchDataflows,
  fetchDataFlowSource,
  getDataFlowDetails,
  dataflowSave,
} from "../../../services/ApiServices";
import "./index.scss";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 5,
  },
  modal: {
    minWidth: "775px",
    minHeight: "70%",
  },
  rightPan: {
    paddingTop: "60px !important",
    paddingLeft: "21px !important",
  },
  searchBar: {
    margin: "20px",
    marginTop: "5px",
    width: "calc(100% - 40px)",
  },
  panelSubtitle: {
    padding: "0px 24px 0px 24px",
    lineHeight: "24px",
    fontSize: "14px",
  },
  cloneDFdetailscontainer: {
    display: "flex",
  },
};
const useStyles = makeStyles(styles);

const CloneDataFlow = ({
  open,
  handleModalClose,
  handleSelect,
  handleBack,
  selectedStudy,
  dataflowList,
  studyList,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isActive, setIsActive] = useState(false);
  const [searchTxt, setSearchTxt] = useState("");
  const [studies, setStudies] = useState([]);
  const [datflows, setDatflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataFlowSource, setDataFlowSource] = useState([]);
  //   const studies = useSelector((state) => state.dashboard);
  const onSubmit = (values) => {
    // setTimeout(() => {
    //   console.log(props);
    // eslint-disable-next-line no-console
    //   props.modalLocationType(values?.locationType);
    //   dispatch(saveLocationData(values));
    // }, 400);
  };

  //   useEffect(() => {
  //     // props.handleModalClose();
  //     fetchStudies();
  //   }, []);

  const searchTrigger = (e, el) => {
    const newValue = e.target.value;
    setSearchTxt(newValue);
    if (newValue !== "") {
      if (el === "study") {
        debounceFunction(async () => {
          setLoading(true);
          const newStudies = await searchStudy(newValue);
          console.log("event", newValue, newStudies);
          setStudies(newStudies.studies ? newStudies.studies : []);
          setLoading(false);
        }, 1000);
      } else {
        debounceFunction(async () => {
          setLoading(true);
          const newDataflows = await searchDataflows(
            newValue,
            selectedStudy.study.prot_id
          );
          console.log("event", newValue, newDataflows);
          setDatflows(newDataflows.dataflows ? newDataflows.dataflows : []);
          setLoading(false);
        }, 1000);
      }
    }
  };

  const setDetail = async (study) => {
    console.log(study);
    await handleSelect(study);
    await setSearchTxt("");
    await setStudies([]);
    await setDatflows([]);
  };

  const FormatCell = ({ row, column: { accessor } }) => {
    const greyedOut = ["In Progress", "Success"].includes(row.ob_stat);
    console.log("row[accessor]", accessor);
    const innerEl = <Highlighted text={row[accessor]} highlight={searchTxt} />;
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className={`result-row ${greyedOut ? "greyedout" : ""}`}
        onClick={() => !greyedOut && setDetail(row)}
        role="menu"
        tabIndex={0}
      >
        {accessor === "prot_nbr" && greyedOut ? (
          <Tooltip
            variant="dark"
            title="This study has been imported into CDAS"
            placement="top"
          >
            <span>{innerEl}</span>
          </Tooltip>
        ) : (
          innerEl
        )}
      </div>
    );
  };

  const columns = [
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

  const ModalComponent = () => {
    console.log(loading, "loading");
    return (
      <div>
        <>
          <Typography variant="caption">Search for a study</Typography>
          <Search
            // onKeyDown={searchTrigger}
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
            <Table
              columns={columns}
              rows={studies}
              rowId="prot_id"
              hidePagination
              maxHeight="40vh"
              emptyProps={{
                text: searchTxt === "" && !loading ? "" : "No data to display",
              }}
            />
          )}
        </>

        {/* <Button variant="secondary" size="small">
          Cancel
        </Button>
        <Button variant="secondary" size="small">
          Back
        </Button> */}
      </div>
    );
  };

  const ActionCell = ({ row }) => {
    return (
      <div style={{ width: 68 }}>
        <IconButton
          size="small"
          data-id={row.employeeId}
          style={{ marginRight: 4 }}
        >
          <Pencil />
        </IconButton>
        <IconButton size="small" data-id={row.employeeId}>
          <OpenNew />
        </IconButton>
      </div>
    );
  };

  const rows = [
    {
      employeeId: 8473,
      name: "Bob Henderson",
      dept: "Human Resources",
      email: "bhenderson@abc-corp.com",
      employmentStatus: "Full-time",
      //   hireDate: "10/12/2016",
    },
    {
      employeeId: 4856,
      name: "Lakshmi Patel",
      dept: "Marketing",
      email: "lpatel@abc-corp.com",
      employmentStatus: "Full-time",
      //   hireDate: "09/04/2016",
    },
    {
      employeeId: 2562,
      name: "Cathy Simoyan",
      dept: "Engineering",
      email: "csimoyan@abc-corp.com",
      employmentStatus: "Contractor",
      //   hireDate: "05/25/2014",
    },
    {
      employeeId: 2563,
      name: "Mike Zhang",
      dept: "Engineering",
      email: "mzhang@abc-corp.com",
      employmentStatus: "Full-time",
      //   hireDate: "02/04/2015",
    },
    {
      employeeId: 1945,
      name: "Kai Vongvilay",
      dept: "Human Resources",
      email: "kvongvilay@abc-corp.com",
      employmentStatus: "Full-time",
      //   hireDate: "10/14/2016",
    },
    {
      employeeId: 2518,
      name: "Dennis Smith",
      dept: "Engineering",
      email: "dsmith@abc-corp.com",
      employmentStatus: "Contractor",
      //   hireDate: "12/03/2015",
    },
    {
      employeeId: 7455,
      name: "Dennis Reynolds",
      dept: "Design",
      email: "dreynolds@abc-corp.com",
      employmentStatus: "Full-time",
      //   hireDate: "02/05/2015",
    },
  ];

  const RenderDataFlowDetails = () => {
    if (dataFlowSource.length > 0) {
      const {
        name,
        type,
        externalsystemname,
        testflag,
        description,
        locationType,
        vendorName,
      } = dataFlowSource[0];
      const DfDetailsColumns = [
        {
          header: "Datapackage Name",
          accessor: "datapackagename",
          width: "34%",
        },
        {
          header: "Dataset Name",
          accessor: "datasetname",
          width: "41%",
        },
      ];
      return (
        <>
          <Button
            className="back-btn"
            variant="text"
            size="small"
            onClick={handleBack}
          >
            <ChevronLeft style={{ width: 12, marginRight: 5 }} width={10} />
            Back to search
          </Button>
          <div>
            <Typography variant="caption">Verify data flow to clone</Typography>
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography>Data Flow Detials</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  spacing={1}
                  style={{
                    padding: "12px 5px 24px 5px",
                    backgroundColor: "#f8f9fb",
                  }}
                >
                  <Grid item xs={12}>
                    <div>
                      <Typography variant="caption">Data Flow Name</Typography>
                      <div>
                        <Typography variant="body2" className="value">
                          {name}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div>
                      <Typography variant="caption">Vendor Source</Typography>
                      <div>
                        <Typography variant="body2" className="value">
                          {vendorName}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div>
                      <Typography variant="caption">Description</Typography>
                      <div>
                        <Typography variant="body2" className="value">
                          {description}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.cloneDFdetailscontainer}>
                      <Grid item xs={3}>
                        <Typography variant="caption">Type</Typography>
                        <div>
                          <Typography variant="body2" className="value">
                            {testflag === 0 ? "Production" : "Test"}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption">
                          External Source System
                        </Typography>
                        <div>
                          <Typography variant="body2" className="value">
                            {externalsystemname}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption">Location Type</Typography>
                        <div>
                          <Typography variant="body2" className="value">
                            {locationType}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption">Adapter</Typography>
                        <div>
                          <Typography variant="body2" className="value">
                            {type}
                          </Typography>
                        </div>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography>Data Packages & Datasets</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid item xs={12}>
                  <Table
                    columns={DfDetailsColumns}
                    rows={dataFlowSource}
                    rowId="employeeId"
                    hidePagination
                  />
                </Grid>
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      );
    }
    return null;
  };

  const handleDataFlowSelect = async (row) => {
    const data = await fetchDataFlowSource(row.dataflowid);
    await setDataFlowSource(data);
    await setDetail(row);
  };

  const DfFormatCell = ({ row, column: { accessor } }) => {
    console.log("row[accessor]", row, accessor);
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

  const RenderSelectDataFlowModal = () => {
    console.log(selectedStudy.study);
    const Columns = [
      {
        header: "Protocol Number",
        accessor: "protocolnumber",
        width: "34%",
      },
      {
        header: "Sponsor",
        accessor: "sponsorname",
        width: "41%",
      },
      {
        header: "Project Code",
        accessor: "projectcode",
        width: "25%",
      },
    ];

    const dfcolumns = [
      {
        header: "Data Flow Name",
        accessor: "name",
        width: "34%",
        customCell: DfFormatCell,
      },
      {
        header: "Vendor Source",
        accessor: "vend_nm",
        width: "41%",
        customCell: DfFormatCell,
      },
      {
        header: "Description",
        accessor: "description",
        width: "25%",
        customCell: DfFormatCell,
      },
      {
        header: "External Source System",
        accessor: "externalsystemname",
        width: "25%",
        customCell: DfFormatCell,
      },
    ];
    console.log(loading, "loading");
    return (
      <>
        {selectedStudy.dataflow ? (
          <RenderDataFlowDetails />
        ) : (
          <>
            <Grid item xs={12}>
              <span className="selected-study-table">
                <Table
                  columns={Columns}
                  rows={[selectedStudy.study]}
                  rowId="prot_id"
                  hidePagination
                />
              </span>
            </Grid>
            <Typography variant="caption">Search for a Data Flow</Typography>

            <Search
              placeholder="Search"
              value={searchTxt}
              onChange={(e) => searchTrigger(e, "dataflow")}
              fullWidth
            />
            {loading ? (
              <Box display="flex" className="loader-container">
                <ApolloProgress />
              </Box>
            ) : (
              <Table
                columns={dfcolumns}
                rows={datflows}
                rowId="dataflowid"
                hidePagination
                maxHeight="40vh"
                emptyProps={{
                  text:
                    searchTxt === "" && !loading ? "" : "No data to display",
                }}
              />
            )}
          </>
        )}
      </>
    );
  };

  const handleClone = async () => {
    try {
      const res = await getDataFlowDetails(selectedStudy.dataflow.dataflowid);
      console.log(res, "data");
      res.externalSystemName = "CDI";
      const data = await dataflowSave(res);
      history.push(`/dashboard/dataflow-management/${data.dataflowId}`);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(selectedStudy, "selectedStudyselectedStudy");

  return (
    <>
      {selectedStudy.study ? (
        <>
          <Modal
            open={open}
            onClose={() => handleModalClose()}
            title="Select Data Flow from Study"
            message={<RenderSelectDataFlowModal onSubmit={onSubmit} />}
            className={classes.modal}
            buttonProps={[
              {},
              {
                label:
                  selectedStudy.dataflow && selectedStudy.study
                    ? "Clone & Edit"
                    : "Back",
                onClick: () =>
                  selectedStudy.dataflow && selectedStudy.study
                    ? handleClone()
                    : handleBack(),
              },
            ]}
            id="dataflowModal"
          />
        </>
      ) : (
        <Modal
          open={open}
          onClose={() => handleModalClose()}
          title="Select a study to Clone Data Flow from"
          message={<ModalComponent onSubmit={onSubmit} />}
          className={classes.modal}
          buttonProps={[{}, { label: "Back", onClick: () => handleBack() }]}
          id="studymodal"
        />
      )}
    </>
  );
};

export default CloneDataFlow;
