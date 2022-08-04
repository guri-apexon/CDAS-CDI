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
  UPDATE_COLUMNS_DATA,
  UPDATE_COLUMNS_FAILURE,
  UPDATE_COLUMNS_SUCCESS,
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
  RESET_FTP_FORM,
  RESET_JDBC_FORM,
  UPDATE_DS_STATUS,
  GET_LOCATION_DETAIL,
  FETCH_LOCATION_DETAIL_FAILURE,
  FETCH_LOCATION_DETAIL_SUCCESS,
  SAVE_DATASET_COLUMNS_COUNT,
  TOGGLE_DATASET_PREVIWED_SQL,
} from "../../constants";

import { dateTypeForJDBC, parseBool } from "../../utils/index";

const defaultData = {
  active: true,
  locationType: "SFTP",
  delimiter: "COMMA",
  fileType: "SAS",
  encoding: "UTF-8",
  escapeCharacter: "\\",
  quote: `'`,
  headerRowNumber: 1,
  footerRowNumber: "",
  overrideStaleAlert: 3,
  rowDecreaseAllowed: 0,
  loadType: "Cumulative",
  clinicalDataType: null,
};

const defaultDataSQL = {
  locationType: "JDBC",
  active: true,
  isCustomSQL: "Yes",
  dataType: "Cumulative",
  clinicalDataType: null,
  offsetColumn: [],
};

export const initialState = {
  loading: false,
  isDatasetCreated: false,
  isColumnsConfigured: false,
  datasetColumns: [],
  formDataSQL: {
    ...defaultDataSQL,
  },
  formData: {
    ...defaultData,
  },
  selectedDataset: {},
  defaultDelimiter: "COMMA",
  defaultEscapeCharacter: "\\",
  defaultQuote: `'`,
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
  locationDetail: {},
  dsCreatedSuccessfully: false,
  isDatasetFetched: false,
  haveHeader: false,
  CDVersionBump: true,
  dataSetRowCount: 0,
  previewedSql: false,
  datasetUpdated: false,
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
      // case PREVENT_CD_VERSION_BUMP:
      //   newState.CDVersionBump = action.flag;
      //   break;
      case SAVE_DATASET_DATA:
        newState.loading = true;
        break;
      case SAVE_DATASET_COLUMNS_COUNT:
        newState.dataSetRowCount = action.rowCount;
        break;
      case RESET_FTP_FORM:
        newState.formData = {
          ...defaultData,
        };
        newState.datasetColumns = [];
        newState.datasetUpdated = false;
        break;

      case RESET_JDBC_FORM:
        newState.formDataSQL = {
          ...defaultDataSQL,
        };
        newState.previewedSql = false;
        newState.datasetColumns = [];
        newState.sqlColumns = [];
        newState.datasetUpdated = false;
        break;

      case UPDATE_DS_STATUS:
        newState.isDatasetCreated = action.status;
        newState.dsCreatedSuccessfully = false;
        break;

      case STORE_DATASET_SUCCESS:
        newState.loading = false;
        newState.isDatasetCreated = !state.isDatasetCreated;
        newState.isDatasetFetched = true;
        const { dataset } = action;
        newState.selectedDataset = {
          ...action.values,
          datasetid: dataset.datasetid,
          customsql_yn: dataset.customsql_yn,
          customsql: dataset.customsql,
          fileType: dataset.type,
          headerrownumber: dataset.headerrownumber,
          tbl_nm: dataset.tbl_nm,
          dataset_fltr: dataset.dataset_fltr,
        };
        if (dataset.type) {
          newState.formData.fileType = dataset.type;
          newState.formData.datasetName = dataset.mnemonic;
          newState.formData.active = dataset.active === 1 ? true : false;
          newState.formData.encoding = dataset.charset;
          newState.formData.delimiter = dataset.delimiter;
          newState.formData.escapeCharacter = dataset.escapecode;
          newState.formData.quote = dataset.quote;
          newState.formData.headerRowNumber = dataset.headerrownumber;
          newState.formData.footerRowNumber = dataset.footerrownumber;
          newState.formData.fileNamingConvention = dataset.name;
          newState.formData.folderPath = dataset.path;
          newState.formData.clinicalDataType = [dataset.datakindid];
          newState.formData.transferFrequency = dataset.data_freq;
          newState.formData.overrideStaleAlert = dataset.ovrd_stale_alert;
          newState.formData.rowDecreaseAllowed =
            dataset.rowdecreaseallowed || 0;
          newState.formData.loadType =
            dataset.incremental === "Y" ? "Incremental" : "Cumulative";
          newState.formData.datasetid = dataset.datasetid;
          newState.formData.filePwd = dataset.filePwd;
          newState.haveHeader =
            parseInt(action.dataset.headerrownumber, 10) > 0;
        }
        if (dataset.customsql_yn) {
          newState.formDataSQL.active = dataset.active === 1 ? true : false;
          newState.formDataSQL.clinicalDataType = [dataset.datakindid];
          newState.formDataSQL.datasetName = dataset.mnemonic;
          newState.formDataSQL.isCustomSQL = dataset.customsql_yn;
          newState.formDataSQL.sQLQuery = dataset.customsql;
          newState.formDataSQL.offsetColumn = dataset.offsetcolumn;
          newState.formDataSQL.tableName = dataset.tbl_nm;
          newState.formDataSQL.filterCondition = dataset.dataset_fltr;
          newState.formDataSQL.dataType =
            dataset.incremental === "N" ? "Cumulative" : "Incremental";
          newState.formDataSQL.datasetid = dataset.datasetid;
          newState.haveHeader = true;
        }

        newState.dsCreatedSuccessfully = true;
        break;
      case STORE_DATASET_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        newState.isDatasetFetched = false;
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
        console.log("STORE_DATASET_COLUMNS_SUCCESS", action);
        newState.loading = false;
        newState.datasetColumns = action.datasetColumns;
        newState.selectedDataset = {
          ...state.selectedDataset,
          customsql: action.nQuery,
        };
        newState.isColumnsConfigured =
          action.datasetColumns.length > 0 ? true : false;
        newState.error = null;
        newState.sucessMsg = "Column definition was saved successfully";
        break;
      case STORE_DATASET_COLUMNS_FAILURE:
        newState.loading = false;
        newState.sucessMsg = null;
        newState.isColumnsConfigured = false;
        newState.error = action.message;
        break;
      case TOGGLE_DATASET_PREVIWED_SQL:
        newState.previewedSql = action.flag;
        break;
      case UPDATE_DATASET_SUCCESS:
        newState.loading = false;
        newState.error = null;
        const { dsUpdate } = action;
        newState.selectedDataset = {
          ...action.values,
          datasetid: dsUpdate.datasetid,
          customsql_yn: dsUpdate.customsql_yn,
          customsql: dsUpdate.customsql,
          fileType: dsUpdate.type,
          headerrownumber: dsUpdate.headerrownumber,
          tbl_nm: dsUpdate.tbl_nm,
          dataset_fltr: dsUpdate.dataset_fltr,
        };
        if (dsUpdate.type) {
          newState.formData.fileType = dsUpdate.type;
          newState.formData.datasetName = dsUpdate.mnemonic;
          newState.formData.active = dsUpdate.active === 1 ? true : false;
          newState.formData.encoding = dsUpdate.charset;
          newState.formData.delimiter = dsUpdate.delimiter;
          newState.formData.escapeCharacter = dsUpdate.escapecode;
          newState.formData.quote = dsUpdate.quote;
          newState.formData.headerRowNumber = dsUpdate.headerrownumber;
          newState.formData.footerRowNumber = dsUpdate.footerrownumber;
          newState.formData.fileNamingConvention = dsUpdate.name;
          newState.formData.folderPath = dsUpdate.path;
          newState.formData.clinicalDataType = [dsUpdate.datakindid];
          newState.formData.transferFrequency = dsUpdate.data_freq;
          newState.formData.overrideStaleAlert = dsUpdate.ovrd_stale_alert;
          newState.formData.rowDecreaseAllowed =
            dsUpdate.rowdecreaseallowed || 0;
          newState.formData.loadType =
            dsUpdate.incremental === "Y" ? "Incremental" : "Cumulative";
          newState.formData.datasetid = dsUpdate.datasetid;
          newState.formData.filePwd = dsUpdate.filePwd;
          newState.haveHeader =
            parseInt(action.dsUpdate.headerrownumber, 10) > 0;
        }
        if (dsUpdate.customsql_yn) {
          newState.formDataSQL.active = dsUpdate.active === 1 ? true : false;
          newState.formDataSQL.clinicalDataType = [dsUpdate.datakindid];
          newState.formDataSQL.datasetName = dsUpdate.mnemonic;
          newState.formDataSQL.isCustomSQL = dsUpdate.customsql_yn;
          newState.formDataSQL.sQLQuery = dsUpdate.customsql;
          newState.formDataSQL.offsetColumn = dsUpdate.offsetcolumn;
          newState.formDataSQL.tableName = dsUpdate.tbl_nm;
          newState.formDataSQL.filterCondition = dsUpdate.dataset_fltr;
          newState.formDataSQL.dataType =
            dsUpdate.incremental === "N" ? "Cumulative" : "Incremental";
          newState.formDataSQL.datasetid = dsUpdate.datasetid;
          newState.haveHeader = true;
        }
        newState.sucessMsg = "Dataset was updated succesfully";
        newState.datasetUpdated = true;
        break;
      case UPDATE_DATASET_FAILURE:
        newState.loading = false;
        newState.sucessMsg = null;
        newState.error = action.message;
        break;
      case UPDATE_COLUMNS_SUCCESS:
        newState.loading = false;
        newState.error = null;
        if (action.versionBumped) newState.CDVersionBump = false;
        newState.sucessMsg = "Column definition was updated successfully";
        break;
      case UPDATE_COLUMNS_FAILURE:
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
        newState.sqlTables = initialState.sqlTables;
        break;
      case FETCH_SQL_TABLES_SUCCESS:
        newState.loading = false;
        if (action.payload.locationType === "Hive CDH") {
          newState.sqlTables = action.sqlTables.slice(0, 20);
        } else if (action.payload.locationType === "Hive CDP") {
          newState.sqlTables = action.sqlTables.slice(0, 20);
        } else {
          newState.sqlTables = action.sqlTables;
        }
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
        newState.datasetColumns = [];
        break;
      case FETCH_SQL_COLUMNS_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_SQL_COLUMNS_SUCCESS:
        newState.loading = false;
        newState.sqlColumns = action.sqlColumns.map((e) => {
          e.dataType = dateTypeForJDBC(e.datatype);
          e.primaryKey = parseBool(e.primaryKey || "false");
          e.required = parseBool(e.required || "false");
          e.unique = parseBool(e.unique || "false");
          return e;
        });
        console.log("action.sqlColumns", action.sqlColumns);
        newState.sqlColumns = action.sqlColumns;
        break;
      case GET_DATASET_DETAIL:
        newState.loading = true;
        newState.datasetUpdated = false;
        break;
      case UPDATE_DATASET_DATA:
        newState.loading = true;
        newState.datasetUpdated = false;
        break;
      case UPDATE_COLUMNS_DATA:
        newState.loading = true;
        break;
      case FETCH_DATASET_DETAIL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        newState.isDatasetFetched = false;
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
          name,
          path,
          datakindid,
          data_freq,
          ovrd_stale_alert,
          rowdecreaseallowed,
          incremental,
          datasetid,
          file_pwd,
          customsql_yn,
          customsql,
          offsetcolumn,
          dataset_fltr,
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
          newState.formData.fileNamingConvention = name;
          newState.formData.folderPath = path;
          newState.formData.clinicalDataType = [datakindid];
          newState.formData.transferFrequency = data_freq;
          newState.formData.overrideStaleAlert = ovrd_stale_alert;
          newState.formData.rowDecreaseAllowed = rowdecreaseallowed || 0;
          newState.formData.filePwd = file_pwd;
          newState.formData.loadType =
            incremental === "Y" ? "Incremental" : "Cumulative";
          newState.formData.datasetid = datasetid;
          newState.haveHeader = parseInt(headerrownumber, 10) > 0;
        }
        if (customsql_yn) {
          newState.formDataSQL.active = active === 1 ? true : false;
          newState.formDataSQL.clinicalDataType = [datakindid];
          newState.formDataSQL.datasetName = mnemonic;
          newState.formDataSQL.isCustomSQL = customsql_yn;
          newState.formDataSQL.sQLQuery = customsql;
          newState.formDataSQL.offsetColumn = offsetcolumn;
          newState.formDataSQL.tableName = tbl_nm;
          newState.formDataSQL.filterCondition = dataset_fltr;
          newState.formDataSQL.dataType =
            incremental === "N" ? "Cumulative" : "Incremental";
          newState.formDataSQL.datasetid = datasetid;
          newState.haveHeader = true;
        }

        newState.isDatasetFetched = true;
        newState.selectedDataset = { ...datasetDetail };
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

      case GET_LOCATION_DETAIL:
        newState.loading = true;
        break;
      case FETCH_LOCATION_DETAIL_SUCCESS:
        newState.loading = false;
        newState.locationDetail = action.locationDetail;
        break;
      case FETCH_LOCATION_DETAIL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;

      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
