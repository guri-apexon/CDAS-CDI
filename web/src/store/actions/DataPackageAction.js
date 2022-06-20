import {
  ADD_DATA_PACKAGE,
  SELECT_DATA_PACKAGE,
  ADD_PACKAGE_BTN,
  ADD_PACKAGE_SUCCESS,
  PACKAGES_LIST,
  REDIRECT_TO_DATASET,
  UPDATE_DATA_PACKAGE,
  UPDATE_LEFT_PANEL,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getPackagesList = (dfId, searchQuery = "") => {
  return {
    type: PACKAGES_LIST,
    dfId,
    searchQuery,
  };
};
// eslint-disable-next-line import/prefer-default-export
export const addPackageBtnAction = () => {
  return {
    type: ADD_PACKAGE_BTN,
  };
};

export const addDataPackage = (packageResult) => {
  return {
    type: ADD_DATA_PACKAGE,
    refreshData: true,
  };
};
export const selectDataPackage = (packageResult) => {
  return {
    type: SELECT_DATA_PACKAGE,
    refreshData: true,
    packageResult,
  };
};

export const updateStatus = (payload) => {
  return {
    type: UPDATE_DATA_PACKAGE,
    payload,
  };
};
export const deletePackage = (payload) => {
  return {
    type: UPDATE_DATA_PACKAGE,
    update_action: "DELETE",
    payload: { ...payload, delete_package: true },
  };
};

export const redirectToDataSet = (
  dfId,
  dfName,
  dpId,
  dpName,
  dsId,
  dsName,
  fromWhere = null
) => {
  return {
    type: REDIRECT_TO_DATASET,
    dfId,
    dfName,
    dpId,
    dpName,
    dsId,
    dsName,
    fromWhere,
  };
};

export const updatePanel = () => {
  return {
    type: UPDATE_LEFT_PANEL,
  };
};
