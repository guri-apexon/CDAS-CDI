import { put, call } from "redux-saga/effects";
import axios from "axios";

import {
  baseURL,
  FETCH_LOCATION_SUCCESS,
  FETCH_LOCATION_FAILURE,
  FETCH_VENDOR_SUCCESS,
  FETCH_VENDOR_FAILURE,
  FETCH_SERVICE_OWNERS_SUCCESS,
  STORE_LOCATION_SUCCESS,
  STORE_LOCATION_FAILURE,
  FETCH_SERVICE_OWNERS_FAILURE,
  LOCATIONAPI,
  VENDORAPI,
} from "../../constants";

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

    // console.log("study", fetchSBData);
    yield put({
      type: FETCH_LOCATION_SUCCESS,
      locations: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: FETCH_LOCATION_FAILURE, message: e.message });
  }
}

export function* saveLocationData(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${LOCATIONAPI}/create`,
      action.values
    );

    // console.log("study", fetchSBData);
    yield put({
      type: STORE_LOCATION_SUCCESS,
      location: fetchSBData.data.data,
    });
  } catch (e) {
    yield put({ type: STORE_LOCATION_FAILURE, message: e.message });
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
