/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  DATAKINDAPI,
  FETCH_CDT_LIST_FAILURE,
  FETCH_CDT_LIST_SUCCESS,
  LOCATIONAPI,
  UPDATE_LOCATION_SUCCESS,
  UPDATE_LOCATION_FAILURE,
} from "../../constants";

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

export function* updateLocationData(action) {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${LOCATIONAPI}/update`,
      action.values
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
