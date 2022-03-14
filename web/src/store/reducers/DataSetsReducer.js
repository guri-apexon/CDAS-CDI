/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
import produce from "immer";
import {
  HIDE_ERROR_MSG,
  GET_DATA_KIND,
  FETCH_DATAKIND_SUCCESS,
  SAVE_DATASET_DATA,
  STORE_DATASET_SUCCESS,
  STORE_DATASET_FAILURE,
  FETCH_DATAKIND_FAILURE,
  GET_DATASET_COLUMNS,
  FETCH_DATASET_COLUMNS_SUCCESS,
  FETCH_DATASET_COLUMNS_FAILURE,
  SAVE_DATASET_COLUMNS,
  STORE_DATASET_COLUMNS_SUCCESS,
  STORE_DATASET_COLUMNS_FAILURE,
  GET_DATASET_DETAIL,
  FETCH_DATASET_DETAIL_FAILURE,
  FETCH_DATASET_DETAIL_SUCCESS,
  UPDATE_DATASET_SUCCESS,
  UPDATE_DATASET_FAILURE,
  UPDATE_DATASET_DATA,
  GET_VLC_RULES,
  FETCH_VLC_RULES_SUCCESS,
  FETCH_VLC_RULES_FAILURE,
  GET_SQL_TABLES,
  FETCH_SQL_TABLES_SUCCESS,
  FETCH_SQL_TABLES_FAILURE,
  GET_SQL_COLUMNS,
  FETCH_SQL_COLUMNS_SUCCESS,
  FETCH_SQL_COLUMNS_FAILURE,
  GET_PREVIEW_SQL,
  FETCH_PREVIEW_SQL_SUCCESS,
  FETCH_PREVIEW_SQL_FAILURE,
  UPDATE_DS,
  RESET_FTP_FORM,
  RESET_JDBC_FORM,
} from "../../constants";

export const initialState = {
  loading: false,
  isDatasetCreated: false,
  isColumnsConfigured: false,
  isDatasetCreation: true,
  datasetColumns: [],
  datasetDetail: {},
  formDataSQL: {
    locationType: "JDBC",
    active: true,
    customSQLQuery: "Yes",
    dataType: "Cumulative",
  },
  formData: {
    active: true,
    locationType: "SFTP",
    delimiter: "COMMA",
    fileType: "SAS",
    encoding: "UTF-8",
    escapeCharacter: "\\",
    quote: `""`,
    headerRowNumber: 1,
    footerRowNumber: "",
    overrideStaleAlert: 3,
    rowDecreaseAllowed: 0,
    loadType: "Cumulative",
  },
  selectedDataset: {},
  defaultDelimiter: "COMMA",
  defaultEscapeCharacter: "\\",
  defaultQuote: `""`,
  defaultHeaderRowNumber: 1,
  defaultFooterRowNumber: "",
  defaultLoadType: "Cumulative",
  error: null,
  sucessMsg: null,
  datakind: [],
  VLCData: [],
  sqlColumns: [],
  sqlTables: [],
  previewSQL: [],
};

const DataFlowReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case GET_DATA_KIND:
        newState.loading = true;
        break;
      case FETCH_DATAKIND_SUCCESS:
        newState.loading = false;
        newState.datakind = action.datakind;
        break;
      case FETCH_DATAKIND_FAILURE:
        newState.loading = false;
        break;
      case SAVE_DATASET_DATA:
        newState.loading = true;
        break;

      case UPDATE_DS:
        newState.isDatasetCreation = action.status;
        break;

      case RESET_FTP_FORM:
        newState.formData = {
          active: true,
          locationType: "SFTP",
          delimiter: "COMMA",
          fileType: "SAS",
          encoding: "UTF-8",
          escapeCharacter: "\\",
          quote: `""`,
          headerRowNumber: 1,
          footerRowNumber: "",
          overrideStaleAlert: 3,
          rowDecreaseAllowed: 0,
          loadType: "Cumulative",
        };
        break;

      case RESET_JDBC_FORM:
        newState.formDataSQL = {
          locationType: "JDBC",
          active: true,
          customSQLQuery: "Yes",
          dataType: "Cumulative",
        };
        break;

      case STORE_DATASET_SUCCESS:
        newState.loading = false;
        newState.isDatasetCreated = !state.isDatasetCreated;
        newState.selectedDataset = action.values;
        if (action.values.fileType) {
          newState.formData = action.values;
        } else {
          newState.formDataSQL = action.values;
        }
        break;
      case STORE_DATASET_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        if (action.values.fileType) {
          newState.formData = action.values;
        } else {
          newState.formDataSQL = action.values;
        }
        break;
      case HIDE_ERROR_MSG:
        newState.error = null;
        newState.sucessMsg = null;
        break;
      case SAVE_DATASET_COLUMNS:
        newState.loading = true;
        break;
      case STORE_DATASET_COLUMNS_SUCCESS:
        newState.loading = false;
        newState.datasetColumns = action.datasetColumns;
        newState.isColumnsConfigured =
          action.datasetColumns.length > 0 ? true : false;
        newState.error = null;
        break;
      case STORE_DATASET_COLUMNS_FAILURE:
        newState.loading = false;
        newState.sucessMsg = null;
        newState.isColumnsConfigured = false;
        newState.error = action.message;
        break;
      case UPDATE_DATASET_SUCCESS:
        newState.loading = false;
        newState.error = null;
        newState.sucessMsg = "Dataset updated succesfully";
        break;
      case UPDATE_DATASET_FAILURE:
        newState.loading = false;
        newState.sucessMsg = null;
        newState.error = action.message;
        break;
      case GET_VLC_RULES:
        newState.loading = true;
        break;
      case FETCH_VLC_RULES_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_VLC_RULES_SUCCESS:
        newState.loading = false;
        newState.VLCData = action.VLCData;
        break;
      case GET_SQL_TABLES:
        newState.loading = true;
        break;
      case FETCH_SQL_TABLES_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_SQL_TABLES_SUCCESS:
        newState.loading = false;
        newState.sqlTables = action.sqlTables;
        break;
      case GET_PREVIEW_SQL:
        newState.loading = true;
        break;
      case FETCH_PREVIEW_SQL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_PREVIEW_SQL_SUCCESS:
        newState.loading = false;
        newState.previewSQL = action.previewSQL.flat();
        break;
      case GET_SQL_COLUMNS:
        newState.loading = true;
        break;
      case FETCH_SQL_COLUMNS_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_SQL_COLUMNS_SUCCESS:
        newState.loading = false;
        newState.sqlColumns = action.sqlColumns;
        break;
      case GET_DATASET_DETAIL:
        newState.loading = true;
        break;
      case UPDATE_DATASET_DATA:
        newState.loading = true;
        break;
      case FETCH_DATASET_DETAIL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_DATASET_DETAIL_SUCCESS:
        newState.loading = false;
        const { datasetDetail } = action;
        const {
          type,
          mnemonic,
          active,
          charset,
          delimiter,
          escapecode,
          quote,
          headerrownumber,
          footerrownumber,
          naming_convention,
          path,
          datakindid,
          data_freq,
          ovrd_stale_alert,
          rowdecreaseallowed,
          incremental,
          datasetid,
          customsql_yn,
          customsql,
          offsetcolumn,
          tbl_nm,
        } = datasetDetail;
        if (type) {
          newState.formData.fileType = type;
          newState.formData.datasetName = mnemonic;
          newState.formData.active = active === 1 ? true : false;
          newState.formData.encoding = charset;
          newState.formData.delimiter = delimiter;
          newState.formData.escapeCharacter = escapecode;
          newState.formData.quote = quote;
          newState.formData.headerRowNumber = headerrownumber;
          newState.formData.footerRowNumber = footerrownumber;
          newState.formData.fileNamingConvention = naming_convention;
          newState.formData.folderPath = path;
          newState.formData.clinicalDataType = [datakindid];
          newState.formData.transferFrequency = data_freq;
          newState.formData.overrideStaleAlert = ovrd_stale_alert;
          newState.formData.rowDecreaseAllowed = rowdecreaseallowed || 0;
          newState.formData.loadType =
            incremental === "Y" ? "Incremental" : "Cumulative";
          newState.formData.datasetid = datasetid;
        }
        if (customsql_yn) {
          newState.formDataSQL.active = active === 1 ? true : false;
          newState.formDataSQL.datasetName = mnemonic;
          newState.formDataSQL.customSQLQuery = customsql_yn;
          newState.formDataSQL.sQLQuery = customsql;
          newState.formDataSQL.offsetColumn = offsetcolumn;
          newState.formDataSQL.tableName = tbl_nm;
        }
        newState.selectedDataset = action.datasetDetail;
        break;
      case GET_DATASET_COLUMNS:
        newState.loading = true;
        break;
      case FETCH_DATASET_COLUMNS_SUCCESS:
        newState.loading = false;
        newState.datasetColumns = action.datasetColumns;
        break;
      case FETCH_DATASET_COLUMNS_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
