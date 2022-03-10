/* eslint-disable import/prefer-default-export */
import {
  GET_DATASET_INGESTION_FILE_HISTORY,
  GET_DATASET_INGESTION_ISSUE_TYPES,
  GET_DATASET_PROPERTIES,
  GET_TRANSFER_LOG,
} from "../../constants";

export const getTransferLog = (datasetId) => {
  return {
    type: GET_TRANSFER_LOG,
    datasetId,
  };
};

export const getDatasetProperties = (datasetId) => {
  return {
    type: GET_DATASET_PROPERTIES,
    datasetId,
  };
};

export const getDatasetIngestionIssueTypes = (datasetId) => {
  return {
    type: GET_DATASET_INGESTION_ISSUE_TYPES,
    datasetId,
  };
};

export const getDatasetIngestionFileHistory = (datasetId, days = null) => {
  return {
    type: GET_DATASET_INGESTION_FILE_HISTORY,
    datasetId,
    days,
  };
};
