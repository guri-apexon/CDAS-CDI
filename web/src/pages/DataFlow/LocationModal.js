/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { reduxForm, submit, getFormValues } from "redux-form";
import { useDispatch, connect, useSelector } from "react-redux";
import compose from "@hypnosphi/recompose/compose";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import MenuItem from "apollo-react/components/MenuItem";
import Button from "apollo-react/components/Button";
import { locationTypes, dataStruct } from "../../utils";

import {
  ReduxFormPasswordInput,
  ReduxFormSelect,
  ReduxFormSwitch,
  ReduxFormTextField,
} from "../../components/FormComponents/FormComponents";

import { locationModalValidate } from "../../components/FormComponents/validation";
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
  const [isActive, setIsActive] = React.useState(false);
  return (
    <form onSubmit={props.handleSubmit}>
      <div className={classes.section}>
        <Grid container spacing={2}>
          <Grid item md={8}>
            <ReduxFormTextField
              fullWidth
              name="locationName"
              label="Location Name"
            />
          </Grid>
          <Grid item md={4} className={classes.rightPan}>
            <ReduxFormSwitch
              label="Active"
              name="active"
              className="activeField"
              size="small"
              labelPlacement="start"
              value={isActive}
              checked={isActive}
              onChange={(e, checked) => setIsActive(checked)}
            />
          </Grid>
          <Grid item md={5}>
            <ReduxFormSelect
              name="locationType"
              label="Location Type"
              fullWidth
            >
              {locationTypes?.map((type) => (
                <MenuItem key={type.value} value={type}>
                  {type}
                </MenuItem>
              ))}
            </ReduxFormSelect>
          </Grid>
          <Grid item md={5}>
            <ReduxFormTextField
              fullWidth
              name="ipServer"
              label="IP Server or DB Host Name"
            />
          </Grid>
          <Grid item md={5}>
            <ReduxFormSelect
              name="dataStructure"
              label="Data Structure"
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
            <ReduxFormTextField
              fullWidth
              name="externalSytemName"
              label="External System Name"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={5}>
            <ReduxFormTextField
              fullWidth
              name="userName"
              label="Username (optional)"
            />
          </Grid>
          <Grid item md={5}>
            <ReduxFormPasswordInput
              fullWidth
              name="password"
              label="Password (optional)"
            />
          </Grid>
          <Grid item md={2} style={{ paddingTop: 54 }}>
            <Button variant="secondary" size="small">
              Test Connection
            </Button>
          </Grid>
        </Grid>
        <ReduxFormTextField
          fullWidth
          name="connURL"
          label="Connection URL/IP Server/Database"
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
      console.log(props);
      // eslint-disable-next-line no-console
      props.modalLocationType(values?.locationType);
      dispatch(saveLocationData(values));
    }, 400);
  };
  useEffect(() => {
    props.handleModalClose();
  }, [createTriggered]);
  return (
    <Modal
      open={props.locationModalOpen}
      onClose={() => props.handleModalClose()}
      title="Creating New Location"
      message={<ReduxForm onSubmit={onSubmit} />}
      className={classes.modal}
      buttonProps={[
        {},
        { label: "Save", onClick: () => dispatch(submit("AddLocationForm")) },
      ]}
      id="locationModal"
    />
  );
};

const ReduxForm = compose(
  reduxForm({
    form: "AddLocationForm",
    validate: locationModalValidate,
  }),
  connect((state) => ({
    initialValues: state.dataFlow,
    values: getFormValues("AddLocationForm")(state),
    saveLocationData,
  }))
)(LocationForm);

export default LocationModal;
