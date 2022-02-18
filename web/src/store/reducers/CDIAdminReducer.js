/* eslint-disable eqeqeq */
import produce from "immer";
import {
  GET_LOCATIONS_ADMIN,
  FETCH_LOCATION_SUCCESS,
  GET_CDT_LIST,
  FETCH_CDT_LIST_FAILURE,
  FETCH_CDT_LIST_SUCCESS,
} from "../../constants";

export const initialState = {
  loading: false,
  locations: [],
  cdtList: [],
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
      default:
        newState.loading = false;
        break;
    }
  });

export default CDIAdminReducer;
