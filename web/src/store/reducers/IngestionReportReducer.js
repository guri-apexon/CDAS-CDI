/* eslint-disable import/prefer-default-export */
import produce from "immer";
import {
  FETCH_DATASET_INGESTION_FILE_HISTORY_FAILURE,
  FETCH_DATASET_INGESTION_FILE_HISTORY_SUCCESS,
  FETCH_DATASET_INGESTION_ISSUE_TYPES_FAILURE,
  FETCH_DATASET_INGESTION_ISSUE_TYPES_SUCCESS,
  FETCH_DATASET_INGESTION_TRANSFER_LOG_SUCCESS,
  FETCH_DATASET_INGESTION_TRANSFER_LOG_FAILURE,
  FETCH_DATASET_PROPERTIES_FAILURE,
  FETCH_DATASET_PROPERTIES_SUCCESS,
  FETCH_TRANSFER_LOG_FAILURE,
  FETCH_TRANSFER_LOG_SUCCESS,
  GET_DATASET_INGESTION_FILE_HISTORY,
  GET_DATASET_INGESTION_ISSUE_TYPES,
  GET_DATASET_INGESTION_TRANSFER_LOG,
  GET_DATASET_PROPERTIES,
  GET_TRANSFER_LOG,
} from "../../constants";

export const initialState = {
  loading: false,
  historyloading: false,
  issuetypeloading: false,
  transferLogs: [],
  datasetProperties: {},
  issuetypes: [],
  filehistory: [],
  transferHistory: [],
};

const IngestionReportReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case GET_TRANSFER_LOG:
        newState.loading = true;
        break;
      case FETCH_TRANSFER_LOG_SUCCESS:
        newState.loading = false;
        newState.transferLogs = action.transferLogs;
        break;
      case FETCH_TRANSFER_LOG_FAILURE:
        newState.loading = false;
        break;
      case GET_DATASET_PROPERTIES:
        newState.loading = true;
        break;
      case FETCH_DATASET_PROPERTIES_SUCCESS:
        newState.loading = false;
        newState.datasetProperties = action.properties;
        break;
      case FETCH_DATASET_PROPERTIES_FAILURE:
        newState.loading = false;
        break;
      case GET_DATASET_INGESTION_ISSUE_TYPES:
        newState.issuetypeloading = true;
        break;
      case FETCH_DATASET_INGESTION_ISSUE_TYPES_SUCCESS:
        newState.issuetypeloading = false;
        newState.issuetypes = action.issuetypes;
        break;
      case FETCH_DATASET_INGESTION_ISSUE_TYPES_FAILURE:
        newState.issuetypeloading = false;
        break;
      case GET_DATASET_INGESTION_FILE_HISTORY:
        newState.historyloading = true;
        break;
      case FETCH_DATASET_INGESTION_FILE_HISTORY_SUCCESS:
        newState.historyloading = false;
        newState.filehistory = action.filehistory;
        break;
      case FETCH_DATASET_INGESTION_FILE_HISTORY_FAILURE:
        newState.historyloading = false;
        break;
      case GET_DATASET_INGESTION_TRANSFER_LOG:
        newState.historyloading = true;
        break;
      case FETCH_DATASET_INGESTION_TRANSFER_LOG_SUCCESS:
        newState.historyloading = false;
        newState.transferHistory = action.transferHistory;
        break;
      case FETCH_DATASET_INGESTION_TRANSFER_LOG_FAILURE:
        newState.historyloading = false;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default IngestionReportReducer;
