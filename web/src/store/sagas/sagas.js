import { takeEvery, takeLatest } from "redux-saga/effects";
import {
  ADD_DATA_PACKAGE,
  PACKAGES_LIST,
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  UPDATE_DATA_PACKAGE,
  GET_VENDORS_DATA,
  SAVE_LOCATION_DATA,
  GET_LOCATIONS_DATA,
  GET_SERVICE_OWNERS,
  AUDIT_LOGS,
} from "../../constants";
import {
  addDataPackage,
  fetchPackagesData,
  updateDataPackage,
} from "./dataPackage.saga";

import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";

import {
  fetchVendorsData,
  fetchLocationsData,
  fetchServiceOwnersData,
  saveLocationData,
} from "./dataFlow.saga";
import { fetchAuditLogs } from "./auditLogs.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeLatest(PACKAGES_LIST, fetchPackagesData);
  yield takeLatest(ADD_DATA_PACKAGE, addDataPackage);
  yield takeLatest(UPDATE_DATA_PACKAGE, updateDataPackage);
  yield takeLatest(GET_VENDORS_DATA, fetchVendorsData);
  yield takeLatest(GET_LOCATIONS_DATA, fetchLocationsData);
  yield takeLatest(SAVE_LOCATION_DATA, saveLocationData);
  yield takeLatest(GET_SERVICE_OWNERS, fetchServiceOwnersData);
  yield takeLatest(AUDIT_LOGS, fetchAuditLogs);
}

export default cdasCoreSaga;
