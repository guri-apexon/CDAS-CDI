/* eslint-disable import/prefer-default-export */
import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  GETSTUDYDF,
  STUDYAPI,
  CDIHOMEAPI,
  GET_STUDY_PERMISSION,
  GET_DATA_FLOW_LIST_SUCCESS,
  GET_DATA_FLOW_LIST_FAILURE,
  GET_DATASET_INGESTION_SUMMARY_SUCCESS,
  GET_DATASET_INGESTION_SUMMARY_FAILURE,
  GET_ALL_INGESTION_SUMMARY_SUCCESS,
  GET_ALL_INGESTION_SUMMARY_FAILURE,
  STUDYLIST,
  GET_STUDIES_LIST_SUCCESS,
  GET_STUDIES_LIST_FAILURE,
  PINNEDSTUDY,
  GET_PINNED_LIST_SUCCESS,
  GET_PINNED_LIST_FAILURE,
  GET_SPECIFIC_INGESTION_DATASETS_SUCCESS,
  GET_SPECIFIC_INGESTION_DATASETS_FAILURE,
} from "../../constants";

export function* fetchFlowData(payload) {
  // console.log("before", payload.protocolId);
  try {
    const fetchDBData = yield call(axios.post, `${baseURL}/${GETSTUDYDF}`, {
      protocolId: payload.protocolId,
      protocolnumberstandard: payload.protocolnumberstandard,
      userId: payload.userId,
    });

    const permissionData = yield call(
      axios.post,
      `${baseURL}/${GET_STUDY_PERMISSION}`,
      {
        protocolnumberstandard: payload.protocolnumberstandard,
        userId: payload.userId,
      }
    );

    // console.log("study", fetchDBData);
    yield put({
      type: GET_DATA_FLOW_LIST_SUCCESS,
      flowData: fetchDBData.data.data,
      readPermission: permissionData.data.data.permission,
    });
  } catch (e) {
    yield put({ type: GET_DATA_FLOW_LIST_FAILURE, message: e.message });
  }
}

export function* fetchDatasetIngestionSummaryData(payload) {
  // console.log("before", payload.protocolId);
  try {
    let active = 0;
    let testFlag = "";
    if (payload.active) {
      active = 1;
    }
    if (payload.testFlag === "1" || payload.testFlag === "0") {
      testFlag = payload.testFlag;
    }
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${STUDYAPI}/datasetIngestionDetail/${payload.protocolId}?active=${active}&testFlag=${testFlag}&processStatus=${payload.processStatus}&userId=${payload.userId}`,
      {}
    );

    // console.log("study", fetchDBData);
    yield put({
      type: GET_DATASET_INGESTION_SUMMARY_SUCCESS,
      ingestionData: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({
      type: GET_DATASET_INGESTION_SUMMARY_FAILURE,
      message: e.message,
    });
  }
}

export function* fetchAllIngestionSummaryData(payload) {
  console.log("before", payload);
  try {
    let active = 0;
    let testFlag = "";
    if (payload.active) {
      active = 1;
    }
    if (payload.testFlag === "1" || payload.testFlag === "0") {
      testFlag = payload.testFlag;
    }
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${CDIHOMEAPI}/datasetIngestionDetail/${payload.UserID}?testFlag=${testFlag}&active=${active}&processStatus=${payload.processStatus}&limit=${payload.limit}&noOfDays=${payload.noOfDays}`,
      {}
    );

    yield put({
      type: GET_ALL_INGESTION_SUMMARY_SUCCESS,
      ingestnData: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({
      type: GET_ALL_INGESTION_SUMMARY_FAILURE,
      message: e.message,
    });
  }
}

export function* fetchSpecificIngestionDataSets(payload) {
  try {
    let active = 0;
    let testFlag = "";
    if (payload.active) {
      active = 1;
    }
    if (payload.testFlag === "1" || payload.testFlag === "0") {
      testFlag = payload.testFlag;
    }
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${CDIHOMEAPI}/ingestionMonitorDataSets/${payload.UserID}?testFlag=${testFlag}&active=${active}&processStatus=${payload.processStatus}&limit=${payload.limit}&noOfDays=${payload.noOfDays}`,
      {}
    );

    yield put({
      type: GET_SPECIFIC_INGESTION_DATASETS_SUCCESS,
      ingestionData: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({
      type: GET_SPECIFIC_INGESTION_DATASETS_FAILURE,
      message: e.message,
    });
  }
}

export function* fetchUserStudiesData(payload) {
  // console.log("before", payload.protocolId);
  try {
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${STUDYLIST}/${payload.userId}`
    );

    // console.log("study", fetchDBData);
    yield put({
      type: GET_STUDIES_LIST_SUCCESS,
      userStudies: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({ type: GET_STUDIES_LIST_FAILURE, message: e.message });
  }
}

export function* fetchPinnedStudies(payload) {
  // console.log("before", payload.protocolId);
  try {
    const fetchDBData = yield call(
      axios.get,
      `${baseURL}/${PINNEDSTUDY}/${payload.userId}`
    );

    // console.log("study", fetchDBData);
    yield put({
      type: GET_PINNED_LIST_SUCCESS,
      userPinnedStudies: fetchDBData.data.data,
    });
  } catch (e) {
    yield put({ type: GET_PINNED_LIST_FAILURE, message: e.message });
  }
}
