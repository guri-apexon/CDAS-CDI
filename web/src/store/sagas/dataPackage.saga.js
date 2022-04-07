import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  PACKAGES_SEARCH,
  PACKAGES_LIST_SUCCESS,
  PACKAGES_LIST_FAILURE,
  ADD_PACKAGE,
  ADD_PACKAGE_SUCCESS,
  UPDATE_PACKAGE,
  UPDATE_DATA_PACKAGE_SUCCESS,
  DELETE_PACKAGE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchPackagesData(params) {
  try {
    console.log("fetchPackagesData:", params.dfId);
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${PACKAGES_SEARCH}/${params.dfId}/${params.searchQuery}`,
      {}
    );
    yield put({
      type: PACKAGES_LIST_SUCCESS,
      packagesData: fetchData.data.data,
    });
  } catch (e) {
    yield put({ type: PACKAGES_LIST_FAILURE, message: e.message });
  }
}

export function* addDataPackage(params) {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${ADD_PACKAGE}`,
      params.packageData
    );

    yield put({
      type: ADD_PACKAGE_SUCCESS,
      refreshData: true,
    });
  } catch (e) {
    yield put({ type: PACKAGES_LIST_FAILURE, message: e.message });
  }
}

export function* updateDataPackage(params) {
  try {
    let fetchData;
    if (params.update_action === "DELETE") {
      fetchData = yield call(
        axios.post,
        `${baseURL}/${DELETE_PACKAGE}`,
        params.payload
      );
    } else {
      fetchData = yield call(
        axios.post,
        `${baseURL}/${UPDATE_PACKAGE}`,
        params.payload
      );
    }

    yield put({
      type: UPDATE_DATA_PACKAGE_SUCCESS,
      response: fetchData.data,
    });
  } catch (e) {
    yield put({ type: PACKAGES_LIST_FAILURE, message: e.message });
  }
}
