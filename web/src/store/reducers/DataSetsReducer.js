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
} from "../../constants";

export const initialState = {
  loading: false,
  createTriggered: false,
  datasetColumns: [],
  formData: {
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
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
