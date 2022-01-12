import produce from "immer";
// import moment from "moment";

import {
  PAGEHEADER_UPDATE,
  GET_DATA_FLOW_LIST,
  GET_DATA_FLOW_LIST_SUCCESS,
  GET_DATA_FLOW_LIST_FAILURE,
} from "../../constants";

export const initialState = {
  loading: false,
  exportStudy: null,
  flowData: [],
  selectedCard: {
    phase: "",
    projectcode: "",
    prot_id: "",
    protocolnumber: "",
    protocolstatus: "",
    sponsorname: "",
    vendors: "",
    dataFlows: "",
    dataSets: "",
  },
};

const DashboardReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case PAGEHEADER_UPDATE:
        newState.selectedCard = action.study;
        break;

      case GET_DATA_FLOW_LIST:
        newState.loading = true;
        break;

      case GET_DATA_FLOW_LIST_SUCCESS:
        newState.loading = false;
        newState.flowData = action.flowData;
        break;

      case GET_DATA_FLOW_LIST_FAILURE:
        newState.loading = false;
        break;

      default:
        break;
    }
  });

export default DashboardReducer;
