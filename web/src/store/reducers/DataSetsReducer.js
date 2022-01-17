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
  SAVE_DATASET_COLUMNS,
  STORE_DATASET_COLUMNS_SUCCESS,
  STORE_DATASET_COLUMNS_FAILURE,
  GET_DATASET_DETAIL,
  FETCH_DATASET_DETAIL_FAILURE,
  FETCH_DATASET_DETAIL_SUCCESS,
  UPDATE_DATASET_SUCCESS,
  UPDATE_DATASET_FAILURE,
  UPDATE_DATASET_DATA,
} from "../../constants";

export const initialState = {
  loading: false,
  createTriggered: false,
  datasetColumns: [],
  datasetDetail: {},
  formDataSQL: {
    locationType: "JDBC",
    active: true,
    customSQLQuery: "Yes",
    dataType: "Cumulative",
    offsetColumn: "Disabled",
  },
  formData: {
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
  },
  selectedDataset: {},
  defaultDelimiter: "COMMA",
  defaultEscapeCharacter: "\\",
  defaultQuote: `""`,
  defaultHeaderRowNumber: 1,
  defaultFooterRowNumber: "",
  error: null,
  sucessMsg: null,
  datakind: [],
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
      case STORE_DATASET_SUCCESS:
        newState.loading = false;
        newState.createTriggered = !state.createTriggered;
        newState.selectedDataset = action.dataset;
        break;
      case STORE_DATASET_FAILURE:
        newState.loading = false;
        newState.error = action.message;
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
        newState.error = null;
        newState.sucessMsg = "Dataset Columns created succesfully";
        break;
      case STORE_DATASET_COLUMNS_FAILURE:
        newState.loading = false;
        newState.sucessMsg = null;
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
        // eslint-disable-next-line no-case-declarations
        const { datasetDetail } = action;
        // eslint-disable-next-line no-case-declarations
        const {
          type,
          mnemonic,
          active,
          charset,
          delimitier,
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
          datasetid,
        } = datasetDetail;
        if (type) {
          newState.formData.fileType = type;
          newState.formData.datasetName = mnemonic;
          newState.formData.active = active === 1 ? true : false;
          newState.formData.encoding = charset;
          newState.formData.delimiter = delimitier;
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
          newState.formData.datasetid = datasetid;
        }
        newState.dataFlowdetail = action.datasetDetail;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
