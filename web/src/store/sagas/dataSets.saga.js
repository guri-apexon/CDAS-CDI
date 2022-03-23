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

export function* fetchSQLTables() {
  try {
    const fetchSQLTable = yield call(
      axios.post,
      `${baseURL}/${SQLTABLESAPI}`,
      {}
    );
    // console.log("fetchSQLTables", fetchSQLTables);
    yield put({
      type: FETCH_SQL_TABLES_SUCCESS,
      sqlTables: fetchSQLTable.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_SQL_TABLES_FAILURE, message: e.message });
  }
}

export function* fetchSQLColumns(action) {
  try {
    const getColumns = yield call(axios.post, `${baseURL}/${SQLCOLUMNSAPI}`, {
      tableName: action.tableName,
    });
    // console.log("fetchSQLColumns", getColumns);
    yield put({
      type: FETCH_SQL_COLUMNS_SUCCESS,
      sqlColumns: getColumns.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_SQL_COLUMNS_FAILURE, message: e.message });
  }
}

export function* fetchPreviewSQL(action) {
  try {
    const fetchPreviewSQLData = yield call(
      axios.post,
      `${baseURL}/${PREVIEWSQLAPI}`,
      { query: action.query }
    );
    // console.log("fetchPreviewSQLData", fetchPreviewSQLData);
    yield put({
      type: FETCH_PREVIEW_SQL_SUCCESS,
      previewSQL: fetchPreviewSQLData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_PREVIEW_SQL_FAILURE, message: e.message });
  }
}

export function* saveDataset(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/create`,
      action.values
    );
    yield put({
      type: STORE_DATASET_SUCCESS,
      dataset: fetchSBData.data.data,
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

export function* saveDatasetColumns(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${COLUMNSAPI}/create/${action.datasetid}`,
      action.values
    );
    // console.log("study", fetchSBData);
    yield put({
      type: STORE_DATASET_COLUMNS_SUCCESS,
      datasetColumns: fetchSBData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: STORE_DATASET_COLUMNS_FAILURE, message: errText });
  }
}

export function* fetchDatasetDetail(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/detail/${action.datasetid}`,
      {
        selectedDFId: action.selectedDFId,
        datapackageid: action.datapackageid,
      }
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

export function* updateDataset(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${DATASETAPI}/update`,
      action.values
    );
    yield put({
      type: UPDATE_DATASET_SUCCESS,
      update: fetchSBData.data.data,
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

export function* fetchDatasetColumns(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${COLUMNSAPI}/list`,
      {
        datasetid: action.datasetid,
      }
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
