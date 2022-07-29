/* eslint-disable eqeqeq */
import produce from "immer";
import moment from "moment";
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
  RESET_DF_FORMDATA,
  HIDE_ERROR_MSG,
  UPDATE_SELECTED_LOCATION,
  FETCH_DATAFLOW_DETAIL_FAILURE,
  FETCH_DATAFLOW_DETAIL_SUCCESS,
  ADD_DATAFLOW_SUCCESS,
  SAVE_DATAFLOW_LOCAL_DETAIL,
  UPDATE_DS,
  TOGGLE_DF_BTN,
  SET_VERSION_FREEZED,
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
  dataStructure: "Tabular",
  selectedVendor: {},
  dataFlowdetail: {},
  testProdLock: false,
  prodLock: false,
  testLock: false,
  dsTestProdLock: false,
  dsProdLock: false,
  dsTestLock: false,
  isDatasetCreation: true,
  updated: false,
  disableCreateBtn: false,
  versionFreezed: false,
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

      case UPDATE_DS:
        newState.isDatasetCreation = action.status;
        if (action.status) {
          newState.dsTestProdLock = false;
          newState.dsProdLock = false;
          newState.dsTestLock = false;
        } else {
          newState.dsTestProdLock = state.testProdLock;
          newState.dsProdLock = state.prodLock;
          newState.dsTestLock = state.testLock;
        }
        break;

      case ADD_DATAFLOW_SUCCESS:
        newState.selectedDataFlow = action.dataflow;
        newState.updated = true;
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
      case SET_VERSION_FREEZED:
        newState.versionFreezed = action.freezed ? true : false;
        break;
      case RESET_DF_FORMDATA:
        newState.formData = {};
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
      case SAVE_DATAFLOW_LOCAL_DETAIL:
        console.log("SAVE_DATAFLOW_LOCAL_DETAIL", action, state);
        // eslint-disable-next-line no-case-declarations
        const { details } = action;
        newState.dataFlowdetail = details;
        newState.loading = false;
        // newState.testLock = details.testflag === 1 && dataflow.isSync === "Y";
        // newState.prodLock = details.testflag === 0 && dataflow.isSync === "Y";
        // newState.testProdLock = dataflow.isSync === "Y";
        // newState.formData = {
        //   description: dataflow.description,
        //   firstFileDate: dataflow.exptfstprddt,
        //   locationType: dataflow.loctyp,
        //   name: dataflow.name,
        //   dataflowType: dataflow.testflag === 1 ? true : false,
        //   srclocID: dataflow.srclocID,
        //   dataStructure: dataflow.type,
        //   vendID: dataflow.vendID,
        //   vendorname: dataflow.vendorname,
        // };
        break;
      case FETCH_DATAFLOW_DETAIL_FAILURE:
        newState.loading = false;
        newState.error = action.message;
        break;
      case TOGGLE_DF_BTN:
        newState.disableCreateBtn = action.disabled;
        break;
      case FETCH_DATAFLOW_DETAIL_SUCCESS:
        newState.loading = false;
        // eslint-disable-next-line no-case-declarations
        const { dataflowDetail } = action;

        // eslint-disable-next-line no-case-declarations
        const {
          description = "",
          exptfstprddt,
          loctyp,
          name,
          srclocid,
          type,
          username,
          vendorid,
          vendorname,
          testflag,
          locationname,
          isSync,
          serviceowner,
        } = dataflowDetail;

        newState.testLock = testflag === 1 && isSync === "Y";
        newState.prodLock = testflag === 0 && isSync === "Y";
        newState.testProdLock = isSync === "Y";
        newState.dsTestLock = testflag === 1 && isSync === "Y";
        newState.dsProdLock = testflag === 0 && isSync === "Y";
        newState.dsTestProdLock = isSync === "Y";

        // eslint-disable-next-line no-case-declarations
        const formData = {};
        formData.description = description;
        formData.firstFileDate = moment(exptfstprddt).isValid()
          ? moment(exptfstprddt)
          : null;
        formData.locationType = loctyp;
        formData.name = name;
        formData.dataflowType = testflag === 1 ? "test" : "production";
        formData.locations = [{ value: srclocid, label: locationname }];
        formData.dataStructure = type;
        formData.vendors = [vendorid];
        formData.userName = username;
        formData.vendorname = vendorname;
        formData.serviceOwner = serviceowner ? serviceowner.split(",") : [];
        newState.dataFlowdetail = action.dataflowDetail;
        newState.formData = formData;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
