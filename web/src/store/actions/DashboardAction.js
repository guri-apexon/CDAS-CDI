import {
  DASHBOARD_DATA,
  PAGEHEADER_UPDATE,
  GET_DATA_FLOW_LIST,
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

export const getFlowDetailsOfStudy = (protocolId) => {
  return {
    type: GET_DATA_FLOW_LIST,
    protocolId,
  };
};
