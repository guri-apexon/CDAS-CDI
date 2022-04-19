import {
  GET_VENDORS_DATA,
  GET_LOCATIONS_DATA,
  UPDATE_FORM_FIELDS,
  GET_SERVICE_OWNERS,
  GET_PASSWORD_LOCATION,
  GET_DATA_KIND,
  SAVE_LOCATION_DATA,
  HIDE_ERROR_MSG,
  UPDATE_SELECTED_LOCATION,
  GET_DATAFLOW_DETAIL,
  ADD_DATAFLOW,
  UPDATE_LOCATION_DATA,
  SAVE_DATAFLOW_LOCAL_DETAIL,
  UPDATE_DS,
  RESET_DF_FORMDATA,
  TOGGLE_DF_BTN,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getVendorsData = () => {
  return {
    type: GET_VENDORS_DATA,
  };
};

export const updateSelectedLocation = (location) => {
  return {
    type: UPDATE_SELECTED_LOCATION,
    location,
  };
};

export const addDataFlow = (dataflow) => {
  return {
    type: ADD_DATAFLOW,
    dataflow,
  };
};

export const changeFormFieldData = (e, field) => {
  return {
    type: UPDATE_FORM_FIELDS,
    field,
    value: e,
  };
};

export const getLocationsData = () => {
  return {
    type: GET_LOCATIONS_DATA,
  };
};

export const getLocationByType = (value) => {
  return {
    type: GET_LOCATIONS_DATA,
    value,
  };
};

export const getServiceOwnersData = () => {
  return {
    type: GET_SERVICE_OWNERS,
  };
};

export const getLocationPasswordData = (id) => {
  return {
    type: GET_PASSWORD_LOCATION,
    id,
  };
};

export const getDataFlowDetail = (dataflowId) => {
  return {
    type: GET_DATAFLOW_DETAIL,
    dataflowId,
  };
};

export const hideErrorMessage = () => {
  return {
    type: HIDE_ERROR_MSG,
  };
};

export const getDataKindData = () => {
  return {
    type: GET_DATA_KIND,
  };
};

export const toggleSaveDFBtn = (disabled = false) => {
  return {
    type: TOGGLE_DF_BTN,
    disabled,
  };
};

export const setDataflowLocal = (details) => {
  return {
    type: SAVE_DATAFLOW_LOCAL_DETAIL,
    details,
  };
};

export const updateDSState = (status) => {
  return {
    type: UPDATE_DS,
    status,
  };
};

export const resetDfFormData = () => {
  return {
    type: RESET_DF_FORMDATA,
  };
};
