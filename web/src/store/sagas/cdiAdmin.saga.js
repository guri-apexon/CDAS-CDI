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
  SETTINGAPI,
  CREARE_SETTINGS_SUCCESS,
  CREARE_SETTINGS_FAILURE,
  UPDATE_SETTINGS_SUCCESS,
  UPDATE_SETTINGS_FAILURE,
  FETCH_SETTINGS_SUCCESS,
  FETCH_SETTINGS_FAILURE,
  LOCATIONPASSWORDAPI,
  FETCH_LOCATION_PASSWORD_FAILURE,
  FETCH_LOCATION_PASSWORD_SUCCESS,
} from "../../constants";
import { getUserId } from "../../utils";

const userId = getUserId();
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

export function* fetchSettingsList(action = "") {
  try {
    const fetchData = action?.search
      ? yield call(
          axios.get,
          `${baseURL}/${SETTINGAPI}/search-settings/${action.search}`
        )
      : yield call(axios.get, `${baseURL}/${SETTINGAPI}/list`);
    yield put({
      type: FETCH_SETTINGS_SUCCESS,
      settings: fetchData.data?.data || [],
    });
  } catch (e) {
    yield put({ type: FETCH_SETTINGS_FAILURE, message: e.message });
  }
}

export function* saveLocationData(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${LOCATIONAPI}/create`,
      { ...action.values, userId }
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
      `${baseURL}/${LOCATIONAPI}/create`,
      { ...action.values, userId }
    );
    yield put({
      type: UPDATE_LOCATION_SUCCESS,
      location: fetchData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: UPDATE_LOCATION_FAILURE, message: errText });
  }
}

export function* createSettingsData(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${SETTINGAPI}/create`,
      { ...action.values, userId }
    );

    // console.log("study", fetchSBData);
    yield put({
      type: CREARE_SETTINGS_SUCCESS,
      setting: fetchSBData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: CREARE_SETTINGS_FAILURE, message: errText });
  }
}

export function* updateSettingsData(action) {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${SETTINGAPI}/update`,
      { ...action.values, userId }
    );
    yield put({
      type: UPDATE_SETTINGS_SUCCESS,
      setting: fetchData.data.data,
    });
  } catch (e) {
    const errText = e.response?.data?.message
      ? e.response.data.message
      : e.message;
    yield put({ type: UPDATE_SETTINGS_FAILURE, message: errText });
  }
}

export function* fetchLocationspassword(action) {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${LOCATIONPASSWORDAPI}/${action.id}`,
      {}
    );
    yield put({
      type: FETCH_LOCATION_PASSWORD_SUCCESS,
      locationPassword: fetchSBData.data.data.password,
    });
  } catch (e) {
    yield put({ type: FETCH_LOCATION_PASSWORD_FAILURE, message: e.message });
  }
}
