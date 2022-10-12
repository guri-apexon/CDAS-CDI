/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect, useDispatch, useSelector } from "react-redux";
import { reduxForm, getFormValues, formValueSelector } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import Radio from "apollo-react/components/Radio";
import Typography from "apollo-react/components/Typography";
import SearchIcon from "apollo-react-icons/Search";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import Button from "apollo-react/components/Button";
import Table from "apollo-react/components/Table";
import Modal from "apollo-react/components/Modal";
import {
  ReduxFormRadioGroup,
  ReduxFormSwitch,
  ReduxFormSelect,
  ReduxFormTextField,
  ReduxFormAutocompleteV2,
  ReduxFormAutocomplete,
  // ReduxFormMultiSelect,
} from "../../components/FormComponents/FormComponents";
import dataSetsValidation from "../../components/FormComponents/DataSetsValidation";
import {
  getSQLTables,
  getSQLColumns,
  togglePreviewedSql,
  getPreviewSQL,
} from "../../store/actions/DataSetsAction";
import { MessageContext } from "../../components/Providers/MessageProvider";

import { YesNo } from "../../utils";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../components/Common/usePermission";
import { hideErrorMessage } from "../../store/actions/DataFlowAction";
import PreviewColumns from "../../components/Dataset/PreviewColumns";
import { checkRequired } from "../../components/FormComponents/validators";
// import { getPreviewSQL } from "../../services/ApiServices";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 32,
  },
};

// const validatePreviewed = (previewedSql) => (value) => {
//   if (!previewedSql) {
//     // messageContext.showErrorMessage("Please hit previewSql to proceed");
//     return "Please hit previewSql to proceed";
//   }
//   return false;
// };
const DataSetsFormBase = (props) => {
  const {
    handleSubmit,
    classes,
    datakind,
    formValues,
    change,
    initialValues,
    previewSQL,
    sqlTables,
    sqlColumns,
    onChange,
    testLock,
    prodLock,
    testProdLock,
    values,
  } = props;
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const [showPreview, setShowPreview] = useState(false);
  const dataSets = useSelector((state) => state.dataSets);

  const dashboard = useSelector((state) => state.dashboard);
  const { prot_id: protId } = dashboard?.selectedCard;

  const { canUpdate: canUpdateDataFlow, canCreate: CanCreateDataFlow } =
    useStudyPermission(
      Categories.CONFIGURATION,
      Features.DATA_FLOW_CONFIGURATION,
      protId
    );

  const [renderClinicalDataType, setRenderClinicalDataType] = useState(true);
  // const [offsetColsRender, setOffsetColsRender] = useState(0);
  const { locationDetail, error, previewedSql } = dataSets;
  const [selectedOffsetColumns, setSelectedOffsetColumns] = useState(null);
  const [sqlColumnsArr, setSqlColumnsArr] = useState([]);
  const [cdtValue, setCdtValue] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isColumnAPICalled, setIsColumnAPICalled] = useState(false);

  // handle table change modal
  const [inputValue, setInputValue] = useState("");
  const [isTableChangeModalOpen, setIsTableChangeModalOpen] = useState(false);
  const [tempTableName, setTempTableName] = useState(null);

  const onChangeOffsetColumn = (obj) => {
    setSelectedOffsetColumns(obj);
    change("offsetColumn", obj.value);
  };

  const changeTableName = (obj) => {
    // if table is already select show popup
    if (
      selectedTable &&
      obj &&
      sqlColumns &&
      formValues?.isCustomSQL === "No"
    ) {
      setIsTableChangeModalOpen(true);

      // store current selected data in temp state
      setTempTableName(obj);

      // set label to previous selection
      setInputValue(selectedTable?.label);
    } else {
      const tableName = obj?.value || null;
      if (!tableName) return;
      setSelectedTable(obj);
      setSelectedOffsetColumns(null);
      change("offsetColumn", null);
      change("tableName", tableName);
      // console.log("TableName::::", tableName);
      if (formValues?.isCustomSQL === "No") {
        setSqlColumnsArr([]);
        dispatch(
          getSQLColumns({
            ...locationDetail,
            tableName,
          })
        );
      } else {
        setSqlColumnsArr([]);
      }
    }
  };

  const handleInputChange = (event, newValue, reason) => {
    if (reason !== "reset") {
      setInputValue(newValue);
    }
  };

  // modal functions
  const handleModalClose = () => {
    setTempTableName(null);
    setIsTableChangeModalOpen(false);
  };

  const handleModalSuccess = () => {
    setIsTableChangeModalOpen(false);

    const tableName = tempTableName?.value || null;
    if (!tableName) return;
    setSelectedTable(tempTableName);
    setSelectedOffsetColumns(null);
    change("offsetColumn", null);
    change("tableName", tableName);
    // console.log("TableName::::", tableName);
    if (formValues?.isCustomSQL === "No") {
      setSqlColumnsArr([]);
      dispatch(
        getSQLColumns({
          ...locationDetail,
          tableName,
        })
      );
    } else {
      setSqlColumnsArr([]);
    }

    setTempTableName(null);
  };

  useEffect(() => {}, [formValues.tableName]);

  useEffect(() => {
    if (sqlColumns.length) {
      const filtered = sqlColumns
        .filter((x) => ["numeric", "date"].includes(x.dataType?.toLowerCase()))
        .map((e) => ({
          label: e.columnName,
          value: e.columnName,
        }));
      setSqlColumnsArr(filtered);
      const selected = filtered.find(
        (x) => x.value === initialValues.offsetColumn
      );
      if (selected) {
        setSelectedOffsetColumns(selected);
      } else {
        setSelectedOffsetColumns(null);
      }
    }
  }, [sqlColumns]);

  useEffect(() => {
    if (formValues && ["Yes", "No"].includes(formValues)) {
      onChange(formValues);
    }
    if (formValues.isCustomSQL === "No") {
      dispatch(
        getSQLTables({
          ...locationDetail,
        })
      );
      setShowPreview(false);
    }
  }, [formValues.isCustomSQL]);

  // fetch table columns on page load
  useEffect(() => {
    if (
      formValues?.isCustomSQL === "No" &&
      formValues?.tableName &&
      !isColumnAPICalled
    ) {
      setSqlColumnsArr([]);
      dispatch(
        getSQLColumns({
          ...locationDetail,
          tableName: formValues.tableName,
        })
      );
      setIsColumnAPICalled(true);
    }
  }, [formValues.tableName]);

  useEffect(() => {
    if (previewSQL?.length && formValues.isCustomSQL?.toLowerCase() === "yes") {
      dispatch(togglePreviewedSql(true));
      messageContext.showSuccessMessage(
        `Your query looks good. Please proceed to save dataset.`
      );
    }
  }, [previewSQL]);

  // eslint-disable-next-line consistent-return
  const handlePreview = async () => {
    if (previewedSql) {
      dispatch(togglePreviewedSql(false));
    }
    if (!formValues?.sQLQuery || formValues?.sQLQuery === "") {
      messageContext.showErrorMessage(`Please add your query to proceed.`);
      return false;
    }
    if (formValues?.sQLQuery?.includes("*")) {
      messageContext.showErrorMessage(
        `Custom SQL Query should not contain select *`
      );
      return false;
    }
    setShowPreview(true);
    // const { data } = await getPreviewSQL({
    //   ...locationDetail,
    //   tableName: null,
    //   columnDefinition: null,
    //   columnCount: null,
    //   customSql: formValues.sQLQuery,
    //   customQuery: formValues.isCustomSQL,
    // });
    // console.log("result", data);
    // if (data?.length) {
    //   // dispatch(togglePreviewedSql(true));
    //   messageContext.showSuccessMessage(
    //     `Your query looks good. Please proceed to save dataflow.`
    //   );
    // }
    dispatch(
      getPreviewSQL({
        ...locationDetail,
        tableName: null,
        columnDefinition: null,
        columnCount: null,
        customSql: formValues.sQLQuery,
        customQuery: formValues.isCustomSQL,
      })
    );
  };

  useEffect(() => {
    setRenderClinicalDataType(false);
  }, [datakind, formValues.clinicalDataType]);

  const onChangeCDT = (v) => {
    setCdtValue(v);
    change("clinicalDataType", v?.datakindid ? [v.datakindid] : null);
  };

  useEffect(() => {
    if (values?.clinicalDataType) {
      const selectedDK = datakind?.find(
        (e) => e.value === values.clinicalDataType[0]
      );
      if (selectedDK) setCdtValue(selectedDK);
    }
    if (values?.tableName) {
      const tableObj = {
        label: values?.tableName,
        value: values?.tableName,
      };
      if (tableObj) {
        setSelectedTable(tableObj);
        setInputValue(tableObj?.label);
      }
    } else {
      setSelectedTable(null);
      setInputValue("");
    }
    if (!values || !values?.clinicalDataType) {
      setCdtValue(null);
    }
  }, [values]);

  useEffect(() => {
    if (!renderClinicalDataType)
      setTimeout(() => setRenderClinicalDataType(true), 50);
  }, [renderClinicalDataType]);

  useEffect(() => {
    if (sqlTables.length) {
      // if (!sqlTables.find((x) => x.tableName === formValues.tableName)) {
      //   change("offsetColumn", null);
      //   change("tableName", null);
      //   setSelectedOffsetColumns(null);
      // }
    }
  }, [sqlTables]);

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
                disabled={!canUpdateDataFlow}
              />
            </div>
          </div>
          <Grid container spacing={3}>
            <Grid item md={5}>
              <ReduxFormTextField
                fullWidth
                maxLength="30"
                style={{ width: 275, marginTop: 0 }}
                name="datasetName"
                inputProps={{ maxLength: 30 }}
                label="Dataset Name (Mnemonic)"
                size="small"
                // required
                disabled={prodLock || testLock || !canUpdateDataFlow}
              />
            </Grid>
            <Grid item md={3}>
              {datakind && renderClinicalDataType && (
                <ReduxFormAutocompleteV2
                  name="clinicalDataType"
                  id="clinicalDataType"
                  validate={checkRequired}
                  label="Clinical Data Type"
                  source={datakind}
                  input={{
                    value: cdtValue,
                    onChange: onChangeCDT,
                  }}
                  enableVirtualization
                  singleSelect
                  size="small"
                  forcePopupIcon
                  popupIcon={<SearchIcon fontSize="extraSmall" />}
                  fullWidth
                  required
                  disabled={prodLock || !canUpdateDataFlow}
                />
              )}
            </Grid>
          </Grid>
          <ReduxFormSelect
            name="isCustomSQL"
            id="isCustomSQL"
            size="small"
            label="Custom SQL Query"
            required
            disabled={testProdLock || !canUpdateDataFlow}
            canDeselect={false}
          >
            {YesNo?.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </ReduxFormSelect>
          {formValues.isCustomSQL === "Yes" && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <ReduxFormTextField
                fullWidth
                name="sQLQuery"
                id="sQLQuery"
                size="small"
                minHeight={32}
                multiline
                sizeAdjustable
                disabled={prodLock || !canUpdateDataFlow}
                label="SQL Query"
                // validate={[validatePreviewed(previewedSql)]}
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
          {formValues.isCustomSQL === "No" && (
            <>
              <div key={selectedTable}>
                <ReduxFormAutocompleteV2
                  name="tableName"
                  id="tableName"
                  label="Table Name"
                  fullWidth
                  style={{ width: 300, display: "block" }}
                  canDeselect={false}
                  disabled={prodLock || !canUpdateDataFlow}
                  onInputChange={handleInputChange}
                  inputValue={inputValue}
                  input={{
                    value: selectedTable,
                    onChange: changeTableName,
                  }}
                  source={sqlTables.map((e) => ({
                    label: e.tableName,
                    value: e.tableName,
                  }))}
                  variant="search"
                  size="small"
                  forcePopupIcon
                  popupIcon={<SearchIcon fontSize="extraSmall" />}
                  singleSelect
                  required
                  blurOnSelect={false}
                  clearOnBlur={false}
                  filterSelectedOptions={false}
                  enableVirtualization
                />
              </div>
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
                disabled={!canUpdateDataFlow}
              />
              <ReduxFormRadioGroup
                name="dataType"
                id="dataType"
                size="small"
                label="Type of Data"
                disabled={prodLock || !canUpdateDataFlow}
                className="dataset-data-flow-type"
              >
                <Radio value="Cumulative" label="Cumulative" />
                <Radio value="Incremental" label="Incremental" />
              </ReduxFormRadioGroup>
              {formValues.dataType === "Incremental" && (
                <ReduxFormAutocompleteV2
                  name="offsetColumn"
                  input={{
                    value: selectedOffsetColumns || null,
                    onChange: onChangeOffsetColumn,
                  }}
                  source={sqlColumnsArr || []}
                  label="Offset Column"
                  size="small"
                  fullWidth
                  style={{ width: 300, display: "block" }}
                  blurOnSelect={false}
                  clearOnBlur={false}
                  filterSelectedOptions={false}
                  enableVirtualization
                  limitChips={5}
                  alwaysLimitChips
                  chipColor="white"
                  disabled={prodLock || !canUpdateDataFlow}
                />
              )}
            </>
          )}
          {/* Modal for changing table name */}
          <Modal
            open={isTableChangeModalOpen || false}
            variant="warning"
            title="Change Table"
            onClose={handleModalClose}
            message="Do you want to replace the table name? Doing so will lead to loss of columns saved earlier."
            buttonProps={[
              { label: "Cancel", onClick: handleModalClose },
              { label: "Ok", onClick: handleModalSuccess },
            ]}
            id="overWrite"
          />
          {showPreview && <PreviewColumns previewSQL={previewSQL} />}
        </div>
      </Paper>
    </form>
  );
};

const ReduxForm = compose(
  withStyles(styles),
  reduxForm({
    form: "DataSetsFormSQL",
    enableReinitialize: true,
    validate: dataSetsValidation,
  }),
  connect((state) => ({ values: getFormValues("DataSetsFormSQL")(state) }))
)(DataSetsFormBase);

const selector = formValueSelector("DataSetsFormSQL");
const DataSetsFormSQL = connect((state) => {
  const { sqlColumns, sqlTables } = state.dataSets;
  const initialValues = {
    ...state.dataSets.formDataSQL,
  };
  if (!sqlTables.length) {
    initialValues.tableName = "";
  }
  return {
    initialValues, // pull initial values from account reducer
    enableReinitialize: true,
    formValues: selector(
      state,
      "isCustomSQL",
      "sQLQuery",
      "tableName",
      "dataType",
      "offsetColumn",
      "clinicalDataType"
    ),
    datakind: state.dataSets.datakind?.records || [],
    sqlTables,
    sqlColumns,
    previewSQL: state.dataSets.previewSQL,
  };
})(ReduxForm);

export default DataSetsFormSQL;
