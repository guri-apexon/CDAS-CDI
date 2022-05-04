/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext, useCallback } from "react";
// import { reduxForm, submit, getFormValues } from "redux-form";
import { useDispatch, connect, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
// import compose from "@hypnosphi/recompose/compose";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
// import Tooltip from "apollo-react/components/Tooltip";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Search from "apollo-react/components/Search";
// import Autocomplete from "apollo-react/components/Autocomplete";
import Accordion from "apollo-react/components/Accordion";
import AccordionDetails from "apollo-react/components/AccordionDetails";
import AccordionSummary from "apollo-react/components/AccordionSummary";
// import OpenNew from "apollo-react-icons/OpenNew";
// import Pencil from "apollo-react-icons/Pencil";
// import IconButton from "apollo-react/components/IconButton";
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
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { SelectedDataflow } from "../../../store/actions/DashboardAction";

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

const CloneDataFlow = ({ open, handleModalClose, dataflowList, studyList }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isActive, setIsActive] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [searchTxt, setSearchTxt] = useState("");
  const [dfReady, setDfReady] = useState("");
  const [studies, setStudies] = useState([]);
  const [datflows, setDatflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTableData, setLoadingTableData] = useState(false);
  const [dataFlowSource, setDataFlowSource] = useState([]);
  const messageContext = useContext(MessageContext);
  const { flowData } = useSelector((state) => state.dashboard);
  const onSubmit = (values) => {
    // setTimeout(() => {
    //   console.log(props);
    // eslint-disable-next-line no-console
    //   props.modalLocationType(values?.locationType);
    //   dispatch(saveLocationData(values));
    // }, 400);
  };

  const searchTrigger = useCallback(
    (e, el) => {
      const newValue = e.target.value;
      setSearchTxt(newValue);
      if (newValue !== "") {
        if (el === "study") {
          debounceFunction(async () => {
            setLoading(true);
            const newStudies = await searchStudy(newValue);
            setStudies(newStudies.studies ? newStudies.studies : []);
            setLoading(false);
          }, 1000);
        }
      }
    },
    [searchTxt]
  );

  const setStudyDetails = async (study) => {
    setLoadingTableData(true);
    await setSelectedStudy(study);
    await setSearchTxt("");
    await setStudies([]);
    await setDatflows([]);
    setLoadingTableData(false);
  };
  const handleBack = () => {
    setSelectedStudy(null);
    setSearchTxt("");
    setDfReady("");
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

  const RenderDataFlowDetails = () => {
    const backBtn = (
      <Button
        className="back-btn"
        variant="text"
        size="small"
        onClick={handleBack}
      >
        <ChevronLeft style={{ width: 12, marginRight: 5 }} width={10} />
        Back to search
      </Button>
    );
    useEffect(() => {
      console.log("dataFlowSource", dataFlowSource);
    }, [dataFlowSource]);
    if (!dataFlowSource?.length) {
      return (
        <>
          {backBtn}
          <br />
          <br />
          <Typography>No data available for this dataflow</Typography>
        </>
      );
    }
    const {
      name,
      type,
      externalsystemname,
      testflag,
      description,
      locationtype,
      vendorname,
    } = dataFlowSource[0];
    const DfDetailsColumns = [
      {
        header: "Datapackage Name",
        accessor: "datapackagename",
        width: "35%",
        customCell: ({ row, column: { accessor } }) => {
          return (
            <>{row[accessor] ? row[accessor] : "-----------------------"}</>
          );
        },
      },
      {
        header: "Dataset Name",
        accessor: "datasetname",
        width: "40%",
        customCell: ({ row, column: { accessor } }) => {
          return (
            <>{row[accessor] ? row[accessor] : "-----------------------"}</>
          );
        },
      },
    ];
    return (
      <>
        {backBtn}
        <div className="dataflow-details">
          <Typography className="clone-verify-title">
            Verify data flow to clone
          </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography>Data Flow Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
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
                        {vendorname}
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
                          {locationtype}
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
            <AccordionDetails className="table-ac-content">
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
  };

  const handleDataFlowSelect = async (row) => {
    const data = await fetchDataFlowSource(row.dataflowid);
    await setDataFlowSource(data);
    await setStudyDetails({ ...selectedStudy, dataflow: row });
  };

  const DfFormatCell = ({ row, column: { accessor } }) => {
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

  const RenderSelectDataFlowModal = React.memo(() => {
    const [dfSearchText, setDfSearchText] = useState(dfReady);
    const selectedStudyColumns = [
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

    const dataflowColumns = [
      {
        header: "Data Flow Name",
        accessor: "dataFlowName",
        width: "22%",
        customCell: DfFormatCell,
      },
      {
        header: "Vendor Source",
        accessor: "vendorSource",
        width: "21%",
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
        accessor: "externalSourceSystem",
        width: "22%",
        customCell: DfFormatCell,
      },
    ];

    const searchDataflow = useCallback(
      (e, el) => {
        e.preventDefault();
        const newValue = e.target.value;
        setDfSearchText(e.target.value);
        if (newValue !== "") {
          if (el === "dataflow") {
            debounceFunction(async () => {
              setDfReady(newValue);
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
      [dfSearchText]
    );

    useEffect(() => {
      console.log("RenderDataflowTable");
    }, []);

    return (
      <div id="selectDataFlowModal" className="scrollable-table">
        {selectedStudy.dataflow ? (
          <RenderDataFlowDetails />
        ) : (
          <>
            <Grid item xs={12}>
              <Typography variant="body2">Study Information</Typography>
              <span className="selected-study-table">
                <Table
                  columns={selectedStudyColumns}
                  rows={[selectedStudy]}
                  rowId="prot_id"
                  hidePagination
                />
              </span>
            </Grid>
            <Typography variant="caption">Search for a Data Flow</Typography>
            <Search
              className="search-box"
              placeholder="Search"
              value={dfSearchText}
              onChange={(e) => searchDataflow(e, "dataflow")}
              fullWidth
            />
            {loading ? (
              <Box display="flex" className="loader-container">
                <ApolloProgress />
              </Box>
            ) : (
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
            )}
          </>
        )}
      </div>
    );
  }, [dfReady]);

  // eslint-disable-next-line consistent-return
  const handleClone = async () => {
    try {
      setLoading(true);
      const res = await getDataFlowDetails(selectedStudy?.dataflow?.dataflowid);
      if (!res) {
        messageContext.showErrorMessage(`Something went wrong`);
        return false;
      }
      res.externalSystemName = "CDI";
      const { dataflowDetails } = await dataflowSave(res);
      setLoading(false);
      if (dataflowDetails) {
        dispatch(SelectedDataflow(dataflowDetails));
        messageContext.showSuccessMessage(
          `Selected Dataflow has been cloned to this study.`
        );
        history.push(
          `/dashboard/dataflow-management/${dataflowDetails?.dataFlowId}`
        );
      } else {
        messageContext.showErrorMessage(`Something wrong with clone`);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      messageContext.showErrorMessage(`Something went wrong`);
    }
  };

  useEffect(() => {
    return () => {
      setSelectedStudy(null);
    };
  }, []);

  return (
    <>
      {selectedStudy && (
        <>
          <Modal
            open={open}
            onClose={() => handleModalClose()}
            title="Select Dataflow from Study"
            className="custom-modal"
            buttonProps={[
              {
                size: "small",
                className: selectedStudy?.dataflow ? "" : "left-btn",
              },
              {
                size: "small",
                variant: selectedStudy?.dataflow ? "primary" : "secondary",
                disabled:
                  loading ||
                  (selectedStudy.dataflow && !dataFlowSource?.length),
                label: selectedStudy.dataflow ? "Clone & Edit" : "Back",
                onClick: () =>
                  selectedStudy.dataflow ? handleClone() : handleBack(),
              },
            ]}
            id="dataflowModal"
          >
            <RenderSelectDataFlowModal onSubmit={onSubmit} />
          </Modal>
        </>
      )}
      {!selectedStudy && (
        <Modal
          open={open}
          onClose={() => handleModalClose()}
          title="Select a Study to Clone Data Flow from"
          className={classes.modal}
          buttonProps={[
            { size: "small", className: "left-btn" },
            {
              variant: "secondary",
              label: "Back",
              size: "small",
              onClick: () => handleBack(),
            },
          ]}
          id="studymodal"
        >
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
          )}
        </Modal>
      )}
    </>
  );
};

export default CloneDataFlow;
