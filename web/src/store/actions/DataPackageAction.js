import { ADD_DATA_PACKAGE, PACKAGES_LIST } from "../../constants";

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
