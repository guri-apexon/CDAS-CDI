/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect, useDispatch } from "react-redux";
import {
  reduxForm,
  getFormValues,
  formValueSelector,
  change,
} from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import FixedBar from "apollo-react/components/FixedBar";
import Radio from "apollo-react/components/Radio";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import {
  ReduxFormAutocomplete,
  ReduxFormRadioGroup,
  ReduxFormSwitch,
  ReduxFormSelect,
  ReduxFormTextField,
  ReduxFormPassword,
} from "../../../../components/FormComponents/FormComponents";
import dataSetsValidation, {
  passwordWarnings,
} from "../../../../components/FormComponents/DataSetsValidation";

import { fileTypes, delimeters, loadTypes } from "../../../../utils";

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
  const dispatch = useDispatch();
  const {
    handleSubmit,
    classes,
    datakind,
    formValues,
    defaultDelimiter,
    defaultEscapeCharacter,
    defaultQuote,
    defaultHeaderRowNumber,
    defaultFooterRowNumber,
    defaultLoadType,
    values,
  } = props;
  // const [selectedClinicalData, SetSelectedClinicalData] = useState([]);

  const setDefaultValues = (e) => {
    const fileValue = e.target.value;
    if (fileValue !== "Delimited") {
      dispatch(change("CreateDataSetsForm", "delimiter", defaultDelimiter));
      dispatch(
        change("CreateDataSetsForm", "escapeCharacter", defaultEscapeCharacter)
      );
      dispatch(change("CreateDataSetsForm", "quote", defaultQuote));
      dispatch(
        change("CreateDataSetsForm", "headerRowNumber", defaultHeaderRowNumber)
      );
      dispatch(
        change("CreateDataSetsForm", "footerRowNumber", defaultFooterRowNumber)
      );
      dispatch(change("CreateDataSetsForm", "loadType", defaultLoadType));
    }
  };
  const submitForm = () => {
    console.log("submitForm");
    // handleSubmit();
  };

  // useEffect(() => {
  //   console.log("values", values);
  //   if (values?.clinicalDataType) {
  //     const filteredDK = datakind?.filter(
  //       (e) => e.value === values.clinicalDataType[0]
  //     );
  //     if (filteredDK?.length) {
  //       SetSelectedClinicalData([]);
  //       setTimeout(() => {
  //         SetSelectedClinicalData([filteredDK[0].value]);
  //       });
  //       // change("CreateDataSetsForm", "clinicalDataType");
  //     }
  //   }
  //   if (!values) {
  //     SetSelectedClinicalData(["1"]);
  //   }
  // }, [values]);

  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper} style={{ paddingTop: 0 }}>
        <div className={classes.section}>
          <FixedBar
            title="Dataset Settings"
            style={{ paddingLeft: 0, border: "none" }}
          >
            <ReduxFormSwitch
              label="Dataset Active"
              name="active"
              className="MuiSwitch"
              size="small"
              labelPlacement="start"
            />
          </FixedBar>
          <Grid container spacing={3}>
            <Grid item md={5}>
              <ReduxFormTextField
                fullWidth
                maxLength="30"
                name="datasetName"
                size="small"
                inputProps={{ maxLength: 30 }}
                required
                label="Dataset Name (Mnemonic)"
              />
              <ReduxFormSelect
                name="fileType"
                id="fileType"
                label="File Type"
                size="small"
                onChange={setDefaultValues}
                fullWidth
                required
              >
                {fileTypes?.map((type) => (
                  <MenuItem value={type}>{type}</MenuItem>
                ))}
              </ReduxFormSelect>
              {formValues === "SAS" && (
                <ReduxFormRadioGroup
                  name="encoding"
                  id="encoding"
                  label="Encoding"
                  size="small"
                  row
                >
                  <Radio value="WLATIN1" label="WLATIN1" />
                  <Radio value="UTF-8" label="UTF-8" />
                </ReduxFormRadioGroup>
              )}
              {(formValues === "SAS" || formValues === "Delimited") && (
                <>
                  {formValues !== "SAS" && (
                    <ReduxFormSelect
                      name="delimiter"
                      id="delimiter"
                      label="Delimiter"
                      size="small"
                      disabled={formValues === "SAS"}
                      fullWidth
                    >
                      {delimeters?.map((type) => (
                        <MenuItem value={type}>{type}</MenuItem>
                      ))}
                    </ReduxFormSelect>
                  )}
                  {formValues !== "SAS" && (
                    <ReduxFormTextField
                      fullWidth
                      name="escapeCharacter"
                      id="escapeCharacter"
                      disabled={formValues === "SAS"}
                      inputProps={{ maxLength: 255 }}
                      size="small"
                      label="Escape Character"
                    />
                  )}
                  {formValues !== "SAS" && (
                    <ReduxFormTextField
                      fullWidth
                      name="quote"
                      id="quote"
                      disabled={formValues === "SAS"}
                      size="small"
                      inputProps={{ maxLength: 255 }}
                      label="Quote"
                    />
                  )}
                </>
              )}
              {formValues !== "SAS" && (
                <ReduxFormTextField
                  fullWidth
                  name="headerRowNumber"
                  id="headerRowNumber"
                  disabled={formValues === "SAS"}
                  inputProps={{ maxLength: 255 }}
                  size="small"
                  label="Header Row Number"
                />
              )}
              {formValues !== "SAS" && (
                <ReduxFormTextField
                  fullWidth
                  name="footerRowNumber"
                  id="footerRowNumber"
                  disabled={formValues === "SAS"}
                  inputProps={{ maxLength: 255 }}
                  size="small"
                  label="Footer Row Number"
                />
              )}
              <ReduxFormTextField
                fullWidth
                name="fileNamingConvention"
                id="fileNamingConvention"
                inputProps={{ maxLength: 255 }}
                size="small"
                label="File Naming Convention"
              />
              <ReduxFormTextField
                fullWidth
                name="path"
                id="path"
                size="small"
                label="sFTP Folder Path"
              />
            </Grid>
            <Grid item md={1}>
              <div className="vertical-line">
                <div />
              </div>
            </Grid>
            <Grid item md={6}>
              <ReduxFormAutocomplete
                name="clinicalDataType"
                autoSelect
                id="clinicalDataType"
                label="Clinical Data Type"
                source={datakind}
                className="smallSize_autocomplete"
                variant="search"
                singleSelect
                fullWidth
                required
              />
              {formValues === "Excel" && (
                <ReduxFormPassword
                  name="filePwd"
                  size="small"
                  type="password"
                  label="File Password"
                />
              )}
              <ReduxFormTextField
                fullWidth
                name="transferFrequency"
                id="transferFrequency"
                inputProps={{ maxLength: 255 }}
                size="small"
                label="Transfer Frequency"
              />
              <ReduxFormTextField
                fullWidth
                name="overrideStaleAlert"
                id="overrideStaleAlert"
                inputProps={{ maxLength: 255 }}
                size="small"
                label="Override Stale Alert (days)"
              />
              <ReduxFormTextField
                fullWidth
                name="rowDecreaseAllowed"
                id="rowDecreaseAllowed"
                inputProps={{ maxLength: 255 }}
                size="small"
                label="Row Decrease % Allowed"
              />
              <ReduxFormSelect
                fullWidth
                name="loadType"
                id="loadType"
                size="small"
                label="Load Type"
              >
                {loadTypes?.map((type) => (
                  <MenuItem value={type}>{type}</MenuItem>
                ))}
              </ReduxFormSelect>
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
    form: "CreateDataSetsForm",
    validate: dataSetsValidation,
    warn: passwordWarnings,
  }),
  connect((state) => ({ values: getFormValues("CreateDataSetsForm")(state) }))
)(DataSetsFormBase);

const selector = formValueSelector("CreateDataSetsForm");
const CreateDataSetsForm = connect((state, ownProps) => {
  const formDataStore = state.dataSets.formData;
  const initialValues = {
    ...formDataStore,
    clinicalDataType:
      ownProps.initialValues.clinicalDataType || formDataStore.clinicalDataType,
    fileType: ownProps.initialValues.fileType || formDataStore.fileType,
    transferFrequency:
      ownProps.initialValues.transferFrequency ||
      formDataStore.transferFrequency,
    headerRowNumber:
      typeof ownProps.initialValues.headerRowNumber !== "undefined"
        ? ownProps.initialValues.headerRowNumber
        : formDataStore.headerRowNumber,
    fileNamingConvention:
      ownProps.initialValues.fileNamingConvention ||
      formDataStore.fileNamingConvention,
    delimiter: ownProps.initialValues.delimiter || formDataStore.delimiter,
    escapeCharacter:
      ownProps.initialValues.escapeCharacter || formDataStore.escapeCharacter,
    loadType: ownProps.initialValues.loadType || formDataStore.loadType,
    quote: ownProps.initialValues.quote || formDataStore.quote,
    datasetName:
      ownProps.initialValues.datasetName || formDataStore.datasetName || "",
    path: ownProps.initialValues.path || formDataStore.path || "",
  };
  // console.log("state.dataSets", initialValues, ownProps.initialValues);
  return {
    initialValues, // pull initial values from account reducer
    enableReinitialize: true,
    formValues: selector(state, "fileType"),
    defaultDelimiter: state.dataSets.defaultDelimiter,
    defaultEscapeCharacter: state.dataSets.defaultEscapeCharacter,
    defaultQuote: state.dataSets.defaultQuote,
    defaultHeaderRowNumber: state.dataSets.defaultHeaderRowNumber,
    defaultFooterRowNumber: state.dataSets.defaultFooterRowNumber,
    defaultLoadType: state.dataSets.defaultLoadType,
    datakind: state.dataSets.datakind?.records,
  };
})(ReduxForm);

export default CreateDataSetsForm;
