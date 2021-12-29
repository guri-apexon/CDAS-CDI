import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  ADD_DATA_PACKAGE,
  PACKAGES_LIST,
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
} from "../../constants";
import { addDataPackage, fetchPackagesData } from "./dataPackage.saga";
import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeLatest(PACKAGES_LIST, fetchPackagesData);
  yield takeLatest(ADD_DATA_PACKAGE, addDataPackage);
}

export default cdasCoreSaga;
