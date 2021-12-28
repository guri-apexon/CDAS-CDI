import { put, call } from "redux-saga/effects";
import axios from "axios";

import {
  baseURL,
  FETCH_LOCATION_SUCCESS,
  FETCH_LOCATION_FAILURE,
  FETCH_VENDOR_SUCCESS,
  FETCH_VENDOR_FAILURE,
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

export function* fetchLocationsData() {
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${LOCATIONAPI}/list`,
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
