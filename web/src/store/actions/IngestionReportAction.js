/* eslint-disable import/prefer-default-export */
import { GET_DATASET_PROPERTIES, GET_TRANSFER_LOG } from "../../constants";

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
