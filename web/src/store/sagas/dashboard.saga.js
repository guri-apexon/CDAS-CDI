import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  FLOW_DATA_FETCH,
  STUDYAPI,
  GET_DATA_FLOW_LIST_SUCCESS,
  GET_DATA_FLOW_LIST_FAILURE,
  GET_DATASET_INGESTION_SUMMARY_SUCCESS,
  GET_DATASET_INGESTION_SUMMARY_FAILURE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchFlowData(payload) {
  // console.log("before", payload.protocolId);
  try {
    const fetchDBData = yield call(
      axios.post,
      `${baseURL}/${FLOW_DATA_FETCH}`,
      { protocolId: payload.protocolId }
    );

    // console.log("study", fetchDBData);
    yield put({
      type: GET_DATA_FLOW_LIST_SUCCESS,
      flowData: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({ type: GET_DATA_FLOW_LIST_FAILURE, message: e.message });
  }
}

export function* fetchDatasetIngestionSummaryData(payload) {
  // console.log("before", payload.protocolId);
  try {
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${STUDYAPI}/datasetIngestionDetail/${payload.protocolId}`,
      {}
    );

    // console.log("study", fetchDBData);
    yield put({
      type: GET_DATASET_INGESTION_SUMMARY_SUCCESS,
      ingestionData: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({
      type: GET_DATASET_INGESTION_SUMMARY_FAILURE,
      message: e.message,
    });
  }
}
