import {
  GET_DATA_KIND,
  SAVE_DATASET_DATA,
  UPDATE_DATASET_DATA,
  SAVE_DATASET_COLUMNS,
  HIDE_ERROR_MSG,
  GET_DATASET_DETAIL,
  GET_DATASET_COLUMNS,
  GET_VLC_RULES,
  GET_SQL_TABLES,
  GET_SQL_COLUMNS,
  GET_PREVIEW_SQL,
  RESET_FTP_FORM,
  RESET_JDBC_FORM,
  UPDATE_COLUMNS_DATA,
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

export const createDatasetColumns = (values, dsId, dfId, dpId, userId) => {
  return {
    type: SAVE_DATASET_COLUMNS,
    values,
    dsId,
    dfId,
    dpId,
    userId,
  };
};

export const updateDatasetColumns = (values, dsId, dfId, dpId, userId) => {
  return {
    type: UPDATE_COLUMNS_DATA,
    values,
    dsId,
    dfId,
    dpId,
    userId,
  };
};

export const getDataSetDetail = (dsId, dfId, dpId) => {
  return {
    type: GET_DATASET_DETAIL,
    dsId,
    dfId,
    dpId,
  };
};

export const getDatasetColumns = (dsId) => {
  return {
    type: GET_DATASET_COLUMNS,
    dsId,
  };
};

export const getSQLTables = () => {
  return {
    type: GET_SQL_TABLES,
  };
};

export const getSQLColumns = (table) => {
  return {
    type: GET_SQL_COLUMNS,
    table,
  };
};

export const getPreviewSQL = (query) => {
  return {
    type: GET_PREVIEW_SQL,
    query,
  };
};

export const resetFTP = () => {
  return {
    type: RESET_FTP_FORM,
  };
};

export const resetJDBC = () => {
  return {
    type: RESET_JDBC_FORM,
  };
};
