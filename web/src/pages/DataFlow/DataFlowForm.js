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
import Button from "apollo-react/components/Button";
import {
  ReduxFormAutocomplete,
  ReduxFormDatePickerV2,
  ReduxFormRadioGroup,
  ReduxFormSelect,
  ReduxFormTextField,
} from "../../components/FormComponents/FormComponents";
import validate from "../../components/FormComponents/validation";

const skills = [
  { name: "skills.javascript", label: "JavaScript" },
  { name: "skills.css", label: "CSS" },
  { name: "skills.reactJS", label: "React JS" },
  { name: "skills.reactNative", label: "React Native" },
  { name: "skills.nodeJS", label: "Node JS" },
  { name: "skills.dotNet", label: ".Net" },
  { name: "skills.java", label: "Java" },
  { name: "skills.python", label: "Python" },
  { name: "skills.rust", label: "Rust" },
  { name: "skills.sql", label: "SQL" },
  { name: "skills.mobile", label: "Mobile" },
  { name: "skills.salesforce", label: "Salesforce" },
];

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
  const { handleSubmit, submitting, classes } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper}>
        <div className={classes.section}>
          <Typography variant="title1">Flow Details</Typography>
          <ReduxFormAutocomplete
            name="vendor"
            label="Vendor"
            placeholder="Washington"
            source={skills}
            singleSelect
            fullWidth
          />
          <ReduxFormTextField
            fullWidth
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
                <MenuItem value="sftp">SFTP</MenuItem>
              </ReduxFormSelect>
              <ReduxFormAutocomplete
                name="locationName"
                label="Location Name"
                source={skills}
                singleSelect
                fullWidth
              />
            </Grid>
            <Grid item md={7}>
              <Paper className={classes.locationBox}>
                <Typography>Location</Typography>
                <Typography className={classes.formLabel}>Username</Typography>
                <Typography className={classes.formText}>
                  ANALYTICALLABSCDR
                </Typography>
                <Typography className={classes.formLabel}>Password</Typography>
                <Typography className={classes.formPass}>Password</Typography>
                <Typography className={classes.formLabel}>
                  Connection URL/IP Server/Database
                </Typography>
                <Typography className={classes.formText}>
                  {`sftp://secure-transfer-ftpsolutions.iqvia.com/home/curepharma/
d1234c12343/Current_Health/Device`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.section}>
          <Typography variant="title1">Others</Typography>
          <ReduxFormAutocomplete
            name="serviceOwner"
            label="Service Owners (Optional)"
            source={skills}
            multiple
            fullWidth
          />
        </div>
        <div className={classes.submit}>
          <Button variant="primary" type="submit" disabled={submitting}>
            Submit
          </Button>
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
}))(ReduxForm);

export default DataFlowForm;
