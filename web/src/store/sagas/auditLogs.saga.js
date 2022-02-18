/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  AUDIT_LOGS_FETCH,
  AUDIT_LOGS_SUCCESS,
  AUDIT_LOGS_FAILURE,
} from "../../constants";

export function* fetchAuditLogs(params) {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${AUDIT_LOGS_FETCH}/${params.dataflowId}`
    );
    const logs = fetchData.data?.data?.data || [];
    yield put({
      type: AUDIT_LOGS_SUCCESS,
      auditLogs: logs,
    });
  } catch (e) {
    yield put({ type: AUDIT_LOGS_FAILURE, message: e.message });
  }
}
