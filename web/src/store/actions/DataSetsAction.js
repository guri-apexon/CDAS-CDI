import {
  GET_DATA_KIND,
  SAVE_DATASET_DATA,
  UPDATE_DATASET_DATA,
  SAVE_DATASET_COLUMNS,
  HIDE_ERROR_MSG,
  GET_DATASET_DETAIL,
  GET_DATASET_COLUMNS,
  GET_VLC_RULES,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getDataKindData = () => {
  return {
    type: GET_DATA_KIND,
  };
};

export const getVLCData = () => {
  return {
    type: GET_VLC_RULES,
  };
};

export const hideErrorMessage = () => {
  return {
    type: HIDE_ERROR_MSG,
  };
};

export const saveDatasetData = (values) => {
  return {
    type: SAVE_DATASET_DATA,
    values,
  };
};

export const updateDatasetData = (values) => {
  return {
    type: UPDATE_DATASET_DATA,
    values,
  };
};

export const createDatasetColumns = (values, datasetid) => {
  return {
    type: SAVE_DATASET_COLUMNS,
    values,
    datasetid,
  };
};

export const getDataSetDetail = (datasetid) => {
  return {
    type: GET_DATASET_DETAIL,
    datasetid,
  };
};

export const getDatasetColumns = (datasetid) => {
  return {
    type: GET_DATASET_COLUMNS,
    datasetid,
  };
};
