/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
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
      `${baseURL}/${INGESTIONREPORTAPI}/properties/${action.datasetId}`
    );
    yield put({
      type: FETCH_DATASET_PROPERTIES_SUCCESS,
      properties: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({ type: FETCH_DATASET_PROPERTIES_FAILURE, message: e.message });
  }
}
