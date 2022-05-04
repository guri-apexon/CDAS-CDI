import { put, call } from "redux-saga/effects";
import axios from "axios";

import {
  baseURL,
  FETCH_LOCATION_SUCCESS,
  FETCH_LOCATION_FAILURE,
  FETCH_VENDOR_SUCCESS,
  FETCH_VENDOR_FAILURE,
  FETCH_SERVICE_OWNERS_SUCCESS,
  FETCH_SERVICE_OWNERS_FAILURE,
  LOCATIONAPI,
  VENDORAPI,
  DATAFLOWAPI,
  FETCH_DATAFLOW_DETAIL_FAILURE,
  FETCH_DATAFLOW_DETAIL_SUCCESS,
  DATAFLOW_UPDATE_API,
  ADD_DATAFLOW_SUCCESS,
  ADD_DATAFLOW_FAILURE,
} from "../../constants";

export function* addDataFlow(params) {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${DATAFLOW_UPDATE_API}`,
      params.dataflow
    );

    yield put({
      type: ADD_DATAFLOW_SUCCESS,
      refreshData: true,
    });
  } catch (e) {
    yield put({ type: ADD_DATAFLOW_FAILURE, message: e.message });
  }
}

export function* fetchVendorsData() {
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${VENDORAPI}/list`,
      {}
    );

    // console.log("study", fetchSBData);
    yield put({
      type: FETCH_VENDOR_SUCCESS,
      vendors: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_VENDOR_FAILURE, message: e.message });
  }
}

export function* fetchLocationsData(action = null) {
  let param = "";
  if (action.value) {
    param = `type=${action.value}`;
  }
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${LOCATIONAPI}/list?${param}`,
      {}
    );

    yield put({
      type: FETCH_LOCATION_SUCCESS,
      locations: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_LOCATION_FAILURE, message: e.message });
  }
}

export function* fetchServiceOwnersData() {
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${LOCATIONAPI}/service_owners`,
      {}
    );
    yield put({
      type: FETCH_SERVICE_OWNERS_SUCCESS,
      serviceOwners: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_SERVICE_OWNERS_FAILURE, message: e.message });
  }
}

export function* fetchDataflowDetail(action) {
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${DATAFLOWAPI}/detail/${action.dataflowId}`,
      {}
    );
    yield put({
      type: FETCH_DATAFLOW_DETAIL_SUCCESS,
      dataflowDetail: fetchSBData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: FETCH_DATAFLOW_DETAIL_FAILURE, message: errText });
  }
}
