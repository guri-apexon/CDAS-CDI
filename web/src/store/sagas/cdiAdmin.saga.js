/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  DATAKINDAPI,
  FETCH_CDT_LIST_FAILURE,
  FETCH_CDT_LIST_SUCCESS,
  LOCATIONAPI,
  STORE_LOCATION_SUCCESS,
  STORE_LOCATION_FAILURE,
  UPDATE_LOCATION_SUCCESS,
  UPDATE_LOCATION_FAILURE,
} from "../../constants";
import { getCookie } from "../../utils";

const userId = getCookie("user.id");
const config = { headers: { userId } };
export function* fetchCDTList() {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${DATAKINDAPI}/table/list`
    );
    // console.log("data", fetchData);
    yield put({
      type: FETCH_CDT_LIST_SUCCESS,
      cdtList: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({ type: FETCH_CDT_LIST_FAILURE, message: e.message });
  }
}

export function* saveLocationData(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${LOCATIONAPI}/create`,
      action.values,
      config
    );

    // console.log("study", fetchSBData);
    yield put({
      type: STORE_LOCATION_SUCCESS,
      location: fetchSBData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: STORE_LOCATION_FAILURE, message: errText });
  }
}

export function* updateLocationData(action) {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${LOCATIONAPI}/update`,
      action.values,
      config
    );
    yield put({
      type: UPDATE_LOCATION_SUCCESS,
      cdtList: fetchData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: UPDATE_LOCATION_FAILURE, message: errText });
  }
}
