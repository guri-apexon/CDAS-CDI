import { takeEvery, takeLatest } from "redux-saga/effects";
import {
  ADD_DATA_PACKAGE,
  PACKAGES_LIST,
  UPDATE_DATA_PACKAGE,
  GET_VENDORS_DATA,
  SAVE_LOCATION_DATA,
  GET_DATA_KIND,
  GET_LOCATIONS_DATA,
  GET_SERVICE_OWNERS,
  AUDIT_LOGS,
  SAVE_DATASET_DATA,
  SAVE_DATASET_COLUMNS,
  GET_DATA_FLOW_LIST,
  GET_DATAFLOW_DETAIL,
  GET_DATASET_DETAIL,
  UPDATE_DATASET_DATA,
  GET_DATASET_COLUMNS,
  ADD_DATAFLOW,
  GET_VLC_RULES,
  GET_DATASET_INGESTION_SUMMARY,
  GET_LOCATIONS_ADMIN,
  GET_CDT_LIST,
} from "../../constants";

import {
  addDataPackage,
  fetchPackagesData,
  updateDataPackage,
} from "./dataPackage.saga";

import {
  fetchFlowData,
  fetchDatasetIngestionSummaryData,
} from "./dashboard.saga";
import {
  fetchDataKindData,
  saveDataset,
  saveDatasetColumns,
  fetchDatasetDetail,
  updateDataset,
  fetchDatasetColumns,
  fetchVLCData,
} from "./dataSets.saga";

import {
  fetchVendorsData,
  fetchLocationsData,
  fetchServiceOwnersData,
  saveLocationData,
  fetchDataflowDetail,
  addDataFlow,
} from "./dataFlow.saga";

import { fetchAuditLogs } from "./auditLogs.saga";

import { fetchCDTList } from "./cdiAdmin.saga";

function* cdasCoreSaga() {
  yield takeEvery(GET_DATA_FLOW_LIST, fetchFlowData);
  yield takeLatest(
    GET_DATASET_INGESTION_SUMMARY,
    fetchDatasetIngestionSummaryData
  );
  yield takeLatest(ADD_DATAFLOW, addDataFlow);
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
  yield takeLatest(GET_DATAFLOW_DETAIL, fetchDataflowDetail);
  yield takeLatest(GET_DATASET_DETAIL, fetchDatasetDetail);
  yield takeLatest(UPDATE_DATASET_DATA, updateDataset);
  yield takeLatest(GET_DATASET_COLUMNS, fetchDatasetColumns);
  yield takeLatest(GET_VLC_RULES, fetchVLCData);
  yield takeLatest(GET_LOCATIONS_ADMIN, fetchLocationsData);
  yield takeLatest(GET_CDT_LIST, fetchCDTList);
}

export default cdasCoreSaga;
