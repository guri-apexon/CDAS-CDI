import produce from "immer";

import {
  PACKAGES_LIST_SUCCESS,
  PACKAGES_LIST,
  PACKAGES_LIST_FAILURE,
  ADD_DATA_PACKAGE,
  ADD_PACKAGE_SUCCESS,
} from "../../constants";

export const initialState = {
  packagesList: [],
  selectedPackage: {},
  loading: false,
};

const DataPackageReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case PACKAGES_LIST:
        newState.loading = true;
        break;

      case PACKAGES_LIST_SUCCESS:
        newState.loading = false;
        newState.packagesList = action.packagesData;
        newState.response = null;
        break;

      case PACKAGES_LIST_FAILURE:
        newState.loading = true;
        newState.response = null;
        break;

      case ADD_DATA_PACKAGE:
        newState.selectedPackage = action.packageResult;
        break;

      case ADD_PACKAGE_SUCCESS:
        newState.loading = false;
        newState.response = action.response;
        break;

      default:
        break;
    }
  });

export default DataPackageReducer;
