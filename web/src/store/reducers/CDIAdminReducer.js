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
} from "../../constants";

export const initialState = {
  loading: false,
  upsertLoading: false,
  upserted: false,
  locations: [],
  cdtList: [],
  error: null,
  success: null,
  locForm: {
    dataStructure: "tabular",
    locationType: "SFTP",
    active: true,
  },
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
