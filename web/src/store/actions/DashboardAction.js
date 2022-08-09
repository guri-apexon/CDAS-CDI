import {
  DASHBOARD_DATA,
  PAGEHEADER_UPDATE,
  SELECTED_DATAFLOW,
  GET_DATA_FLOW_LIST,
  GET_DATASET_INGESTION_SUMMARY,
  GET_ALL_INGESTION_SUMMARY,
  GET_STUDIES_LIST,
  GET_PINNED_LIST,
  UPDATE_HEADER_COUNT,
  UPDATE_DF_STATUS,
} from "../../constants";

export const getStudyboardData = (protocolId) => {
  return {
    type: DASHBOARD_DATA,
    protocolId,
  };
};

export const getStudiesData = (userId) => {
  return {
    type: GET_STUDIES_LIST,
    userId,
  };
};

export const getPinnedData = (userId) => {
  return {
    type: GET_PINNED_LIST,
    userId,
  };
};

export const updateSelectedStudy = (study) => {
  return {
    type: PAGEHEADER_UPDATE,
    study,
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

export const getAllIngestionOfStudy = (UserID, testFlag = "", active = "") => {
  return {
    type: GET_ALL_INGESTION_SUMMARY,
    UserID,
    testFlag,
    active,
  };
};

export const SelectedDataflow = (dataflow) => {
  return {
    type: SELECTED_DATAFLOW,
    dataflow,
  };
};

export const updateHeaderCount = (
  dsCount,
  dfCount,
  ActiveDfCount,
  InActiveDfCount,
  ActiveDsCount,
  InActiveDsCount
) => {
  return {
    type: UPDATE_HEADER_COUNT,
    ActiveDfCount,
    InActiveDfCount,
    ActiveDsCount,
    InActiveDsCount,
    dfCount,
    dsCount,
  };
};

export const updateDFStatus = (dfId, newStatus) => {
  return {
    type: UPDATE_DF_STATUS,
    dfId,
    newStatus,
  };
};
