/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect, useDispatch } from "react-redux";
import { reduxForm, getFormValues, formValueSelector } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import Status from "apollo-react/components/Status";
import Radio from "apollo-react/components/Radio";
import RadioError from "apollo-react-icons/RadioError";
import Typography from "apollo-react/components/Typography";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import Button from "apollo-react/components/Button";
import Table from "apollo-react/components/Table";
import {
  ReduxFormAutocomplete,
  ReduxFormRadioGroup,
  ReduxFormSwitch,
  ReduxFormSelect,
  ReduxFormTextField,
  ReduxFormMultiSelect,
} from "../../components/FormComponents/FormComponents";
import dataSetsValidation from "../../components/FormComponents/DataSetsValidation";
import {
  getSQLTables,
  getSQLColumns,
  getPreviewSQL,
} from "../../store/actions/DataSetsAction";
import { MessageContext } from "../../components/Providers/MessageProvider";

import { YesNo } from "../../utils";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 32,
  },
};

const DataSetsFormBase = (props) => {
  const {
    handleSubmit,
    classes,
    datakind,
    formValues,
    previewSQL,
    sqlTables,
    sqlColumns,
    onChange,
    testLock,
    prodLock,
    testProdLock,
  } = props;
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => {
    setShowPreview(true);
    dispatch(getPreviewSQL(formValues.sQLQuery));
  };

  useEffect(() => {
    dispatch(getSQLColumns(formValues.tableName));
  }, [formValues.tableName]);

  useEffect(() => {
    if (formValues && ["Yes", "No"].includes(formValues)) {
      onChange(formValues);
    }
    if (formValues.customSQLQuery === "No") {
      dispatch(getSQLTables("test"));
      setShowPreview(false);
    }
  }, [formValues.customSQLQuery]);

  useEffect(() => {}, [showPreview]);

  const locationChange = () => {
    messageContext.showErrorMessage(
      `No Tables Returned. Pls reach out to admins`
    );
  };

  const queryCompilationError = () => {
    messageContext.showErrorMessage(
      `Query Compilation Error, check query syntax.`
    );
  };

  const noRecordsFound = () => {
    messageContext.showErrorMessage(`No records found.`);
  };

  const notAllowIncremental = () => {
    messageContext.showErrorMessage(
      `Cannot switch to Incremental as the dataset that has been synched does not have any primary key defined`
    );
  };

  const firstSyncHappened = () => {
    messageContext.showErrorMessage(
      `Custom SQL Query setting cannot be changed after the dataset has been sync'd`
    );
  };

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
                label="Dataset Active"
                name="active"
                className="MuiSwitch"
                size="small"
                labelPlacement="start"
              />
              {formValues.active && (
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
              )}
            </div>
          </div>
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
                required
                disabled={prodLock}
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
                required
                disabled={prodLock}
              />
            </Grid>
          </Grid>
          <ReduxFormSelect
            name="customSQLQuery"
            id="customSQLQuery"
            size="small"
            label="Custom SQL Query"
            required
            disabled={testProdLock}
            canDeselect={false}
          >
            {YesNo?.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </ReduxFormSelect>
          {formValues.customSQLQuery === "Yes" && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <ReduxFormTextField
                fullWidth
                name="sQLQuery"
                id="sQLQuery"
                size="small"
                minHeight={32}
                multiline
                sizeAdjustable
                disabled={prodLock}
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
          {formValues.customSQLQuery === "No" && (
            <>
              <ReduxFormSelect
                name="tableName"
                id="tableName"
                label="Table Name"
                size="small"
                style={{ width: 300, display: "block" }}
                canDeselect={false}
                disabled={prodLock}
              >
                {sqlTables?.map((e) => (
                  <MenuItem value={e.tableName}>{e.tableName}</MenuItem>
                ))}
              </ReduxFormSelect>
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
                disabled={prodLock}
              >
                <Radio value="Cumulative" label="Cumulative" />
                <Radio value="Incremental" label="Incremental" />
              </ReduxFormRadioGroup>
              {formValues.dataType === "Incremental" && (
                <ReduxFormMultiSelect
                  name="offsetColumn"
                  id="offsetColumn"
                  label="Offset Column"
                  size="small"
                  canDeselect={true}
                  disabled={prodLock}
                  // eslint-disable-next-line react/jsx-no-bind
                  // onChange={onColumnChange}
                >
                  {sqlColumns?.map((e) => (
                    <MenuItem value={e.columnName}>{e.columnName}</MenuItem>
                  ))}
                </ReduxFormMultiSelect>
              )}
            </>
          )}
          {showPreview && (
            <div className="preview-table">
              {previewSQL.length > 0 && (
                <Table
                  columns={Object.keys(previewSQL[0]).map((e) => ({
                    header: e,
                    accessor: e,
                  }))}
                  rows={previewSQL}
                  hidePagination
                />
              )}
            </div>
          )}
        </div>
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
  formValues: selector(
    state,
    "active",
    "customSQLQuery",
    "sQLQuery",
    "tableName",
    "dataType",
    "offsetColumn"
  ),
  defaultDelimiter: state.dataSets.defaultDelimiter,
  defaultEscapeCharacter: state.dataSets.defaultEscapeCharacter,
  defaultQuote: state.dataSets.defaultQuote,
  defaultHeaderRowNumber: state.dataSets.defaultHeaderRowNumber,
  defaultFooterRowNumber: state.dataSets.defaultFooterRowNumber,
  datakind: state.dataSets.datakind?.records,
  sqlTables: state.dataSets.sqlTables,
  sqlColumns: state.dataSets.sqlColumns,
  previewSQL: state.dataSets.previewSQL,
}))(ReduxForm);

export default DataSetsFormSQL;
