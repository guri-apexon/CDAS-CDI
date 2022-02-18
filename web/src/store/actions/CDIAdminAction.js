import { GET_LOCATIONS_ADMIN } from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getLocationsData = (value) => {
  return {
    type: GET_LOCATIONS_ADMIN,
    value,
  };
};
