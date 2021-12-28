import {
  GET_VENDORS_DATA,
  GET_LOCATIONS_DATA,
  UPDATE_FORM_FIELDS,
  UPDATE_SELECTED_LOCATION,
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
