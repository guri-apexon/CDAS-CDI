/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { reduxForm, submit, getFormValues } from "redux-form";
import { useDispatch, connect, useSelector } from "react-redux";
import compose from "@hypnosphi/recompose/compose";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import MenuItem from "apollo-react/components/MenuItem";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Search from "apollo-react/components/Search";
import Autocomplete from "apollo-react/components/Autocomplete";
import Accordion from "apollo-react/components/Accordion";
import AccordionDetails from "apollo-react/components/AccordionDetails";
import AccordionSummary from "apollo-react/components/AccordionSummary";
import OpenNew from "apollo-react-icons/OpenNew";
import Pencil from "apollo-react-icons/Pencil";
import IconButton from "apollo-react/components/IconButton";
import Table from "apollo-react/components/Table";

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
  backbtn: {
    fontWeight: "bold",
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
  const [isActive, setIsActive] = useState(false);

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

  const ModalComponent = () => {
    return (
      <div>
        <Autocomplete
          name="study"
          label="Search for a study"
          source={studyList}
          id="study"
          className="autocomplete_field"
          onChange={(v) => handleSelect(v, "study")}
          singleSelect
          variant="search"
          fullWidth
        />
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

  const columns = [
    {
      header: "Data Package Name",
      accessor: "name",
    },
    {
      header: "Dataset Name",
      accessor: "dept",
    },
  ];

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

  const rows2 = [
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
    const backLabel = `< back to search`;
    return (
      <>
        <Button className={classes.backbtn} onClick={() => handleBack()}>
          {backLabel}
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
                      <Typography variant="caption">
                        {selectedStudy.dataflow[0]}
                      </Typography>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div>
                    <Typography variant="caption">Vendor Source</Typography>
                    <div>
                      <Typography variant="caption">Corante</Typography>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div>
                    <Typography variant="caption">Description</Typography>
                    <div>
                      <Typography variant="caption">
                        Clinical_laboratory
                      </Typography>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.cloneDFdetailscontainer}>
                    <Grid item xs={3}>
                      <Typography variant="caption">Type</Typography>
                      <div>
                        <Typography variant="caption">Corante</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption">
                        External Source System
                      </Typography>
                      <div>
                        <Typography variant="caption">Corante</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption">Location Type</Typography>
                      <div>
                        <Typography variant="caption">Corante</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption">Adapter</Typography>
                      <div>
                        <Typography variant="caption">Corante</Typography>
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
                  columns={columns}
                  rows={rows}
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

  const RenderSelectDataFlowModal = () => {
    return (
      <>
        {selectedStudy.dataflow ? (
          <RenderDataFlowDetails />
        ) : (
          <>
            <Typography variant="caption">{selectedStudy.study[0]}</Typography>
            <Grid item xs={12}>
              <Table
                columns={columns}
                rows={rows2}
                rowId="employeeId"
                hidePagination
              />
            </Grid>
            <Autocomplete
              name="dataflow"
              label="data flow"
              source={dataflowList}
              id="dataflow"
              className="autocomplete_field"
              onChange={(v) => handleSelect(v, "dataflow")}
              singleSelect
              variant="search"
              fullWidth
            />
          </>
        )}
      </>
    );
  };

  const handleClone = () => {};

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
