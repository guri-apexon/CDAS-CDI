import React from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect } from "react-redux";
import { reduxForm, getFormValues } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import Radio from "apollo-react/components/Radio";
import Divider from "apollo-react/components/Divider";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import {
  ReduxFormAutocomplete,
  ReduxFormDatePickerV2,
  ReduxFormRadioGroup,
  ReduxFormSelect,
  ReduxFormAutocompleteV2,
  ReduxFormTextField,
} from "../../components/FormComponents/FormComponents";
import validate from "../../components/FormComponents/validation";

import { locationTypes } from "../../utils";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  submit: {
    margin: "16px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: 32,
  },
  subsection: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 24,
  },
  locationBox: {
    boxSizing: "border-box",
    border: "1px solid #E9E9E9",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    padding: "10px 15px",
  },
  formLabel: {
    color: "#444444",
    fontSize: 14,
    marginTop: "15px",
    letterSpacing: 0,
    lineHeight: "24px",
  },
  formText: {
    color: "#000000",
    fontSize: 14,
    marginTop: 8,
    marginLeft: 5,
    letterSpacing: 0,
    lineHeight: "24px",
  },
  formPass: {
    color: "#000000",
    fontSize: 30,
    marginTop: 8,
    marginLeft: 5,
    textSecurity: "disc",
    "-webkit-text-security": "disc",
    "-moz-text-security": "disc",
    letterSpacing: 5,
    lineHeight: "24px",
  },
};

const DataFlowFormBase = (props) => {
  const {
    handleSubmit,
    submitting,
    classes,
    locations,
    vendors,
    userName,
    password,
    changeLocationData,
    connLink,
  } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper}>
        <div className={classes.section}>
          <Typography variant="title1">Flow Details</Typography>
          <ReduxFormAutocomplete
            name="vendor"
            label="Vendor"
            source={vendors}
            singleSelect
            fullWidth
          />
          <ReduxFormTextField
            fullWidth
            maxlength="30"
            minHeight={35}
            name="description"
            label="Description"
            sizeAdjustable
          />
          <ReduxFormDatePickerV2
            name="firstFileDate"
            label="Expected First File Date"
          />
          <ReduxFormRadioGroup name="dataflowType" label="Data Flow Type">
            <Radio value="test" label="Test" />
            <Radio value="production" label="Production" />
          </ReduxFormRadioGroup>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.section}>
          <Typography variant="title1">Location Details</Typography>
          <Grid container spacing={2}>
            <Grid item md={5}>
              <ReduxFormSelect
                name="dataStructure"
                label="Data Structure"
                fullWidth
              >
                <MenuItem value="tabular">Tabular</MenuItem>
              </ReduxFormSelect>
              <ReduxFormSelect
                name="locationType"
                label="Location Type"
                fullWidth
              >
                {locationTypes?.map((type) => (
                  <MenuItem value={type}>{type}</MenuItem>
                ))}
              </ReduxFormSelect>
              <ReduxFormAutocomplete
                name="locationName"
                label="Location Name"
                source={locations}
                onChange={changeLocationData}
                singleSelect
                fullWidth
              />
            </Grid>
            <Grid item md={7}>
              <Paper className={classes.locationBox}>
                <Typography>Location</Typography>
                <Typography className={classes.formLabel}>Username</Typography>
                <Typography className={classes.formText}>{userName}</Typography>
                <Typography className={classes.formLabel}>Password</Typography>
                <Typography className={classes.formPass}>{password}</Typography>
                <Typography className={classes.formLabel}>
                  Connection URL/IP Server/Database
                </Typography>
                <Typography className={classes.formText}>{connLink}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.section}>
          <Typography variant="title1">Others</Typography>
          <ReduxFormAutocompleteV2
            name="serviceOwner"
            label="Service Owners (Optional)"
            source={[]}
            fullWidth
            chipColor="white"
            multiple
          />
        </div>
      </Paper>
    </form>
  );
};

const ReduxForm = compose(
  withStyles(styles),
  reduxForm({
    form: "DataFlowForm",
    validate,
  })
)(DataFlowFormBase);

const DataFlowForm = connect((state) => ({
  initialValues: state.dataFlow, // pull initial values from account reducer
  values: getFormValues("DataFlowForm")(state),
  locations: state.dataFlow.locations?.records,
  vendors: state.dataFlow.vendors?.records,
}))(ReduxForm);

export default DataFlowForm;
