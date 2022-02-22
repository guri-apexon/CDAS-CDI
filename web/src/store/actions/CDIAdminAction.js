import { GET_LOCATIONS_ADMIN, GET_CDT_LIST } from "../../constants";

export const getLocationsData = (value) => {
  return {
    type: GET_LOCATIONS_ADMIN,
    value,
  };
};

export const getCDTList = () => {
  return { type: GET_CDT_LIST };
};
