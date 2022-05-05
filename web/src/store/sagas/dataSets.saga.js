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
  FETCH_DATASET_DETAIL_FAILURE,
  FETCH_DATASET_DETAIL_SUCCESS,
  UPDATE_DATASET_SUCCESS,
  UPDATE_DATASET_FAILURE,
  UPDATE_COLUMNS_SUCCESS,
  UPDATE_COLUMNS_FAILURE,
  FETCH_DATASET_COLUMNS_SUCCESS,
  FETCH_DATASET_COLUMNS_FAILURE,
  VLCDATAAPI,
  FETCH_VLC_RULES_SUCCESS,
  FETCH_VLC_RULES_FAILURE,
  SQLTABLESAPI,
  FETCH_SQL_TABLES_SUCCESS,
  FETCH_SQL_TABLES_FAILURE,
  SQLCOLUMNSAPI,
  FETCH_SQL_COLUMNS_FAILURE,
  FETCH_SQL_COLUMNS_SUCCESS,
  PREVIEWSQLAPI,
  FETCH_PREVIEW_SQL_FAILURE,
  FETCH_PREVIEW_SQL_SUCCESS,
  COLUMNSAPI,
  LOCATIONAPI,
  FETCH_LOCATION_DETAIL_FAILURE,
  FETCH_LOCATION_DETAIL_SUCCESS,
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

export function* fetchVLCData() {
  try {
    const fetchVlcData = yield call(axios.post, `${baseURL}/${VLCDATAAPI}`, {});
    // console.log("VLC", fetchVlcData);
    yield put({
      type: FETCH_VLC_RULES_SUCCESS,
      VLCData: fetchVlcData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_VLC_RULES_FAILURE, message: e.message });
  }
}

export function* fetchSQLTables(action) {
  try {
    const fetchSQLTable = yield call(axios.post, `${baseURL}/${SQLTABLESAPI}`, {
      ...action.payload,
    });
    yield put({
      type: FETCH_SQL_TABLES_SUCCESS,
      sqlTables: fetchSQLTable.data.data,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: FETCH_SQL_TABLES_FAILURE,
      message: e.response?.data?.message || e.message,
    });
  }
}

export function* fetchSQLColumns(action) {
  try {
    const getColumns = yield call(axios.post, `${baseURL}/${SQLCOLUMNSAPI}`, {
      ...action.payload,
    });
    yield put({
      type: FETCH_SQL_COLUMNS_SUCCESS,
      sqlColumns: getColumns.data.data,
      payload: action.payload,
    });
  } catch (e) {
    yield put({ type: FETCH_SQL_COLUMNS_FAILURE, message: e.message });
  }
}

export function* fetchPreviewSQL(action) {
  try {
    const fetchSqlData = yield call(axios.post, `${baseURL}/${PREVIEWSQLAPI}`, {
      ...action.payload,
    });
    yield put({
      type: FETCH_PREVIEW_SQL_SUCCESS,
      previewSQL: fetchSqlData.data.data,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: FETCH_PREVIEW_SQL_FAILURE,
      message: e.response?.data?.message || e.message,
    });
  }
}

export function* fetchDatasetDetail(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/detail/${action.dsId}`,
      { ...action }
    );
    yield put({
      type: FETCH_DATASET_DETAIL_SUCCESS,
      datasetDetail: fetchSBData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: FETCH_DATASET_DETAIL_FAILURE, message: errText });
  }
}

export function* fetchDatasetColumns(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${COLUMNSAPI}/list`,
      { datasetid: action.dsId }
    );
    yield put({
      type: FETCH_DATASET_COLUMNS_SUCCESS,
      datasetColumns: fetchSBData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: FETCH_DATASET_COLUMNS_FAILURE, message: errText });
  }
}

export function* saveDataset(action) {
  try {
    const saveData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/create`,
      action.values
    );
    yield put({
      type: STORE_DATASET_SUCCESS,
      dataset: saveData.data.data,
      values: action.values,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    console.log(e.response, "erroRes");
    yield put({
      type: STORE_DATASET_FAILURE,
      message: errText,
      values: action.values,
    });
  }
}

export function* updateDataset(action) {
  try {
    const saveData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/update`,
      action.values
    );
    yield put({
      type: UPDATE_DATASET_SUCCESS,
      dsUpdate: saveData.data.data,
      values: action.values,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({
      type: UPDATE_DATASET_FAILURE,
      message: errText,
      values: action.values,
    });
  }
}

export function* saveDatasetColumns(action) {
  try {
    const saveData = yield call(axios.post, `${baseURL}/${COLUMNSAPI}/create`, {
      ...action,
    });

    yield put({
      type: STORE_DATASET_COLUMNS_SUCCESS,
      datasetColumns: saveData.data.data,
      nQuery: action.nQuery,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: STORE_DATASET_COLUMNS_FAILURE, message: errText });
  }
}

export function* updateDatasetColumns(action) {
  try {
    const saveData = yield call(axios.post, `${baseURL}/${COLUMNSAPI}/update`, {
      ...action,
    });
    yield put({
      type: UPDATE_COLUMNS_SUCCESS,
      update: saveData.data.data,
      values: action.values,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({
      type: UPDATE_COLUMNS_FAILURE,
      message: errText,
      values: action.values,
    });
  }
}

export function* getLocationDetails(action) {
  try {
    const getData = yield call(
      axios.get,
      `${baseURL}/${LOCATIONAPI}/detail/${action.id}`
    );
    yield put({
      type: FETCH_LOCATION_DETAIL_SUCCESS,
      locationDetail: getData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({
      type: FETCH_LOCATION_DETAIL_FAILURE,
      message: errText,
    });
  }
}
