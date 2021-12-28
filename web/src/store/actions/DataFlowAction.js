import {
  GET_VENDORS_DATA,
  GET_LOCATIONS_DATA,
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

export const getLocationsData = () => {
  return {
    type: GET_LOCATIONS_DATA,
  };
};
