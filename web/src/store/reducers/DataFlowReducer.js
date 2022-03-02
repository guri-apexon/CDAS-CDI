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
  HIDE_ERROR_MSG,
  UPDATE_SELECTED_LOCATION,
  FETCH_DATAFLOW_DETAIL_FAILURE,
  FETCH_DATAFLOW_DETAIL_SUCCESS,
  ADD_DATAFLOW_SUCCESS,
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

      case ADD_DATAFLOW_SUCCESS:
        newState.selectedDataFlow = action.dataflow;
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
      case HIDE_ERROR_MSG:
        newState.error = action.message;
        break;
      case FETCH_DATAFLOW_DETAIL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case FETCH_DATAFLOW_DETAIL_SUCCESS:
        newState.loading = false;
        // eslint-disable-next-line no-case-declarations
        const { dataflowDetail } = action;
        // eslint-disable-next-line no-case-declarations
        const {
          description,
          exptfstprddt,
          loctyp,
          name,
          srclocID,
          type,
          vendorid,
          vendorname,
          testflag,
          locationName,
        } = dataflowDetail;
        // eslint-disable-next-line no-case-declarations
        const formData = {};
        formData.description = description;
        formData.firstFileDate = exptfstprddt;
        formData.locationType = loctyp;
        formData.name = name;
        formData.dataflowType = testflag === 1 ? "test" : "production";
        formData.locations = [{ value: srclocID, label: locationName }];
        formData.dataStructure = type;
        formData.vendors = [vendorid];
        formData.vendorname = vendorname;
        newState.dataFlowdetail = action.dataflowDetail;
        newState.formData = formData;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
