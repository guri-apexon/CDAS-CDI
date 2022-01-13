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
  GET_SERVICE_OWNERS,
  FETCH_SERVICE_OWNERS_SUCCESS,
  FETCH_SERVICE_OWNERS_FAILURE,
  STORE_LOCATION_SUCCESS,
  STORE_LOCATION_FAILURE,
  HIDE_ERROR_MSG,
  SAVE_LOCATION_DATA,
  UPDATE_SELECTED_LOCATION,
  FETCH_DATAFLOW_DETAIL_FAILURE,
  FETCH_DATAFLOW_DETAIL_SUCCESS,
} from "../../constants";

export const initialState = {
  loading: false,
  createTriggered: false,
  error: null,
  selectedLocation: {},
  serviceOwner: [],
  serviceOwners: [],
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
  dataFlowdetail: {},
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
        newState.loading = false;
        break;
      case FETCH_VENDOR_SUCCESS:
        newState.loading = false;
        newState.vendors = action.vendors;
        break;

      case FETCH_VENDOR_FAILURE:
        newState.loading = false;
        break;
      case UPDATE_SELECTED_LOCATION:
        newState.selectedLocation = action.location;
        newState.loading = false;
        break;
      case UPDATE_FORM_FIELDS:
        // newState[action.field] = action.value;
        newState.loading = false;
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
      case GET_SERVICE_OWNERS:
        newState.loading = true;
        break;
      case FETCH_SERVICE_OWNERS_FAILURE:
        newState.loading = false;
        break;
      case FETCH_SERVICE_OWNERS_SUCCESS:
        newState.loading = false;
        newState.serviceOwners = action.serviceOwners;
        break;
      case STORE_LOCATION_SUCCESS:
        newState.loading = false;
        newState.createTriggered = !state.createTriggered;
        break;
      case STORE_LOCATION_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case HIDE_ERROR_MSG:
        newState.error = action.message;
        break;
      case FETCH_DATAFLOW_DETAIL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_DATAFLOW_DETAIL_SUCCESS:
        newState.loading = false;
        newState.dataFlowdetail = action.dataflowDetail;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
