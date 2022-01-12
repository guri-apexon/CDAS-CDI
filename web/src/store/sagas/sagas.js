import { takeEvery, takeLatest } from "redux-saga/effects";
import {
  ADD_DATA_PACKAGE,
  PACKAGES_LIST,
  DASHBOARD_DATA,
  UPDATE_DATA_PACKAGE,
  GET_VENDORS_DATA,
  SAVE_LOCATION_DATA,
  GET_DATA_KIND,
  GET_LOCATIONS_DATA,
  GET_SERVICE_OWNERS,
  AUDIT_LOGS,
  SAVE_DATASET_DATA,
  SAVE_DATASET_COLUMNS,
} from "../../constants";

import {
  addDataPackage,
  fetchPackagesData,
  updateDataPackage,
} from "./dataPackage.saga";

import { fetchdashboardData } from "./dashboard.saga";
import {
  fetchDataKindData,
  saveDataset,
  saveDatasetColumns,
} from "./dataSets.saga";

import {
  fetchVendorsData,
  fetchLocationsData,
  fetchServiceOwnersData,
  saveLocationData,
} from "./dataFlow.saga";

import { fetchAuditLogs } from "./auditLogs.saga";

function* cdasCoreSaga() {
  yield takeEvery(DASHBOARD_DATA, fetchdashboardData);
  yield takeLatest(PACKAGES_LIST, fetchPackagesData);
  yield takeLatest(ADD_DATA_PACKAGE, addDataPackage);
  yield takeLatest(UPDATE_DATA_PACKAGE, updateDataPackage);
  yield takeLatest(GET_VENDORS_DATA, fetchVendorsData);
  yield takeLatest(GET_LOCATIONS_DATA, fetchLocationsData);
  yield takeLatest(SAVE_LOCATION_DATA, saveLocationData);
  yield takeLatest(GET_SERVICE_OWNERS, fetchServiceOwnersData);
  yield takeLatest(AUDIT_LOGS, fetchAuditLogs);
  yield takeLatest(GET_DATA_KIND, fetchDataKindData);
  yield takeLatest(SAVE_DATASET_DATA, saveDataset);
  yield takeLatest(SAVE_DATASET_COLUMNS, saveDatasetColumns);
}

export default cdasCoreSaga;
