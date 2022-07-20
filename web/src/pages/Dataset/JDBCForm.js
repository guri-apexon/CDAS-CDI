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
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import Button from "apollo-react/components/Button";
import Autocomplete from "apollo-react/components/Autocomplete";
import RadioGroup from "apollo-react/components/RadioGroup";
import Switch from "apollo-react/components/Switch";
import Select from "apollo-react/components/Select";
import TextField from "apollo-react/components/TextField";
import Table from "apollo-react/components/Table";

import dataSetsValidation from "../../components/FormComponents/DataSetsValidation";
import { MessageContext } from "../../components/Providers/MessageProvider";

import {
  getSQLTables,
  getSQLColumns,
  getPreviewSQL,
  saveDatasetData,
  updateDatasetData,
} from "../../store/actions/DataSetsAction";

import { inputAlphaNumericWithUnderScore, YesNo } from "../../utils";

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
  const dataFlow = useSelector((state) => state.dataFlow);
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [dsActive, setDsActive] = useState(true);
  const [datasetName, setDatasetName] = useState("");
  const [clinicalDataType, setClinicalDataType] = useState(null);
  const [isCustomSQL, setIsCustomSQL] = useState("Yes");
  const [sQLQuery, setSQLQuery] = useState("");
  const [tableName, setTableName] = useState(null);
  const [filterCondition, setFilterCondition] = useState("");
  const [dataType, setDataType] = useState("Cumulative");
  const [offsetColumn, setOffsetColumn] = useState(null);
  const [sQLQueryErr, setSQLQueryErr] = useState(false);
  const [filterConditionErr, setFilterConditionErr] = useState(false);
  const [datasetNameErr, setDatasetNameErr] = useState(false);
  const [clinicalDataTypeErr, setClinicalDataTypeErr] = useState(false);

  const messageContext = useContext(MessageContext);

  const { datakind, selectedDataset, previewSQL, sqlTables, sqlColumns } =
    dataSets;
  const { testLock, prodLock, testProdLock } = dataFlow;
  const { datasetId, datapackageid, dfTestFlag } = props;

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
    setSQLQueryErr(false);
    setFilterConditionErr(false);
    setDatasetNameErr(false);
    setClinicalDataTypeErr(false);
  };

  useEffect(() => {
    if (selectedDataset?.datasetid) {
      const {
        active,
        incremental,
        mnemonic,
        customsql_yn: customSQLYN,
        customsql: customQuery,
        datakindid,
        offsetcolumn,
        tbl_nm: tName,
      } = selectedDataset;
      setDsActive(active === 1 ? true : false);
      setDatasetName(mnemonic);
      setSQLQuery(customQuery);
      setDataType(incremental);
      setIsCustomSQL(customSQLYN || "Yes");
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

  const handlePreview = async () => {
    await dispatch(getPreviewSQL(sQLQuery));
    setTimeout(() => {
      setIsPreviewReady(true);
    }, 100);
  };

  const handleStatusUpdate = () => {
    setDsActive(!dsActive);
  };

  const handleSelection = (e) => {
    const { value } = e.target;
    setIsCustomSQL(value);
    props.onChangeSql(value);
  };

  const handleCDT = (e) => {
    setClinicalDataType(e);
  };

  const handleTableSelect = (e) => {
    setTableName(e);
  };

  const handleColumnSelect = (e) => {
    setOffsetColumn(e);
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
      setFilterCondition(value);
    }
  };

  useEffect(() => {
    if (isCustomSQL === "No") {
      dispatch(getSQLTables());
      setIsPreviewReady(false);
    }
  }, [isCustomSQL]);

  useEffect(() => {
    if (dataType === "Incremental") {
      dispatch(getSQLColumns(tableName));
    }
  }, [dataType]);

  useImperativeHandle(ref, () => ({
    // eslint-disable-next-line consistent-return
    handleSubmit() {
      if (datasetName === "") {
        setDatasetNameErr(true);
        return false;
      }
      setDatasetNameErr(false);
      if (clinicalDataType === "") {
        setClinicalDataTypeErr(true);
        return false;
      }
      setClinicalDataTypeErr(false);
      if (datasetName === "") {
        return false;
      }
      if (datasetName === "") {
        return false;
      }
      if (datasetId === "new") {
        dispatch(
          saveDatasetData({
            datapackageid,
            datasetName,
            active: dsActive,
            incremental: dataType,
            clinicalDataType,
            isCustomSQL,
            sQLQuery,
            tableName,
            offsetColumn,
            dfTestFlag,
          })
        );
      } else {
        dispatch(
          updateDatasetData({
            datapackageid,
            datasetid: datasetId,
            datasetName,
            active: dsActive,
            incremental: dataType,
            clinicalDataType,
            isCustomSQL,
            sQLQuery,
            tableName,
            offsetColumn,
            dfTestFlag,
          })
        );
      }
    },
    handleCancel() {
      setDefaultValues();
    },
  }));

  const locationChange = () => {
    messageContext.showErrorMessage(
      `No tables returned. Pls reach out to admins`
    );
  };

  const queryCompilationError = () => {
    messageContext.showErrorMessage(
      `Query compilation error, Check query syntax.`
    );
  };

  const noRecordsFound = () => {
    messageContext.showErrorMessage(`No records found.`);
  };

  const notAllowIncremental = () => {
    messageContext.showErrorMessage(
      `Cannot switch to incremental as the dataset that has been synched does not have any primary key defined`
    );
  };

  const firstSyncHappened = () => {
    messageContext.showErrorMessage(
      `Custom SQL query setting cannot be changed after the dataset has been sync'd`
    );
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
              {dsActive && (
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
              <TextField
                fullWidth
                maxLength="30"
                style={{ width: 275 }}
                name="datasetName"
                value={datasetName}
                onChange={handleChange}
                inputProps={{ maxLength: 30 }}
                label="Dataset Name (Mnemonic)"
                size="small"
                // required
                disabled={prodLock}
              />
            </Grid>
            <Grid item md={6}>
              <Autocomplete
                name="clinicalDataType"
                value={clinicalDataType}
                label="Clinical Data Type"
                source={datakind.records}
                className="smallSize_autocomplete"
                onChange={handleCDT}
                variant="search"
                singleSelect
                // required
                size="small"
                fullWidth
                disabled={prodLock}
              />
            </Grid>
          </Grid>
          <Select
            name="isCustomSQL"
            id="isCustomSQL"
            value={isCustomSQL}
            size="small"
            onChange={(e) => handleSelection(e)}
            label="Custom SQL Query"
            disabled={testLock || prodLock || testProdLock}
          >
            {YesNo?.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </Select>
          {isCustomSQL === "Yes" && (
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
                disabled={prodLock}
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
          {isCustomSQL === "No" && (
            <>
              <Autocomplete
                name="tableName"
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
                disabled={prodLock}
              />
              <TextField
                fullWidth
                name="filterCondition"
                id="filterCondition"
                style={{ width: "70%", display: "flex" }}
                size="small"
                value={filterCondition}
                minHeight={32}
                multiline
                onChange={handleChange}
                sizeAdjustable
                inputProps={{ maxLength: 255 }}
                label="Filter Condition"
              />
              <RadioGroup
                name="dataType"
                id="dataType"
                size="small"
                label="Type of Data"
                value={dataType}
                required
                onChange={handleDTChange}
                disabled={prodLock}
                className="dataset-data-flow-type"
              >
                <Radio value="Cumulative" label="Cumulative" />
                <Radio value="Incremental" label="Incremental" />
              </RadioGroup>
              {dataType === "Incremental" && (
                <Autocomplete
                  name="offsetColumn"
                  id="offsetColumn"
                  size="small"
                  label="Offset Column"
                  value={offsetColumn}
                  source={sqlColumns.map((e) => ({
                    label: e.columnName,
                    value: e.columnName,
                  }))}
                  className="smallSize_autocomplete"
                  onChange={handleColumnSelect}
                  variant="search"
                  singleSelect
                  required
                  fullWidth
                />
              )}
            </>
          )}
          {isPreviewReady && (
            <div className="preview-table">
              <Table
                columns={Object.keys(previewSQL[0]).map((e) => ({
                  header: e,
                  accessor: e,
                }))}
                rows={previewSQL}
                hidePagination
              />
            </div>
          )}
        </div>
      </Paper>
    </form>
  );
});

export default JDBCForm;
