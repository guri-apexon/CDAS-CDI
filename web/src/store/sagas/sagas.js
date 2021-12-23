import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import { STUDYBOARD_DATA, STUDY_NOTONBOARDED_STATUS } from "../../constants";
import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
}

export default cdasCoreSaga;
