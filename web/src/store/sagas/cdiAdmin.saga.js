/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  DATAKINDAPI,
  FETCH_CDT_LIST_FAILURE,
  FETCH_CDT_LIST_SUCCESS,
} from "../../constants";

export function* fetchCDTList() {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${DATAKINDAPI}/table/list`
    );
    const logs = fetchData.data?.data?.data || [];
    yield put({
      type: FETCH_CDT_LIST_FAILURE,
      auditLogs: logs,
    });
  } catch (e) {
    yield put({ type: FETCH_CDT_LIST_SUCCESS, message: e.message });
  }
}
