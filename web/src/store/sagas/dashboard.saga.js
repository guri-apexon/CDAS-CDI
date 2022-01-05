import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  DASHBOARD_DATA_FETCH,
  DASHBOARD_FETCH_SUCCESS,
  DASHBOARD_FETCH_FAILUR,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchdashboardData(protocolId) {
  try {
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${DASHBOARD_DATA_FETCH}/${protocolId}`
    );

    // console.log("study", fetchDBData);
    yield put({
      type: DASHBOARD_FETCH_SUCCESS,
      studyboardData: fetchDBData.data.data.studyData,
      vendors: fetchDBData.data.data.vendors,
      dataFlows: fetchDBData.data.data.dataFlows,
      dataSets: fetchDBData.data.data.dataSets,
    });
  } catch (e) {
    yield put({ type: DASHBOARD_FETCH_FAILUR, message: e.message });
  }
}
