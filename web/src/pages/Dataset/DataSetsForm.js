/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
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
import Radio from "apollo-react/components/Radio";
import Typography from "apollo-react/components/Typography";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import {
  // ReduxFormAutocomplete,
  ReduxFormRadioGroup,
  ReduxFormSwitch,
  ReduxFormSelect,
  ReduxFormTextField,
  ReduxFormPassword,
  ReduxFormAutocompleteV2,
} from "../../components/FormComponents/FormComponents";
import dataSetsValidation, {
  passwordWarnings,
} from "../../components/FormComponents/DataSetsValidation";

import { fileTypes, delimeters, loadTypes } from "../../utils";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 32,
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
    prodLock,
    values,
  } = props;

  // const [selectedClinicalData, SetSelectedClinicalData] = useState([]);
  const [cdtValue, setCdtValue] = useState(null);

  const [renderClinicalDataType, setRenderClinicalDataType] = useState(true);

  const setDefaultValues = (e) => {
    const fileValue = e.target.value;
    if (fileValue !== "Delimited") {
      dispatch(change("DataSetsForm", "delimiter", defaultDelimiter));
      dispatch(
        change("DataSetsForm", "escapeCharacter", defaultEscapeCharacter)
      );
      dispatch(change("DataSetsForm", "quote", defaultQuote));
      dispatch(
        change("DataSetsForm", "headerRowNumber", defaultHeaderRowNumber)
      );
      dispatch(
        change("DataSetsForm", "footerRowNumber", defaultFooterRowNumber)
      );
      dispatch(change("DataSetsForm", "loadType", defaultLoadType));
    }
  };

  useEffect(() => {
    if (values?.clinicalDataType) {
      const selectedDK = datakind?.find(
        (e) => e.value === values.clinicalDataType[0]
      );
      // console.log("values", values, selectedDK);
      setCdtValue(selectedDK);
      // if (filteredDK?.length) {
      //   SetSelectedClinicalData([]);
      //   setTimeout(() => {
      //     SetSelectedClinicalData([filteredDK[0].value]);
      //   });
      //   // change("DataSetsForm", "clinicalDataType");
      // }
    }
    if (!values || !values?.clinicalDataType) {
      setCdtValue(null);
    }
  }, [values]);

  useEffect(() => {
    setRenderClinicalDataType(false);
  }, [datakind, formValues.clinicalDataType]);

  const onChangeCDT = (v) => {
    setCdtValue(v);
    dispatch(change("DataSetsForm", "clinicalDataType", [v.datakindid]));
  };

  useEffect(() => {
    if (!renderClinicalDataType)
      setTimeout(() => setRenderClinicalDataType(true), 50);
  }, [renderClinicalDataType]);

  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper} style={{ paddingTop: 0 }}>
        <div className={classes.section}>
          <div className="like-fixedbar">
            <Typography variant="title1" gutterBottom>
              Dataset Settings
            </Typography>
            <div className="ds-status">
              <ReduxFormSwitch
                label="Dataset active"
                name="active"
                className="MuiSwitch"
                size="small"
                labelPlacement="start"
              />
            </div>
          </div>

          <Grid container spacing={3}>
            <Grid item md={5}>
              <ReduxFormTextField
                fullWidth
                maxLength="30"
                name="datasetName"
                size="small"
                inputProps={{ maxLength: 30 }}
                label="Dataset Name (Mnemonic)"
                disabled={prodLock}
                // required
              />
              <ReduxFormSelect
                name="fileType"
                id="fileType"
                label="File Type"
                size="small"
                onChange={setDefaultValues}
                fullWidth
                // required
                disabled={prodLock}
                canDeselect={false}
              >
                {fileTypes?.map((type) => (
                  <MenuItem value={type}>{type}</MenuItem>
                ))}
              </ReduxFormSelect>
              {formValues.fileType === "SAS" && (
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
              {(formValues.fileType === "SAS" ||
                formValues.fileType === "Delimited") && (
                <>
                  <ReduxFormSelect
                    name="delimiter"
                    id="delimiter"
                    label="Delimiter"
                    size="small"
                    disabled={formValues.fileType === "SAS"}
                    fullWidth
                    canDeselect={false}
                  >
                    {delimeters?.map((type) => (
                      <MenuItem value={type}>{type}</MenuItem>
                    ))}
                  </ReduxFormSelect>

                  <ReduxFormTextField
                    fullWidth
                    name="escapeCharacter"
                    id="escapeCharacter"
                    disabled={formValues.fileType === "SAS"}
                    inputProps={{ maxLength: 255 }}
                    size="small"
                    label="Escape Character"
                  />

                  <ReduxFormTextField
                    fullWidth
                    name="quote"
                    id="quote"
                    disabled={formValues.fileType === "SAS"}
                    size="small"
                    inputProps={{ maxLength: 255 }}
                    label="Quote"
                  />
                </>
              )}
              <ReduxFormTextField
                fullWidth
                name="headerRowNumber"
                id="headerRowNumber"
                disabled={formValues.fileType === "SAS"}
                inputProps={{ maxLength: 255 }}
                size="small"
                label="Header Row Number"
              />
              <ReduxFormTextField
                fullWidth
                name="footerRowNumber"
                id="footerRowNumber"
                disabled={formValues.fileType === "SAS"}
                inputProps={{ maxLength: 255 }}
                size="small"
                label="Footer Row Number"
              />

              <ReduxFormTextField
                fullWidth
                name="fileNamingConvention"
                id="fileNamingConvention"
                inputProps={{ maxLength: 255 }}
                size="small"
                label="File Naming Convention"
                // required
              />
              <ReduxFormTextField
                fullWidth
                name="folderPath"
                id="folderPath"
                size="small"
                label="sFTP Folder Path"
              />
            </Grid>
            <Grid item md={1}>
              <div className="vertical-line">
                <div />
              </div>
            </Grid>
            <Grid item md={5}>
              {datakind && renderClinicalDataType && (
                <ReduxFormAutocompleteV2
                  name="clinicalDataType"
                  autoSelect
                  id="clinicalDataType"
                  label="Clinical Data Type"
                  source={datakind}
                  className="smallSize_autocomplete"
                  input={{
                    value: cdtValue,
                    onChange: onChangeCDT,
                  }}
                  enableVirtualization
                  variant="search"
                  singleSelect
                  fullWidth
                  // required
                  disabled={prodLock}
                />
              )}
              {formValues.fileType === "Excel" && (
                <ReduxFormPassword
                  name="filePwd"
                  size="small"
                  type="password"
                  label="File Password"
                  disabled={prodLock}
                />
              )}
              <ReduxFormTextField
                fullWidth
                name="transferFrequency"
                id="transferFrequency"
                inputProps={{ maxLength: 255 }}
                size="small"
                label="Transfer Frequency"
                // required
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
                canDeselect={false}
                disabled={prodLock}
                // required
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
    form: "DataSetsForm",
    validate: dataSetsValidation,
    warn: passwordWarnings,
  }),
  connect((state) => ({ values: getFormValues("DataSetsForm")(state) }))
)(DataSetsFormBase);

const selector = formValueSelector("DataSetsForm");
const DataSetsForm = connect((state) => ({
  initialValues: state.dataSets.formData, // pull initial values from account reducer
  enableReinitialize: true,
  formValues: selector(
    state,
    "fileType",
    "active",
    "clinicalDataType",
    "fileNamingConvention"
  ),
  defaultDelimiter: state.dataSets.defaultDelimiter,
  defaultEscapeCharacter: state.dataSets.defaultEscapeCharacter,
  defaultQuote: state.dataSets.defaultQuote,
  defaultHeaderRowNumber: state.dataSets.defaultHeaderRowNumber,
  defaultFooterRowNumber: state.dataSets.defaultFooterRowNumber,
  defaultLoadType: state.dataSets.defaultLoadType,
  datakind: state.dataSets.datakind?.records,
}))(ReduxForm);

export default DataSetsForm;
