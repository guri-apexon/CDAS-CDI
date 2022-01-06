/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  DATAKINDAPI,
  FETCH_DATAKIND_SUCCESS,
  FETCH_DATAKIND_FAILURE,
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
