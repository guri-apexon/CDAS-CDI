import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  GET_VENDORS_DATA,
  SAVE_LOCATION_DATA,
  GET_LOCATIONS_DATA,
  GET_SERVICE_OWNERS,
} from "../../constants";

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

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeLatest(GET_VENDORS_DATA, fetchVendorsData);
  yield takeLatest(GET_LOCATIONS_DATA, fetchLocationsData);
  yield takeLatest(SAVE_LOCATION_DATA, saveLocationData);
  yield takeLatest(GET_SERVICE_OWNERS, fetchServiceOwnersData);
}

export default cdasCoreSaga;
