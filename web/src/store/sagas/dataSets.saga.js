/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  DATAKINDAPI,
  DATASETAPI,
  FETCH_DATAKIND_SUCCESS,
  FETCH_DATAKIND_FAILURE,
  STORE_DATASET_SUCCESS,
  STORE_DATASET_FAILURE,
  STORE_DATASET_COLUMNS_SUCCESS,
  STORE_DATASET_COLUMNS_FAILURE,
} from "../../constants";

export function* fetchDataKindData(action = null) {
  let param = "";
  if (action.value) {
    param = `type=${action.value}`;
  }
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${DATAKINDAPI}/list?${param}`,
      {}
    );

    // console.log("study", fetchSBData);
    yield put({
      type: FETCH_DATAKIND_SUCCESS,
      datakind: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_DATAKIND_FAILURE, message: e.message });
  }
}

export function* saveDataset(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/create`,
      action.values
    );

    // console.log("study", fetchSBData);
    yield put({
      type: STORE_DATASET_SUCCESS,
      dataset: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: STORE_DATASET_FAILURE, message: e.message });
  }
}

export function* saveDatasetColumns(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/create-columns`,
      action.values
    );
    // console.log("study", fetchSBData);
    yield put({
      type: STORE_DATASET_COLUMNS_SUCCESS,
      datasetColumns: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: STORE_DATASET_COLUMNS_FAILURE, message: e.message });
  }
}
