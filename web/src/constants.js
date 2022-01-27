export const PATH = "Path";
export const Success = "success";
export const Warning = "warning";
export const Info = "info";
export const Error = "error";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";

export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAILURE = "AUTH_FAILURE";

export const DASHBOARD_DATA = "DASHBOARD_DATA";
export const DASHBOARD_FETCH_SUCCESS = "DASHBOARD_FETCH_SUCCESS";
export const DASHBOARD_FETCH_FAILUR = "DASHBOARD_FETCH_FAILUR";

export const PAGEHEADER_UPDATE = "PAGEHEADER_UPDATE";
export const GET_DATA_FLOW_LIST = "GET_DATA_FLOW_LIST";
export const GET_DATA_FLOW_LIST_SUCCESS = "GET_DATA_FLOW_LIST_SUCCESS";
export const GET_DATA_FLOW_LIST_FAILURE = "GET_DATA_FLOW_LIST_FAILURE";
export const ADD_DATAFLOW_SUCCESS = "ADD_DATAFLOW_SUCCESS";
export const ADD_DATAFLOW_FAILURE = "ADD_DATAFLOW_FAILURE";
export const ADD_DATAFLOW = "ADD_DATAFLOW";
export const DATAFLOWS_LIST_FAILURE = "DATAFLOWS_LIST_FAILURE";

export const PACKAGES_LIST = "PACKAGES_LIST";
export const ADD_PACKAGE_BTN = "ADD_PACKAGE_BTN";
export const PACKAGES_LIST_SUCCESS = "PACKAGES_LIST_SUCCESS";
export const PACKAGES_LIST_FAILURE = "PACKAGES_LIST_FAILURE";
export const ADD_DATA_PACKAGE = "ADD_DATA_PACKAGE";
export const ADD_PACKAGE_SUCCESS = "ADD_PACKAGE_SUCCESS";
export const ADD_PACKAGE_FAILURE = "ADD_PACKAGE_FAILURE";

export const UPDATE_DATA_PACKAGE = "UPDATE_DATA_PACKAGE";
export const UPDATE_DATA_PACKAGE_SUCCESS = "UPDATE_DATA_PACKAGE_SUCCESS";
export const UPDATE_DATA_PACKAGE_FAILURE = "UPDATE_DATA_PACKAGE_FAILURE";
export const GET_VENDORS_DATA = "GET_VENDORS_DATA";
export const GET_LOCATIONS_DATA = "GET_LOCATIONS_DATA";
export const GET_DATA_KIND = "GET_DATA_KIND";

export const FETCH_DATAKIND_SUCCESS = "FETCH_DATAKIND_SUCCESS";
export const FETCH_DATAKIND_FAILURE = "FETCH_DATAKIND_FAILURE";
export const FETCH_LOCATION_SUCCESS = "FETCH_LOCATION_SUCCESS";
export const FETCH_LOCATION_FAILURE = "FETCH_LOCATION_FAILURE";
export const FETCH_VENDOR_SUCCESS = "FETCH_VENDOR_SUCCESS";
export const FETCH_VENDOR_FAILURE = "FETCH_VENDOR_FAILURE";
export const UPDATE_SELECTED_LOCATION = "UPDATE_SELECTED_LOCATION";
export const UPDATE_FORM_FIELDS = "UPDATE_FORM_FIELDS";
export const SAVE_LOCATION_DATA = "SAVE_LOCATION_DATA";
export const GET_SERVICE_OWNERS = "GET_SERVICE_OWNERS";
export const FETCH_SERVICE_OWNERS_SUCCESS = "FETCH_SERVICE_OWNERS_SUCCESS";
export const FETCH_SERVICE_OWNERS_FAILURE = "FETCH_SERVICE_OWNERS_FAILURE";

export const GET_DATAFLOW_DETAIL = "GET_DATAFLOW_DETAIL";
export const FETCH_DATAFLOW_DETAIL_SUCCESS = "FETCH_DATAFLOW_DETAIL_SUCCESS";
export const FETCH_DATAFLOW_DETAIL_FAILURE = "FETCH_DATAFLOW_DETAIL_FAILURE";

export const GET_DATASET_DETAIL = "GET_DATASET_DETAIL";
export const FETCH_DATASET_DETAIL_SUCCESS = "FETCH_DATASET_DETAIL_SUCCESS";
export const FETCH_DATASET_DETAIL_FAILURE = "FETCH_DATASET_DETAIL_FAILURE";

export const GET_LOCATION_BY_TYPE = "FETCH_SERVICE_OWNERS_FAILURE";
export const STORE_LOCATION_SUCCESS = "STORE_LOCATION_SUCCESS";
export const STORE_LOCATION_FAILURE = "STORE_LOCATION_FAILURE";
export const HIDE_ERROR_MSG = "HIDE_ERROR_MSG";
export const AUDIT_LOGS = "AUDIT_LOGS";
export const AUDIT_LOGS_SUCCESS = "AUDIT_LOGS_SUCCESS";
export const AUDIT_LOGS_FAILURE = "AUDIT_LOGS_FAILURE";

export const REDIRECT_TO_DATASET = "REDIRECT_TO_DATASET";
export const SAVE_DATASET_DATA = "SAVE_DATASET_DATA";
export const UPDATE_DATASET_DATA = "UPDATE_DATASET_DATA";
export const STORE_DATASET_SUCCESS = "STORE_DATASET_SUCCESS";
export const STORE_DATASET_FAILURE = "STORE_DATASET_FAILURE";
export const SAVE_DATASET_COLUMNS = "SAVE_DATASET_COLUMNS";
export const STORE_DATASET_COLUMNS_SUCCESS = "STORE_DATASET_COLUMNS_SUCCESS";
export const STORE_DATASET_COLUMNS_FAILURE = "STORE_DATASET_COLUMNS_FAILURE";
export const UPDATE_DATASET_SUCCESS = "UPDATE_DATASET_SUCCESS";
export const UPDATE_DATASET_FAILURE = "UPDATE_DATASET_FAILURE";
export const GET_DATASET_COLUMNS = "GET_DATASET_COLUMNS";
export const FETCH_DATASET_COLUMNS_SUCCESS = "FETCH_DATASET_COLUMNS_SUCCESS";
export const FETCH_DATASET_COLUMNS_FAILURE = "FETCH_DATASET_COLUMNS_FAILURE";
// API URLS

export const FLOW_DATA_FETCH = "v1/api/dataflow/studyDataflowList";
export const STUDYSEARCH = "v1/api/study/search-study";
export const HARDDELETE = "v1/api/dataflow/hardDelete";
export const SYNCNOW = "v1/api/dataflow/syncNow";
export const ACTIVATEDF = "v1/api/dataflow/activate";
export const INACTIVATE = "v1/api/dataflow/inActivate";
export const DATAFLOW_SAVE = "v1/api/dataflow/createDataflow";
export const PACKAGES_SEARCH = "v1/api/data-package/search";
export const ADD_PACKAGE = "v1/api/data-package/add";
export const DELETE_PACKAGE = "v1/api/data-package/delete";
export const UPDATE_PACKAGE = "v1/api/data-package/update-status";
export const NOT_ONBOARDED_FETCH = "v1/api/study/notonboarded-studies-stat";
export const STUDYLIST = "v1/api/study/listbyUser";
export const PINNEDSTUDY = "v1/api/study/pinnedStudies";
export const UNPINSTUDY = "v1/api/study/unPinStudy";
export const PINSTUDY = "v1/api/study/pinStudy";
export const AUDIT_LOGS_FETCH = "v1/api/audit-logs/get";

export const LOCATIONAPI = "v1/api/location";
export const VENDORAPI = "v1/api/vendor";
export const DATAKINDAPI = "v1/api/datakind";
export const DATASETAPI = "v1/api/dataset";
export const DATAFLOWAPI = "v1/api/dataflow";
export const VLCDATAAPI = "v1/api/dataset/getVLCData";

export const baseURL = process.env.REACT_APP_API_URL;
