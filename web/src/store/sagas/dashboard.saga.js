import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  FLOW_DATA_FETCH,
  GET_DATA_FLOW_LIST_SUCCESS,
  GET_DATA_FLOW_LIST_FAILURE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchFlowData(payload) {
  // console.log("before", payload.protocolId);
  try {
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${FLOW_DATA_FETCH}/${payload.protocolId}`
    );

    console.log("study", fetchDBData);
    yield put({
      type: GET_DATA_FLOW_LIST_SUCCESS,
      flowData: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({ type: GET_DATA_FLOW_LIST_FAILURE, message: e.message });
  }
}
