/* eslint-disable consistent-return */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  reduxForm,
  submit,
  change,
  formValueSelector,
  getFormValues,
} from "redux-form";
import { useDispatch, connect, useSelector } from "react-redux";
import compose from "@hypnosphi/recompose/compose";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import MenuItem from "apollo-react/components/MenuItem";
import Button from "apollo-react/components/Button";
import Banner from "apollo-react/components/Banner";
import Tag from "apollo-react/components/Tag";
import {
  locationTypes,
  dataStruct,
  extSysName,
  generateConnectionURL,
  generatedBName,
} from "../../utils";
import {
  ReduxFormSelect,
  ReduxFormSwitch,
  ReduxFormTextField,
} from "../FormComponents/FormComponents";

import { locationModalValidate } from "../FormComponents/validation";
import {
  saveLocationData,
  removeErrMessage,
} from "../../store/actions/CDIAdminAction";
import {
  checkLocationExistsInDataFlow,
  testConnectionFSR,
} from "../../services/ApiServices";
import { locationExistInDFMsg } from "../../constants";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 5,
  },
  modal: {
    minWidth: "775px",
    zIndex: "1350 !important",
  },
  rightPan: {
    paddingTop: "60px !important",
    paddingLeft: "21px !important",
  },
};
const useStyles = makeStyles(styles);

const LocationForm = (props) => {
  const classes = useStyles();
  const {
    locType,
    selectedHost,
    selectedPort,
    selectedDB,
    isActive,
    formState,
    loading,
  } = props;

  return (
    <form onSubmit={props.handleSubmit}>
      <div className={classes.section}>
        <Grid container spacing={2}>
          <Grid item md={8}>
            <ReduxFormTextField
              fullWidth
              InputProps={{ readOnly: props.locationViewMode }}
              name="locationName"
              size="small"
              label="Location Name (Alias)"
            />
          </Grid>
          {!props.locationViewMode && (
            <Grid item md={4} className={classes.rightPan}>
              <ReduxFormSwitch
                label="Active"
                name="active"
                // eslint-disable-next-line eqeqeq
                checked={isActive || isActive == 1}
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
              canDeselect={false}
              size="small"
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
              size="small"
              InputProps={{ readOnly: props.locationViewMode }}
              canDeselect={false}
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
              size="small"
              InputProps={{ readOnly: props.locationViewMode }}
              canDeselect={false}
              onChange={(v) =>
                props.generateUrl(
                  v.target.value,
                  selectedHost,
                  selectedPort,
                  selectedDB
                )
              }
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
              size="small"
              name="ipServer"
              label={
                locType === "SFTP" || locType === "FTPS"
                  ? "IP Server"
                  : "Database Host Name"
              }
              onChange={(v) =>
                props.generateUrl(
                  locType,
                  v.target.value,
                  selectedPort,
                  selectedDB
                )
              }
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
                  size="small"
                  name="port"
                  label="Port"
                  inputProps={{
                    maxLength: 5,
                    readOnly: props.locationViewMode,
                  }}
                  onChange={(v) =>
                    props.generateUrl(
                      locType,
                      selectedHost,
                      v.target.value,
                      selectedDB
                    )
                  }
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item md={5}>
                <ReduxFormTextField
                  fullWidth
                  name="dbName"
                  label="Database Name"
                  size="small"
                  onChange={(v) =>
                    props.generateUrl(
                      locType,
                      selectedHost,
                      selectedPort,
                      v.target.value
                    )
                  }
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
              size="small"
              label="Username"
              InputProps={{ readOnly: props.locationViewMode }}
            />
          </Grid>
          <Grid item md={5}>
            <ReduxFormTextField
              type="password"
              size="small"
              fullWidth
              name="password"
              label={
                <>
                  Password
                  {(locType === "SFTP" || locType === "FTPS") && (
                    <span style={{ color: "#999999" }}> (optional)</span>
                  )}
                </>
              }
              InputProps={{ readOnly: props.locationViewMode }}
            />
          </Grid>
          {!props.locationViewMode && (
            <Grid item md={2} style={{ paddingTop: 54 }}>
              <Button
                variant="secondary"
                size="small"
                disabled={loading}
                onClick={() => props.testConnection(formState)}
              >
                Test Connection
              </Button>
            </Grid>
          )}
        </Grid>
        <ReduxFormTextField
          fullWidth
          name="connURL"
          label="Connection URL"
          size="small"
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
  const locationForm = useRef();
  const selector = formValueSelector("AddLocationForm");
  const [connectionResponse, setConnectionResponse] = useState(null);
  const [loadingConn, setLoadingConn] = useState(false);
  const { error, success, createTriggered, locationPassword } = useSelector(
    (state) => state.cdiadmin
  );
  const [existErr, setExistErr] = useState("");
  const onSubmit = async (values) => {
    // eslint-disable-next-line no-console
    if (props.modalLocationType) {
      props.modalLocationType(values?.locationType);
    }
    if (values.locationID && values.active === false) {
      const checkInDf = await checkLocationExistsInDataFlow(values.locationID);
      if (checkInDf > 0) {
        setExistErr(locationExistInDFMsg);
        return null;
      }
    }
    setExistErr("");
    dispatch(saveLocationData(values));
    return null;
  };

  useEffect(() => {
    if (error || success || existErr) {
      setTimeout(() => {
        setExistErr("");
        dispatch(removeErrMessage());
      }, 5000);
    }
  }, [error, success, existErr]);
  useEffect(() => {
    props.handleModalClose();
  }, [createTriggered]);
  const handleBannerClose = () => {
    setExistErr("");
    dispatch(removeErrMessage());
  };
  if (!props.locationEditMode && !props.locationViewMode) {
    dispatch(change("AddLocationForm", "active", true));
    dispatch(change("AddLocationForm", "dataStructure", "tabular"));
    // dispatch(change("AddLocationForm", "locationType", "SFTP"));
  }
  const generateUrl = (locType, selectedHost, selectedPort, selectedDB) => {
    const connurl = generateConnectionURL(
      locType,
      selectedHost,
      selectedPort,
      selectedDB
    );
    if (connurl) {
      dispatch(change("AddLocationForm", "connURL", connurl));
    }
  };
  const showLocationMessage = (msg, type = "error") => {
    const modalObj = {
      text: msg,
      type,
    };
    setConnectionResponse(modalObj);
    setTimeout(() => {
      setConnectionResponse(null);
    }, 2500);
  };
  const testConnection = async (formState) => {
    const { userName, password, ipServer, port, locationType, dbName } =
      formState;
    if (userName === "" || password === "") {
      showLocationMessage("Please enter username and password to continue");
      return false;
    }
    let reqBody = {
      username: userName || "",
      password:
        password === "Yes" || typeof password === "object"
          ? locationPassword
          : password || "",
      host: ipServer || "",
      endPoint: "/checkconnection/sftp",
    };
    if (locationType) {
      if (locationType !== "SFTP" && locationType !== "FTPS") {
        reqBody = {
          ...reqBody,
          endPoint: "/checkconnection/jdbc",
          databaseName: dbName || "",
          userId: "",
          database: generatedBName(locationType),
          port: port ? port : "",
        };
      }
    }
    setLoadingConn(true);
    const result = await testConnectionFSR(reqBody);
    setLoadingConn(false);
    if (result.status === "OK") {
      showLocationMessage(
        result.message || "Operation Successfully",
        "success"
      );
    } else {
      showLocationMessage(result.message || "Something went wrong");
    }
  };
  return (
    <>
      {connectionResponse && (
        <Banner
          variant={connectionResponse.type}
          open={true}
          message={connectionResponse.text}
        />
      )}
      {(error || success || existErr) && (
        <Banner
          variant={success ? "success" : "error"}
          open={error || success || existErr}
          message={error || success || existErr}
          onClose={() => handleBannerClose()}
        />
      )}
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
            ref={locationForm}
            onSubmit={onSubmit}
            locationViewMode={props.locationViewMode}
            locationEditMode={props.locationEditMode}
            generateUrl={generateUrl}
            testConnection={testConnection}
            loading={loadingConn}
          />
        }
        className={classes.modal}
        buttonProps={[
          { label: "Cancel" },
          {
            label: props.locationViewMode ? "Edit" : "Save",
            onClick: () =>
              props.locationViewMode
                ? props.changeLocationEditMode(true)
                : dispatch(submit("AddLocationForm")),
          },
        ]}
        id="locationModal"
      />
    </>
  );
};

const selector = formValueSelector("AddLocationForm");
const ReduxForm = compose(
  reduxForm({
    form: "AddLocationForm",
    enableReinitialize: true,
    validate: locationModalValidate,
  }),
  connect((state) => ({
    isActive: selector(state, "active"),
    selectedHost: selector(state, "ipServer"),
    selectedPort: selector(state, "port"),
    selectedDB: selector(state, "dbName"),
    locType: selector(state, "locationType"),
    formState: getFormValues("AddLocationForm")(state),
  }))
)(LocationForm);

export default LocationModal;
