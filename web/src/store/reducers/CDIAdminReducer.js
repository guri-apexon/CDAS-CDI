/* eslint-disable eqeqeq */
import produce from "immer";
import { GET_LOCATIONS_ADMIN, FETCH_LOCATION_SUCCESS } from "../../constants";

export const initialState = {
  loading: false,
  locations: [],
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
      default:
        newState.loading = false;
        break;
    }
  });

export default CDIAdminReducer;
