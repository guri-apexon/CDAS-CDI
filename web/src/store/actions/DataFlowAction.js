import {
  GET_VENDORS_DATA,
  GET_LOCATIONS_DATA,
  UPDATE_FORM_FIELDS,
  GET_SERVICE_OWNERS,
  GET_DATA_KIND,
  SAVE_LOCATION_DATA,
  HIDE_ERROR_MSG,
  UPDATE_SELECTED_LOCATION,
  GET_DATAFLOW_DETAIL,
  ADD_DATAFLOW,
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

export const saveLocationData = (values) => {
  return {
    type: SAVE_LOCATION_DATA,
    values,
  };
};

export const getServiceOwnersData = () => {
  return {
    type: GET_SERVICE_OWNERS,
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
