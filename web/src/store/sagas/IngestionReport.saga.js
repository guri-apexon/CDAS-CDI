/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  FETCH_DATASET_INGESTION_FILE_HISTORY_FAILURE,
  FETCH_DATASET_INGESTION_FILE_HISTORY_SUCCESS,
  FETCH_DATASET_INGESTION_ISSUE_TYPES_FAILURE,
  FETCH_DATASET_INGESTION_ISSUE_TYPES_SUCCESS,
  FETCH_DATASET_PROPERTIES_FAILURE,
  FETCH_DATASET_PROPERTIES_SUCCESS,
  FETCH_TRANSFER_LOG_FAILURE,
  FETCH_TRANSFER_LOG_SUCCESS,
  INGESTIONREPORTAPI,
} from "../../constants";

export function* fetchTransferLog(action) {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${INGESTIONREPORTAPI}/transferlog/${action.datasetId}`
    );
    yield put({
      type: FETCH_TRANSFER_LOG_SUCCESS,
      transferLogs: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({ type: FETCH_TRANSFER_LOG_FAILURE, message: e.message });
  }
}

export function* fetchProperties(action) {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${INGESTIONREPORTAPI}/metrics/${action.datasetId}`
    );
    yield put({
      type: FETCH_DATASET_PROPERTIES_SUCCESS,
      properties: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({ type: FETCH_DATASET_PROPERTIES_FAILURE, message: e.message });
  }
}

export function* fetchDatasetIngestionIssueTypes(action) {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${INGESTIONREPORTAPI}/issuetypes/${action.datasetId}`
    );
    yield put({
      type: FETCH_DATASET_INGESTION_ISSUE_TYPES_SUCCESS,
      issuetypes: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({
      type: FETCH_DATASET_INGESTION_ISSUE_TYPES_FAILURE,
      message: e.message,
    });
  }
}

export function* fetchDatasetIngestionFileHistory(action) {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${INGESTIONREPORTAPI}/transferhistory/${action.datasetId}${
        // eslint-disable-next-line prefer-template
        action.days ? "?dayFilter=" + action.days : ""
      }`
    );
    yield put({
      type: FETCH_DATASET_INGESTION_FILE_HISTORY_SUCCESS,
      filehistory: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({
      type: FETCH_DATASET_INGESTION_FILE_HISTORY_FAILURE,
      message: e.message,
    });
  }
}
