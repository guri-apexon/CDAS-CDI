/* eslint-disable eqeqeq */
import produce from "immer";
import {
  GET_LOCATIONS_ADMIN,
  FETCH_LOCATION_SUCCESS,
  GET_CDT_LIST,
  FETCH_CDT_LIST_FAILURE,
  FETCH_CDT_LIST_SUCCESS,
  FETCH_LOCATION_FAILURE,
  UPDATE_LOCATION_DATA,
  SAVE_LOCATION_DATA,
  STORE_LOCATION_SUCCESS,
  STORE_LOCATION_FAILURE,
  HIDE_ERROR_MSG,
  UPDATE_LOCATION_SUCCESS,
  UPDATE_LOCATION_FAILURE,
  UPDATE_SETTINGS_DATA,
  UPDATE_SETTINGS_SUCCESS,
  UPDATE_SETTINGS_FAILURE,
  CREARE_SETTINGS_DATA,
  CREARE_SETTINGS_SUCCESS,
  CREARE_SETTINGS_FAILURE,
  FETCH_SETTINGS_DATA,
  FETCH_SETTINGS_FAILURE,
  FETCH_SETTINGS_SUCCESS,
  SEARCH_SETTINGS_DATA,
} from "../../constants";

export const initialState = {
  loading: false,
  upsertLoading: false,
  upserted: false,
  locations: [],
  cdtList: [],
  settings: [],
  error: null,
  success: null,
  locForm: {
    dataStructure: "tabular",
    locationType: "SFTP",
    active: true,
  },
  searchString: "",
};

const CDIAdminReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case GET_LOCATIONS_ADMIN:
        newState.loading = true;
        break;
      case FETCH_LOCATION_SUCCESS:
        newState.loading = false;
        newState.locations = action.locations;
        break;
      case FETCH_LOCATION_FAILURE:
        newState.loading = false;
        break;
      case GET_CDT_LIST:
        newState.loading = true;
        break;
      case FETCH_CDT_LIST_FAILURE:
        newState.loading = false;
        break;
      case FETCH_CDT_LIST_SUCCESS:
        newState.loading = false;
        newState.cdtList = action.cdtList;
        break;
      case UPDATE_LOCATION_DATA:
        newState.upsertLoading = true;
        break;
      case UPDATE_LOCATION_SUCCESS:
        newState.upsertLoading = false;
        newState.success = "Location updated succesfully";
        newState.upserted = !state.upserted;
        break;
      case UPDATE_LOCATION_FAILURE:
        newState.upsertLoading = false;
        newState.error = action.message;
        break;
      case SAVE_LOCATION_DATA:
        newState.upsertLoading = true;
        break;
      case STORE_LOCATION_SUCCESS:
        newState.upsertLoading = false;
        newState.upserted = !state.upserted;
        newState.success = "Location inserted succesfully";
        newState.createTriggered = !state.createTriggered;
        break;
      case STORE_LOCATION_FAILURE:
        newState.upsertLoading = false;
        newState.error = action.message;
        break;
      case FETCH_SETTINGS_DATA:
        newState.loading = true;
        break;
      case FETCH_SETTINGS_SUCCESS:
        newState.loading = false;
        newState.settings = action.settings;
        break;
      case FETCH_SETTINGS_FAILURE:
        newState.loading = false;
        break;
      case UPDATE_SETTINGS_DATA:
        newState.upsertLoading = true;
        break;
      case UPDATE_SETTINGS_SUCCESS:
        newState.upsertLoading = false;
        newState.success = "Settings updated succesfully";
        newState.upserted = !state.upserted;
        break;
      case UPDATE_SETTINGS_FAILURE:
        newState.upsertLoading = false;
        newState.error = action.message;
        break;
      case CREARE_SETTINGS_DATA:
        newState.upsertLoading = true;
        break;
      case CREARE_SETTINGS_SUCCESS:
        newState.upsertLoading = false;
        newState.upserted = !state.upserted;
        newState.success = "Settigns inserted succesfully";
        break;
      case CREARE_SETTINGS_FAILURE:
        newState.upsertLoading = false;
        newState.error = action.message;
        break;
      case SEARCH_SETTINGS_DATA:
        newState.searchString = action.search;
        break;
      case HIDE_ERROR_MSG:
        newState.loading = false;
        newState.error = null;
        newState.success = null;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default CDIAdminReducer;
