import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  PACKAGES_SEARCH,
  PACKAGES_LIST_SUCCESS,
  PACKAGES_LIST_FAILURE,
  ADD_PACKAGE,
  ADD_PACKAGE_SUCCESS,
  FETCH_PACKAGE_PASSWORD_SUCCESS,
  FETCH_PACKAGE_PASSWORD_FAILURE,
  DATAPACKAGEPASSWORD,
  UPDATE_PACKAGE,
  UPDATE_DATA_PACKAGE_SUCCESS,
  DELETE_PACKAGE,
  UPDATE_DATA_PACKAGE_FAILURE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchPackagesData(params) {
  try {
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

export function* fetchPackagepassword(action) {
  try {
    const fetchSBData = yield call(
      axios.get,
      `${baseURL}/${DATAPACKAGEPASSWORD}/${action.val}/${action.id}`,
      {}
    );
    yield put({
      type: FETCH_PACKAGE_PASSWORD_SUCCESS,
      packageSODPassword: fetchSBData.data.data.password,
    });
  } catch (e) {
    yield put({ type: FETCH_PACKAGE_PASSWORD_FAILURE, message: e.message });
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
    yield put({
      type: UPDATE_DATA_PACKAGE_FAILURE,
      message: e.response?.data?.message || "Something went wrong",
    });
  }
}
