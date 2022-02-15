/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect, useDispatch, useSelector } from "react-redux";
import { reduxForm, getFormValues, formValueSelector } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import FixedBar from "apollo-react/components/FixedBar";
import Status from "apollo-react/components/Status";
import Radio from "apollo-react/components/Radio";
import RadioError from "apollo-react-icons/RadioError";
import Typography from "apollo-react/components/Typography";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import Button from "apollo-react/components/Button";
import {
  ReduxFormAutocomplete,
  ReduxFormRadioGroup,
  ReduxFormSwitch,
  ReduxFormSelect,
  ReduxFormTextField,
} from "../../components/FormComponents/FormComponents";
import dataSetsValidation from "../../components/FormComponents/DataSetsValidation";
import {
  getSQLTables,
  getSQLColumns,
  getPreviewSQL,
} from "../../store/actions/DataSetsAction";

import { YesNo } from "../../utils";

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
  const {
    handleSubmit,
    classes,
    datakind,
    formValues,
    sqlTables,
    onChange,
    defaultFields,
  } = props;
  const dispatch = useDispatch();
  const dataSets = useSelector((state) => state.dataSets);
  const [showPreview, setShowPreview] = useState(false);
  const { formDataSQL } = dataSets;
  const { sQLQuery, tableName } = formDataSQL;

  const handlePreview = () => {
    console.log("data", formDataSQL);
    setShowPreview(true);
    dispatch(getPreviewSQL(sQLQuery));
  };

  const handleOnChange = () => {
    dispatch(getSQLTables(tableName));
  };

  useEffect(() => {
    if (formValues && ["Yes", "No"].includes(formValues)) {
      onChange(formValues);
    }
  }, [formValues]);

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
                style={{ width: 275 }}
                name="datasetName"
                inputProps={{ maxLength: 30 }}
                label="Data Set Name (Mnemonic)"
                size="small"
              />
            </Grid>
            <Grid item md={6}>
              <ReduxFormAutocomplete
                name="clinicalDataType"
                id="clinicalDataType"
                label="Clinical Data Type"
                source={datakind}
                className="smallSize_autocomplete"
                variant="search"
                singleSelect
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
          <ReduxFormSelect
            name="customSQLQuery"
            id="customSQLQuery"
            size="small"
            label="Custom SQL Query"
          >
            {YesNo?.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </ReduxFormSelect>
          {formValues === "Yes" && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <ReduxFormTextField
                fullWidth
                name="sQLQuery"
                id="sQLQuery"
                size="small"
                minHeight={32}
                multiline
                sizeAdjustable
                inputProps={{ maxLength: 255 }}
                label="SQL Query"
              />
              <Button
                variant="secondary"
                size="small"
                onClick={handlePreview}
                style={{ marginRight: 10, top: "-9px", marginLeft: 24 }}
              >
                Preview SQL
              </Button>
            </div>
          )}
          {formValues !== "Yes" && (
            <>
              <ReduxFormAutocomplete
                name="tableName"
                id="tableName"
                size="small"
                style={{ width: 272, display: "flex" }}
                source={sqlTables}
                onChange={handleOnChange}
                variant="search"
                singleSelect
                label="Table Name"
              />
              <ReduxFormTextField
                fullWidth
                name="filterCondition"
                id="filterCondition"
                style={{ width: "70%", display: "flex" }}
                size="small"
                minHeight={32}
                multiline
                sizeAdjustable
                inputProps={{ maxLength: 255 }}
                label="Filter Condition"
              />
              <ReduxFormRadioGroup
                name="dataType"
                id="dataType"
                size="small"
                label="Type of Data"
              >
                <Radio value="Cumulative" label="Cumulative" />
                <Radio value="Incremental" label="Incremental" />
              </ReduxFormRadioGroup>
              <ReduxFormSelect
                name="offsetColumn"
                id="offsetColumn"
                label="Offset Column"
                style={{ width: 272 }}
                size="small"
                // disabled
              >
                <MenuItem value="Enabled">Enabled</MenuItem>
                <MenuItem value="Disabled">Disabled</MenuItem>
              </ReduxFormSelect>
            </>
          )}
        </div>
        {/* {showPreview && (
          <div>
            <table>
              <tr>data</tr>
            </table>
          </div>
        )} */}
      </Paper>
    </form>
  );
};

const ReduxForm = compose(
  withStyles(styles),
  reduxForm({
    form: "DataSetsFormSQL",
    validate: dataSetsValidation,
  }),
  connect((state) => ({ values: getFormValues("DataSetsFormSQL")(state) }))
)(DataSetsFormBase);

const selector = formValueSelector("DataSetsFormSQL");
const DataSetsFormSQL = connect((state) => ({
  initialValues: state.dataSets.formDataSQL, // pull initial values from account reducer
  formValues: selector(state, "customSQLQuery"),
  defaultDelimiter: state.dataSets.defaultDelimiter,
  defaultEscapeCharacter: state.dataSets.defaultEscapeCharacter,
  defaultQuote: state.dataSets.defaultQuote,
  defaultHeaderRowNumber: state.dataSets.defaultHeaderRowNumber,
  defaultFooterRowNumber: state.dataSets.defaultFooterRowNumber,
  datakind: state.dataSets.datakind?.records,
  sqlTables: state.dataSets.sqlTables,
}))(ReduxForm);

export default DataSetsFormSQL;
