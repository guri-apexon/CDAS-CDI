import produce from "immer";

import {
  PACKAGES_LIST_SUCCESS,
  PACKAGES_LIST,
  PACKAGES_LIST_FAILURE,
  ADD_DATA_PACKAGE,
  ADD_PACKAGE_SUCCESS,
  UPDATE_DATA_PACKAGE,
  UPDATE_DATA_PACKAGE_SUCCESS,
  REDIRECT_TO_DATASET,
  UPDATE_DATA_PACKAGE_FAILURE,
  ADD_PACKAGE_BTN,
} from "../../constants";

export const initialState = {
  packagesList: [],
  selectedPackage: {},
  selectedDSDetails: {},
  loading: false,
  refreshData: false,
};

const DataPackageReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case PACKAGES_LIST:
        newState.loading = true;
        break;

      case ADD_PACKAGE_BTN:
        newState.openAddPackage = true;
        break;

      case PACKAGES_LIST_SUCCESS:
        newState.loading = false;
        newState.packagesList = action.packagesData.data;
        newState.response = null;
        newState.openAddPackage = false;
        break;

      case PACKAGES_LIST_FAILURE:
        newState.loading = true;
        newState.refreshData = false;
        break;

      case ADD_DATA_PACKAGE:
        newState.selectedPackage = action.packageResult;
        break;

      case ADD_PACKAGE_SUCCESS:
        newState.loading = false;
        newState.refreshData = action.refreshData;
        break;

      case UPDATE_DATA_PACKAGE:
        newState.loading = true;
        newState.selectedPackage = action.payload;
        break;

      case UPDATE_DATA_PACKAGE_SUCCESS:
        newState.loading = false;
        newState.response = action.response;
        if (state.selectedPackage && state.selectedPackage.active) {
          const packagesList = state.packagesList.map((singlePackage) => {
            if (
              singlePackage.datapackageid === state.selectedPackage.package_id
            ) {
              return { ...singlePackage, active: state.selectedPackage.active };
            }
            return singlePackage;
          });
          newState.packagesList = packagesList;
        } else if (
          state.selectedPackage &&
          state.selectedPackage.delete_package
        ) {
          const filteredItems = state.packagesList.filter((el) => {
            return state.selectedPackage.package_id !== el.datapackageid;
          });
          newState.packagesList = filteredItems;
        }
        newState.selectedPackage = null;
        break;

      case UPDATE_DATA_PACKAGE_FAILURE:
        newState.loading = false;
        newState.response = null;
        break;
      case REDIRECT_TO_DATASET:
        newState.selectedDSDetails = {
          dataflowid: action.dfId,
          dataflowName: action.dfName,
          datapackageid: action.dpId,
          datapackageName: action.dpName,
          datasetid: action.dsId,
          datasetName: action.dsName,
        };
        break;
      default:
        break;
    }
  });

export default DataPackageReducer;
