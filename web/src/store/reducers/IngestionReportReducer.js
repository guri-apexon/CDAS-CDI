/* eslint-disable import/prefer-default-export */
import produce from "immer";
import {
  FETCH_DATASET_PROPERTIES_FAILURE,
  FETCH_DATASET_PROPERTIES_SUCCESS,
  FETCH_TRANSFER_LOG_FAILURE,
  FETCH_TRANSFER_LOG_SUCCESS,
  GET_DATASET_PROPERTIES,
  GET_TRANSFER_LOG,
} from "../../constants";

export const initialState = {
  loading: false,
  transferLogs: [],
  datasetProperties: {},
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
      default:
        newState.loading = false;
        break;
    }
  });

export default IngestionReportReducer;
