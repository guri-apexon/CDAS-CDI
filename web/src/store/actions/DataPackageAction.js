import {
  ADD_DATA_PACKAGE,
  PACKAGES_LIST,
  UPDATE_DATA_PACKAGE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getPackagesList = (searchQuery = "") => {
  return {
    type: PACKAGES_LIST,
    searchQuery,
  };
};

export const addDataPackage = (packageData) => {
  return {
    type: ADD_DATA_PACKAGE,
    packageData,
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
