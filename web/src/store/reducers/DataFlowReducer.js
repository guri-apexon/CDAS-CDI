/* eslint-disable eqeqeq */
import produce from "immer";
import {
  GET_VENDORS_DATA,
  GET_LOCATIONS_DATA,
  FETCH_LOCATION_SUCCESS,
  FETCH_LOCATION_FAILURE,
  FETCH_VENDOR_SUCCESS,
  FETCH_VENDOR_FAILURE,
  UPDATE_FORM_FIELDS,
  SAVE_LOCATION_DATA,
  UPDATE_SELECTED_LOCATION,
} from "../../constants";

export const initialState = {
  loading: false,
  selectedLocation: {},
  serviceOwner: [],
  locations: [],
  vendors: [],
  userName: "",
  password: "",
  connLink: "",
  description: "",
  dataflowType: "test",
  dataStructure: "tabular",
  locationType: "SFTP",
  selectedVendor: {},
};

const DataFlowReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case GET_VENDORS_DATA:
        newState.loading = true;
        break;
      case GET_LOCATIONS_DATA:
        newState.loading = true;
        break;
      case FETCH_LOCATION_SUCCESS:
        newState.loading = false;
        newState.locations = action.locations;
        break;

      case FETCH_LOCATION_FAILURE:
        newState.loading = true;
        break;
      case FETCH_VENDOR_SUCCESS:
        newState.loading = false;
        newState.vendors = action.vendors;
        break;

      case FETCH_VENDOR_FAILURE:
        newState.loading = true;
        break;
      case UPDATE_SELECTED_LOCATION:
        newState.selectedLocation = action.location;
        break;
      case UPDATE_FORM_FIELDS:
        // newState[action.field] = action.value;
        if (action.field === "description" || action.field === "dataflowType") {
          newState[action.field] = action.value.target.value;
        } else if (action.field === "vendor") {
          const vendorId = action.value;
          newState.selectedVendor = state.vendors?.records?.find(
            (v) => vendorId == v.vend_id
          );
        }
        break;
      case SAVE_LOCATION_DATA:
        newState.loading = true;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
