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
  UPDATE_DS_STATUS,
  GET_LOCATION_DETAIL,
  STORE_DATASET_COLUMNS_SUCCESS,
  STORE_DATASET_COLUMNS_FAILURE,
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

export const updateDatasetColumns = (
  values,
  dsId,
  dfId,
  dpId,
  userId,
  CDVersionBump
) => {
  return {
    type: UPDATE_COLUMNS_DATA,
    values,
    dsId,
    dfId,
    dpId,
    userId,
    CDVersionBump,
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

export const getSQLTables = (payload) => {
  return {
    type: GET_SQL_TABLES,
    payload,
  };
};

export const getSQLColumns = (payload) => {
  return {
    type: GET_SQL_COLUMNS,
    payload,
  };
};

export const getPreviewSQL = (payload) => {
  return {
    type: GET_PREVIEW_SQL,
    payload,
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

export const updateDSStatus = (status) => {
  return {
    type: UPDATE_DS_STATUS,
    status,
  };
};

export const getLocationDetails = (id) => {
  return {
    type: GET_LOCATION_DETAIL,
    id,
  };
};
export const columnsCreated = (resp) => {
  return {
    type: STORE_DATASET_COLUMNS_SUCCESS,
    datasetColumns: resp.data,
    nQuery: resp.nQuery,
  };
};
export const columnsCreatedFailure = (errText) => {
  return { type: STORE_DATASET_COLUMNS_FAILURE, message: errText };
};
