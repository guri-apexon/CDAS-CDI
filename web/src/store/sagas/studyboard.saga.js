import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  STUDYBOARD_DATA_FETCH,
  STUDYBOARD_FETCH_SUCCESS,
  STUDYBOARD_FETCH_FAILURE,
  NOT_ONBOARDED_FETCH,
  STUDY_NOTONBOARDED_SUCCESS,
  STUDY_NOTONBOARDED_FAILURE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchStudyboardData() {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${STUDYBOARD_DATA_FETCH}`,
      {}
    );

    // console.log("study", fetchSBData);
    yield put({
      type: STUDYBOARD_FETCH_SUCCESS,
      studyboardData: fetchSBData.data.data.studyData,
      uniqurePhase: fetchSBData.data.data.uniquePhase,
      uniqueProtocolStatus: fetchSBData.data.data.uniqueProtocolStatus,
    });
  } catch (e) {
    yield put({ type: STUDYBOARD_FETCH_FAILURE, message: e.message });
  }
}

export function* fetchNotOnStudyboardStatus() {
  try {
    const studyboardStatus = yield call(
      axios.get,
      `${baseURL}/${NOT_ONBOARDED_FETCH}`
    );
    yield put({
      type: STUDY_NOTONBOARDED_SUCCESS,
      notOnBoardedStudyStatus: studyboardStatus.data.data,
    });
  } catch (e) {
    yield put({ type: STUDY_NOTONBOARDED_FAILURE, message: e.message });
  }
}
