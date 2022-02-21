/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { reduxForm, submit, change, formValueSelector } from "redux-form";
import { useDispatch, connect, useSelector } from "react-redux";
import compose from "@hypnosphi/recompose/compose";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import MenuItem from "apollo-react/components/MenuItem";
import Button from "apollo-react/components/Button";
import Tag from "apollo-react/components/Tag";
import {
  locationTypes,
  dataStruct,
  extSysName,
  generateConnectionURL,
} from "../../utils";

import {
  ReduxFormSelect,
  ReduxFormSwitch,
  ReduxFormTextField,
} from "../FormComponents/FormComponents";

import { locationModalValidate } from "../FormComponents/validation";
import { saveLocationData } from "../../store/actions/DataFlowAction";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 5,
  },
  modal: {
    minWidth: "775px",
  },
  rightPan: {
    paddingTop: "60px !important",
    paddingLeft: "21px !important",
  },
};
const useStyles = makeStyles(styles);

const LocationForm = (props) => {
  const classes = useStyles();
  const { locType, selectedHost, selectedPort, selectedDB } = props;
  const genConnectionURL = () => {
    const connurl = generateConnectionURL(
      locType,
      selectedHost,
      selectedPort,
      selectedDB
    );
    if (connurl) {
      props.generateUrl(connurl);
    }
  };
  return (
    <form onSubmit={props.handleSubmit}>
      <div className={classes.section}>
        <Grid container spacing={2}>
          <Grid item md={8}>
            <ReduxFormTextField
              fullWidth
              InputProps={{ readOnly: props.locationViewMode }}
              name="locationName"
              label="Location Name (Alias)"
            />
          </Grid>
          {!props.locationViewMode && (
            <Grid item md={4} className={classes.rightPan}>
              <ReduxFormSwitch
                label="Active"
                name="active"
                className="activeField MuiSwitch"
                size="small"
                labelPlacement="start"
              />
            </Grid>
          )}
          <Grid item md={5}>
            <ReduxFormSelect
              name="externalSytemName"
              label="External System Name"
              InputProps={{ readOnly: props.locationViewMode }}
              className={props.locationViewMode ? "readOnly_Dropdown" : ""}
              fullWidth
            >
              {extSysName?.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </ReduxFormSelect>
          </Grid>
          <Grid item md={5}>
            <ReduxFormSelect
              name="dataStructure"
              label="Data Structure"
              InputProps={{ readOnly: props.locationViewMode }}
              className={props.locationViewMode ? "readOnly_Dropdown" : ""}
              fullWidth
            >
              {dataStruct?.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </ReduxFormSelect>
          </Grid>
          <Grid item md={5}>
            <ReduxFormSelect
              name="locationType"
              label="Location Type"
              InputProps={{ readOnly: props.locationViewMode }}
              onChange={() => genConnectionURL()}
              className={props.locationViewMode ? "readOnly_Dropdown" : ""}
              fullWidth
            >
              {locationTypes?.map((type) => (
                <MenuItem key={type.value} value={type}>
                  {type}
                </MenuItem>
              ))}
            </ReduxFormSelect>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={5}>
            <ReduxFormTextField
              fullWidth
              name="ipServer"
              label={
                locType === "SFTP" || locType === "FTPS"
                  ? "IP Server"
                  : "Database Host Name"
              }
              onBlur={() => genConnectionURL()}
              InputProps={{ readOnly: props.locationViewMode }}
            />
          </Grid>
        </Grid>
        {locType !== "SFTP" && locType !== "FTPS" && (
          <>
            <Grid container spacing={2}>
              <Grid item md={5}>
                <ReduxFormTextField
                  fullWidth
                  name="port"
                  label="Port"
                  onBlur={() => genConnectionURL()}
                  InputProps={{ readOnly: props.locationViewMode }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item md={5}>
                <ReduxFormTextField
                  fullWidth
                  name="dbName"
                  label="Database Name"
                  onBlur={() => genConnectionURL()}
                  InputProps={{ readOnly: props.locationViewMode }}
                />
              </Grid>
            </Grid>
          </>
        )}
        <Grid container spacing={2}>
          <Grid item md={5}>
            <ReduxFormTextField
              fullWidth
              name="userName"
              label="Username (optional)"
              InputProps={{ readOnly: props.locationViewMode }}
            />
          </Grid>
          <Grid item md={5}>
            <ReduxFormTextField
              type="password"
              fullWidth
              name="password"
              label="Password (optional)"
              InputProps={{ readOnly: props.locationViewMode }}
            />
          </Grid>
          {!props.locationViewMode && (
            <Grid item md={2} style={{ paddingTop: 54 }}>
              <Button variant="secondary" size="small">
                Test Connection
              </Button>
            </Grid>
          )}
        </Grid>
        <ReduxFormTextField
          fullWidth
          name="connURL"
          label="Connection URL"
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
    </form>
  );
};

const LocationModal = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const dataFlowData = useSelector((state) => state.dataFlow);
  const { createTriggered } = dataFlowData;
  const onSubmit = (values) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      if (props.modalLocationType) {
        props.modalLocationType(values?.locationType);
      }
      dispatch(saveLocationData(values));
    }, 400);
  };
  useEffect(() => {
    props.handleModalClose();
  }, [createTriggered]);
  if (!props.locationEditMode && !props.locationViewMode) {
    dispatch(change("AddLocationForm", "active", true));
    dispatch(change("AddLocationForm", "dataStructure", "tabular"));
    dispatch(change("AddLocationForm", "locationType", "SFTP"));
  }
  const generateUrl = (v) => {
    if (v) {
      dispatch(change("AddLocationForm", "connURL", v));
    }
  };
  return (
    <Modal
      open={props.locationModalOpen}
      onClose={() => props.handleModalClose()}
      title={
        // eslint-disable-next-line no-nested-ternary
        props.locationViewMode ? (
          <div>
            {" "}
            Location
            <Tag
              label={props.selectedLoc?.active === 1 ? "Active" : "Inactive"}
              style={{ marginLeft: 30 }}
              variant={props.selectedLoc?.active === 1 ? "green" : "gray"}
            />
          </div>
        ) : props.locationEditMode ? (
          "Edit Location"
        ) : (
          "Creating New Location"
        )
      }
      message={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <ReduxForm
          onSubmit={onSubmit}
          locationViewMode={props.locationViewMode}
          locationEditMode={props.locationEditMode}
          generateUrl={(v) => generateUrl(v)}
        />
      }
      className={classes.modal}
      buttonProps={[
        { label: props.locationViewMode ? "" : "Cancel" },
        {
          label: props.locationViewMode ? "OK" : "Save",
          onClick: () =>
            props.locationViewMode
              ? props.changeLocationEditMode(true)
              : dispatch(submit("AddLocationForm")),
        },
      ]}
      id="locationModal"
    />
  );
};

const form = compose(
  reduxForm({
    form: "AddLocationForm",
    validate: locationModalValidate,
    enableReinitialize: true,
  })
)(LocationForm);

const selector = formValueSelector("AddLocationForm");
const ReduxForm = connect((state) => ({
  enableReinitialize: true,
  selectedHost: selector(state, "ipServer"),
  selectedPort: selector(state, "port"),
  selectedDB: selector(state, "dbName"),
  locType: selector(state, "locationType"),
  saveLocationData,
}))(form);

export default LocationModal;
