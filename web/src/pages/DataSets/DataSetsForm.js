/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect } from "react-redux";
import { reduxForm, getFormValues } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import Divider from "apollo-react/components/Divider";
import FixedBar from "apollo-react/components/FixedBar";
import Status from "apollo-react/components/Status";
import Radio from "apollo-react/components/Radio";
import RadioError from "apollo-react-icons/RadioError";
import Typography from "apollo-react/components/Typography";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import {
  ReduxFormAutocomplete,
  ReduxFormRadioGroup,
  ReduxFormSwitch,
  ReduxFormSelect,
  ReduxFormTextField,
} from "../../components/FormComponents/FormComponents";
import validate from "../../components/FormComponents/validation";

import { fileTypes, delimeters } from "../../utils";

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

const DataSetsFormBase = (props) => {
  const { handleSubmit, classes, datakind } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper} style={{ paddingTop: 0 }}>
        <div className={classes.section}>
          <FixedBar
            title="Dataset Settings"
            style={{ padding: 0, border: "none" }}
          >
            <ReduxFormSwitch
              label="Dataset Active"
              name="active"
              className="MuiSwitch"
              size="small"
              labelPlacement="start"
            />
            <Status
              variant="positive"
              icon={RadioError}
              size="small"
              style={{ marginLeft: 35 }}
              label={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Typography variant="body2" style={{ color: "#595959" }}>
                  Ready
                </Typography>
              }
            />
          </FixedBar>
          <Grid container spacing={3}>
            <Grid item md={5}>
              <ReduxFormTextField
                fullWidth
                maxLength="30"
                name="datasetName"
                inputProps={{ maxLength: 30 }}
                label="Data Set Name (Mnemonic)"
              />
              <ReduxFormSelect
                name="fileType"
                id="fileType"
                label="File Type"
                fullWidth
              >
                {fileTypes?.map((type) => (
                  <MenuItem value={type}>{type}</MenuItem>
                ))}
              </ReduxFormSelect>
              <ReduxFormRadioGroup
                name="encoding"
                id="encoding"
                label="Encoding"
                row
              >
                <Radio value="WLATIN1" label="WLATIN1" />
                <Radio value="UTF-8" label="UTF-8" />
              </ReduxFormRadioGroup>
              <ReduxFormSelect
                name="delimiter"
                id="delimiter"
                label="Delimiter"
                fullWidth
              >
                {delimeters?.map((type) => (
                  <MenuItem value={type}>{type}</MenuItem>
                ))}
              </ReduxFormSelect>
              <ReduxFormTextField
                fullWidth
                name="escapeCharacter"
                id="escapeCharacter"
                inputProps={{ maxLength: 255 }}
                label="Escape Character"
              />
              <ReduxFormTextField
                fullWidth
                name="quote"
                id="quote"
                inputProps={{ maxLength: 255 }}
                label="Quote"
              />
              <ReduxFormTextField
                fullWidth
                name="headerRowNumber"
                id="headerRowNumber"
                inputProps={{ maxLength: 255 }}
                label="Header Row Number"
              />
              <ReduxFormTextField
                fullWidth
                name="footerRowNumber"
                id="footerRowNumber"
                inputProps={{ maxLength: 255 }}
                label="Footer Row Number"
              />
              <ReduxFormTextField
                fullWidth
                name="fileNamingConvention"
                id="fileNamingConvention"
                inputProps={{ maxLength: 255 }}
                label="File Naming Convention"
              />
              <ReduxFormTextField
                fullWidth
                name="folderPath"
                id="folderPath"
                label="sFTP Folder Path"
              />
            </Grid>
            <Grid item md={1}>
              <Divider orientation="vertical" variant="middle" />
            </Grid>
            <Grid item md={6}>
              <ReduxFormAutocomplete
                name="clinicalDataType"
                id="clinicalDataType"
                label="Clinical Data Type"
                source={datakind}
                className="autocomplete_field"
                variant="search"
                singleSelect
                fullWidth
              />
              <ReduxFormTextField
                fullWidth
                name="transferFrequency"
                id="transferFrequency"
                inputProps={{ maxLength: 255 }}
                label="Transfer Frequency"
              />
              <ReduxFormTextField
                fullWidth
                name="overrideStaleAlert"
                id="overrideStaleAlert"
                inputProps={{ maxLength: 255 }}
                label="Override Stale Alert (days)"
              />
              <ReduxFormTextField
                fullWidth
                name="rowDecreaseAllowed"
                id="rowDecreaseAllowed"
                inputProps={{ maxLength: 255 }}
                label="Row Decrease % Allowed"
              />
            </Grid>
          </Grid>
        </div>
      </Paper>
    </form>
  );
};

const ReduxForm = compose(
  withStyles(styles),
  reduxForm({
    form: "DataSetsForm",
    validate,
  })
)(DataSetsFormBase);

const DataSetsForm = connect((state) => ({
  initialValues: state.dataSets, // pull initial values from account reducer
  values: getFormValues("DataSetsForm")(state),
  datakind: state.dataSets.datakind?.records,
}))(ReduxForm);

export default DataSetsForm;
