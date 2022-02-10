import {
  DASHBOARD_DATA,
  PAGEHEADER_UPDATE,
  SELECT_DATAFLOW,
  GET_DATA_FLOW_LIST,
  GET_DATASET_INGESTION_SUMMARY,
} from "../../constants";

export const getStudyboardData = (protocolId) => {
  return {
    type: DASHBOARD_DATA,
    protocolId,
  };
};

export const updateSelectedStudy = (study) => {
  return {
    type: PAGEHEADER_UPDATE,
    study,
  };
};

export const updateSelectedDataflow = (dataflowId) => {
  return {
    type: SELECT_DATAFLOW,
    dataflowId,
  };
};

export const getFlowDetailsOfStudy = (protocolId) => {
  return {
    type: GET_DATA_FLOW_LIST,
    protocolId,
  };
};

export const getDatasetIngestionOfStudy = (
  protocolId,
  testFlag = "",
  active = ""
) => {
  return {
    type: GET_DATASET_INGESTION_SUMMARY,
    protocolId,
    testFlag,
    active,
  };
};
