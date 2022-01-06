/* eslint-disable eqeqeq */
import produce from "immer";
import {
  GET_DATA_KIND,
  FETCH_DATAKIND_SUCCESS,
  FETCH_DATAKIND_FAILURE,
} from "../../constants";

export const initialState = {
  loading: false,
  createTriggered: false,
  delimiter: "COMMA",
  fileType: "SAS",
  encoding: "UTF-8",
  escapeCharacter: "\\",
  quote: `""`,
  headerRowNumber: 1,
  footerRowNumber: "",
  defaultDelimiter: "COMMA",
  defaultEscapeCharacter: "\\",
  defaultQuote: `""`,
  defaultHeaderRowNumber: 1,
  defaultFooterRowNumber: "",
  overrideStaleAlert: 3,
  rowDecreaseAllowed: 0,
  error: null,
  datakind: [],
};

const DataFlowReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case GET_DATA_KIND:
        newState.loading = true;
        break;
      case FETCH_DATAKIND_SUCCESS:
        newState.loading = false;
        newState.datakind = action.datakind;
        break;
      case FETCH_DATAKIND_FAILURE:
        newState.loading = false;
        break;
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
