import {
  GET_DATA_KIND,
  SAVE_DATASET_DATA,
  UPDATE_DATASET_DATA,
  SAVE_DATASET_COLUMNS,
  HIDE_ERROR_MSG,
  GET_DATASET_DETAIL,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getDataKindData = () => {
  return {
    type: GET_DATA_KIND,
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

export const createDatasetData = (values) => {
  return {
    type: SAVE_DATASET_COLUMNS,
    values,
  };
};

export const getDataSetDetail = (datasetid) => {
  return {
    type: GET_DATASET_DETAIL,
    datasetid,
  };
};
