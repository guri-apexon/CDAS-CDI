/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useEffect,
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import Paper from "apollo-react/components/Paper";
import Status from "apollo-react/components/Status";
import Radio from "apollo-react/components/Radio";
import RadioError from "apollo-react-icons/RadioError";
import Typography from "apollo-react/components/Typography";
import SearchIcon from "apollo-react-icons/Search";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import Button from "apollo-react/components/Button";
import Autocomplete from "apollo-react/components/Autocomplete";
import RadioGroup from "apollo-react/components/RadioGroup";
import Switch from "apollo-react/components/Switch";
import Select from "apollo-react/components/Select";
import TextField from "apollo-react/components/TextField";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Table from "apollo-react/components/Table";
import Modal from "apollo-react/components/Modal";

import dataSetsValidation from "../../../../components/FormComponents/DataSetsValidation";
import { MessageContext } from "../../../../components/Providers/MessageProvider";

import {
  getSQLTables,
  getSQLColumns,
  getPreviewSQL,
  hideErrorMessage,
} from "../../../../store/actions/DataSetsAction";

import {
  inputAlphaNumericWithUnderScore,
  scrollIntoView,
  YesNo,
} from "../../../../utils";
import { checkfilterCondition } from "../../../../components/FormComponents/validators";
import PreviewColumns from "../../../../components/Dataset/PreviewColumns";

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

const JDBCForm = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const dataSets = useSelector((state) => state.dataSets);
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dsActive, setDsActive] = useState(true);
  const [datasetName, setDatasetName] = useState("");
  const [clinicalDataType, setClinicalDataType] = useState(null);
  const [dataKindReady, setDatakindReady] = useState(true);
  const [isCustomSQL, setIsCustomSQL] = useState("Yes");
  const [sQLQuery, setSQLQuery] = useState("");
  const [tableName, setTableName] = useState(null);
  const [filterCondition, setFilterCondition] = useState("");
  const [dataType, setDataType] = useState("Cumulative");
  const [offsetColumn, setOffsetColumn] = useState(null);
  const [triggeredSqlData, setTriggerSqlData] = useState(false);
  const [filterError, setFilterError] = useState(false);

  // handle table change modal
  const [inputValue, setInputValue] = useState("");
  const [isTableChangeModalOpen, setIsTableChangeModalOpen] = useState(false);
  const [tempTableName, setTempTableName] = useState(null);

  const messageContext = useContext(MessageContext);

  const {
    datakind,
    selectedDataset,
    previewSQL,
    sqlTables,
    sqlColumns,
    locationDetail,
    error,
    success,
  } = dataSets;

  const {
    datasetId,
    dfTestFlag,
    onSubmit,
    moveNext,
    initialValue,
    onChangeSql,
  } = props;

  const setDefaultValues = () => {
    setDsActive(true);
    setDatasetName("");
    setClinicalDataType(null);
    setIsCustomSQL("Yes");
    setSQLQuery("");
    setTableName(null);
    setFilterCondition("");
    setDataType("Cumulative");
    setOffsetColumn(null);
    setIsPreviewReady(false);
  };

  useEffect(() => {
    if (selectedDataset?.datasetid) {
      const {
        active,
        incremental,
        mnemonic,
        customsql,
        customsql_query: customQuery,
        datakindid,
        offsetcolumn,
        tbl_nm: tName,
      } = selectedDataset;
      setDsActive(active === 1 ? true : false);
      setDatasetName(mnemonic);
      setSQLQuery(customQuery);
      setDataType(incremental);
      if (customsql) {
        setIsCustomSQL(customsql);
      }
      // if (datakindid) {
      //   setClinicalDataType([datakindid]);
      // }
      // if (tName) {
      //   setTableName([tName]);
      // }
      // if (offsetcolumn) {
      //   setOffsetColumn([offsetcolumn]);
      // }
    }
  }, [selectedDataset]);

  useEffect(() => {
    if (datasetId === "new") {
      setDefaultValues();
    }
  }, [datasetId]);

  const submitJDBCForm = (ready = false) => {
    if (isCustomSQL === "No") {
      if (!tableName?.value) {
        messageContext.showErrorMessage(`Please select table name to proceed.`);
        return false;
      }
      if (dataType === "Incremental" && !offsetColumn) {
        messageContext.showErrorMessage(
          `Please select offset column to proceed.`
        );
        return false;
      }
      if (
        filterCondition &&
        !filterCondition?.toLowerCase().startsWith("where")
      ) {
        messageContext.showErrorMessage(
          `Please correct your filter condition.`
        );
        return false;
      }
    }
    const data = {
      datasetName,
      active: dsActive,
      incremental: dataType === "Incremental" ? 1 : 0,
      clinicalDataType,
      customQuery: isCustomSQL,
      customSql: sQLQuery,
      tableName: tableName?.value ? tableName : "",
      offsetColumn: offsetColumn || "",
      dfTestFlag,
      conditionalExpression: filterCondition || "",
      sqlReady: ready,
    };
    onSubmit(data);
  };
  // useEffect(() => {
  //   console.log("sqlColumns", sqlColumns, triggeredSqlData);
  //   // if (sqlColumns?.length && triggeredSqlData) {
  //   //   submitJDBCForm(true);
  //   //   setTriggerSqlData(false);
  //   // }
  // }, [sqlColumns]);

  useEffect(() => {
    setLoading(false);
    // console.log("previewSQL", previewSQL, isPreviewReady, isCustomSQL);
    if (isPreviewReady && previewSQL?.length) {
      if (isCustomSQL.toLowerCase() === "no") {
        moveNext();
      } else if (isCustomSQL.toLowerCase() === "yes") {
        messageContext.showSuccessMessage(
          `Your query looks good. Please proceed to save dataflow.`
        );
        submitJDBCForm(true);
        scrollIntoView();
      }
    }
  }, [previewSQL]);

  const handlePreview = async () => {
    if (!clinicalDataType?.value || datasetName === "") {
      messageContext.showErrorMessage(
        `Please fill required fields to proceed.`
      );
      return false;
    }
    if (sQLQuery === "") {
      messageContext.showErrorMessage(`Please add your query to proceed.`);
      return false;
    }
    if (sQLQuery.includes("*")) {
      messageContext.showErrorMessage(
        `Custom SQL Query should not contain select *`
      );
      return false;
    }
    setIsPreviewReady(true);
    setLoading(true);
    await dispatch(
      getPreviewSQL({
        tableName: null,
        ...locationDetail,
        columnCount: null,
        customQuery: isCustomSQL,
        columnDefinition: null,
        customSql: sQLQuery,
        conditionalExpression: null,
      })
    );
    setLoading(false);
  };

  const handleStatusUpdate = () => {
    setDsActive(!dsActive);
  };
  const resetDfStep = () => {
    if (isPreviewReady) {
      messageContext.setCreateDfConfig({ currentStep: 3 });
      setIsPreviewReady(false);
    }
  };
  const handleSelection = (e) => {
    const { value } = e.target;
    setIsCustomSQL(value);
    onChangeSql(value);
    resetDfStep();
  };

  const handleCDT = (e, v) => {
    setClinicalDataType(v);
    resetDfStep();
  };

  const handleTableSelect = (e, obj) => {
    // if table is already select show popup
    if (tableName && obj && sqlColumns && isCustomSQL === "No") {
      setIsTableChangeModalOpen(true);

      // store current selected data in temp state
      setTempTableName(obj);

      // set label to previous selection
      setInputValue(tableName?.label);
    } else {
      setTableName(obj);
      setInputValue(obj?.label);
      if (!obj?.value) return false;
      const colPayload = {
        ...locationDetail,
        tableName: obj.value,
      };
      dispatch(getSQLColumns(colPayload));
      setOffsetColumn(null);
    }
  };

  // modal functions
  const handleModalClose = () => {
    setTempTableName(null);
    setIsTableChangeModalOpen(false);
  };

  const handleModalSuccess = () => {
    setIsTableChangeModalOpen(false);
    setTableName(tempTableName);
    setInputValue(tempTableName?.label);
    if (!tempTableName?.value) return false;
    const colPayload = {
      ...locationDetail,
      tableName: tempTableName.value,
    };
    dispatch(getSQLColumns(colPayload));
    setOffsetColumn(null);
    setTempTableName(null);
  };

  const handleColumnSelect = (e, v) => {
    setOffsetColumn(v);
  };

  const handleDTChange = (e) => {
    setDataType(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "datasetName") {
      inputAlphaNumericWithUnderScore(e, (v) => {
        setDatasetName(v);
      });
    } else if (name === "sQLQuery") {
      setSQLQuery(value);
    } else if (name === "filterCondition") {
      setFilterError(checkfilterCondition(value));
      setFilterCondition(value);
    }
    resetDfStep();
  };

  const getJdbcTables = () => {
    dispatch(getSQLTables({ ...locationDetail }));
    setIsPreviewReady(false);
  };

  useEffect(() => {
    if (isCustomSQL === "No") {
      getJdbcTables();
      setLoading(true);
    }
  }, [isCustomSQL]);

  // useEffect(() => {
  //   if (dataType === "Incremental" && tableName?.length) {
  //     dispatch(getSQLColumns({ ...locationDetail, tableName: tableName[0] }));
  //     setTriggerSqlData(true);
  //   }
  // }, [dataType]);

  useEffect(() => {
    if (error) {
      messageContext.showErrorMessage(error);
      setLoading(false);
      setTimeout(() => {
        dispatch(hideErrorMessage());
      }, 5000);
    }
  }, [error]);

  useEffect(() => {
    if (locationDetail && isCustomSQL === "No") {
      setTableName(null);
      setInputValue("");
      setOffsetColumn(null);
      getJdbcTables();
    }
  }, [locationDetail]);

  useEffect(() => {
    setLoading(false);
  }, [sqlTables]);

  useEffect(() => {
    if (initialValue) {
      if (initialValue.dataKind) {
        console.log(initialValue);
        // const dataKindId =
        //   datakind.records.find((x) => x.name === initialValue.dataKind)
        //     ?.value || null;
        // if (dataKindId) {
        //   setClinicalDataType([dataKindId]);
        // }
        setDatakindReady((x) => x + 1);
      } else if (initialValue.clinicalDataType?.datakindid) {
        setClinicalDataType(initialValue.clinicalDataType);
        setDatakindReady((x) => x + 1);
      }
      if (initialValue.datasetName) setDatasetName(initialValue.datasetName);
      if (initialValue.customQuery) setIsCustomSQL(initialValue.customQuery);
      if (initialValue.customSql) setSQLQuery(initialValue.customSql);
      if (initialValue.incremental === 1) setDataType("Incremental");
      if (initialValue.conditionalExpression)
        setFilterCondition(initialValue.conditionalExpression);
      if (initialValue.tableName) {
        setTableName(initialValue.tableName);
        setInputValue(initialValue?.tableName?.label || "");
      }
      if (initialValue.offsetColumn) {
        setOffsetColumn(initialValue.offsetColumn);
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    handleSubmit() {
      // if (isCustomSQL === "No" && tableName) {
      //   dispatch(getSQLColumns(tableName));
      //   setTriggerSqlData(true);
      // } else {
      submitJDBCForm();
      // }
    },
    handleCancel() {
      setDefaultValues();
    },
  }));

  const handleInputChange = (event, newValue, reason) => {
    if (reason !== "reset") {
      setInputValue(newValue);
    }
  };

  return (
    <form className="jdbc-form">
      <Paper className={classes.paper} style={{ paddingTop: 0 }}>
        <div className={classes.section}>
          <div className="like-fixedbar">
            <Typography variant="title1" gutterBottom>
              Dataset Settings
            </Typography>
            <div className="ds-status">
              <Switch
                label="Dataset active"
                name="active"
                checked={dsActive}
                className="MuiSwitch"
                size="small"
                labelPlacement="start"
                onChange={handleStatusUpdate}
              />
            </div>
          </div>
          <Grid container spacing={3}>
            <Grid item md={5}>
              <TextField
                fullWidth
                maxLength="30"
                style={{ width: 275, marginTop: 0 }}
                name="datasetName"
                value={datasetName}
                onChange={handleChange}
                inputProps={{ maxLength: 30 }}
                label="Dataset Name (Mnemonic)"
                size="small"
              />
            </Grid>
            <Grid item md={3}>
              <AutocompleteV2
                key={dataKindReady}
                name="clinicalDataType"
                value={clinicalDataType}
                label="Clinical Data Type"
                source={datakind.records}
                onChange={handleCDT}
                singleSelect
                enableVirtualization
                size="small"
                forcePopupIcon
                popupIcon={<SearchIcon fontSize="extraSmall" />}
                variant="search"
                fullWidth
                required
              />
            </Grid>
          </Grid>
          <Select
            name="isCustomSQL"
            id="isCustomSQL"
            canDeselect={false}
            value={isCustomSQL}
            size="small"
            onChange={(e) => handleSelection(e)}
            label="Custom SQL Query"
          >
            {YesNo?.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </Select>
          {isCustomSQL === "Yes" ? (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <TextField
                fullWidth
                name="sQLQuery"
                size="small"
                value={sQLQuery}
                onChange={handleChange}
                minHeight={32}
                multiline
                sizeAdjustable
                label="SQL Query"
              />
              <Button
                variant="secondary"
                size="small"
                onClick={handlePreview}
                disabled={loading}
                style={{ marginRight: 10, top: "-9px", marginLeft: 24 }}
              >
                Preview SQL
              </Button>
            </div>
          ) : loading ? (
            <ApolloProgress className="center-loader" />
          ) : (
            <>
              <Grid item md={3}>
                <AutocompleteV2
                  name="tableName"
                  key={tableName}
                  id="tableName"
                  label="Table Name"
                  matchFrom="any"
                  onInputChange={handleInputChange}
                  inputValue={inputValue}
                  value={tableName}
                  source={sqlTables.map((e) => ({
                    label: e.tableName,
                    value: e.tableName,
                  }))}
                  onChange={handleTableSelect}
                  singleSelect
                  enableVirtualization
                  size="small"
                  forcePopupIcon
                  popupIcon={<SearchIcon fontSize="extraSmall" />}
                  variant="search"
                  fullWidth
                  required
                />
                {/* <Autocomplete
                  name="tableName"
                  key={tableName}
                  id="tableName"
                  size="small"
                  label="Table Name"
                  value={tableName}
                  source={sqlTables.map((e) => ({
                    label: e.tableName,
                    value: e.tableName,
                  }))}
                  className="smallSize_autocomplete"
                  onChange={handleTableSelect}
                  variant="search"
                  singleSelect
                  required
                  fullWidth
                  blurOnSelect={false}
                  clearOnBlur={false}
                  filterSelectedOptions={false}
                  enableVirtualization
                /> */}
              </Grid>
              <TextField
                fullWidth
                name="filterCondition"
                id="filterCondition"
                style={{ width: "400px", display: "flex" }}
                size="small"
                value={filterCondition}
                minHeight={32}
                multiline
                onChange={handleChange}
                sizeAdjustable
                inputProps={{ maxLength: 255 }}
                label="Filter Condition"
                error={!!filterError}
                helperText={filterError}
              />
              <RadioGroup
                name="dataType"
                id="dataType"
                size="small"
                label="Type of Data"
                value={dataType}
                required
                onChange={handleDTChange}
                className="dataset-data-flow-type"
              >
                <Radio value="Cumulative" label="Cumulative" />
                <Radio value="Incremental" label="Incremental" />
              </RadioGroup>
              {dataType === "Incremental" && (
                <AutocompleteV2
                  name="offsetColumn"
                  id="offsetColumn"
                  size="small"
                  label="Offset Column"
                  value={offsetColumn}
                  source={sqlColumns
                    .filter((x) =>
                      ["numeric", "date"].includes(x.dataType?.toLowerCase())
                    )
                    .map((e) => ({
                      label: e.columnName,
                      value: e.columnName,
                    }))}
                  className="smallSize_autocomplete"
                  onChange={handleColumnSelect}
                  variant="search"
                  matchFrom="any"
                  singleSelect
                  enableVirtualization
                  required
                  fullWidth
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
          {isPreviewReady && <PreviewColumns previewSQL={previewSQL} />}
        </div>
      </Paper>
    </form>
  );
});

export default JDBCForm;
