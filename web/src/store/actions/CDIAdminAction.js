import {
  GET_LOCATIONS_ADMIN,
  GET_CDT_LIST,
  UPDATE_LOCATION_DATA,
  SAVE_LOCATION_DATA,
  HIDE_ERROR_MSG,
} from "../../constants";

export const removeErrMessage = () => {
  return {
    type: HIDE_ERROR_MSG,
  };
};

export const getLocationsData = (value) => {
  return {
    type: GET_LOCATIONS_ADMIN,
    value,
  };
};

export const saveLocationData = (values) => {
  if (values.locationID) {
    return {
      type: UPDATE_LOCATION_DATA,
      values,
    };
  }
  return {
    type: SAVE_LOCATION_DATA,
    values,
  };
};

export const getCDTList = () => {
  return { type: GET_CDT_LIST };
};
