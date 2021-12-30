import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  ADD_DATA_PACKAGE,
  PACKAGES_LIST,
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  UPDATE_DATA_PACKAGE,
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

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeLatest(PACKAGES_LIST, fetchPackagesData);
  yield takeLatest(ADD_DATA_PACKAGE, addDataPackage);
  yield takeLatest(UPDATE_DATA_PACKAGE, updateDataPackage);
}

export default cdasCoreSaga;
