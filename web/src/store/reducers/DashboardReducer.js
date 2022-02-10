import produce from "immer";
// import moment from "moment";

import {
  PAGEHEADER_UPDATE,
  GET_DATA_FLOW_LIST,
  GET_DATA_FLOW_LIST_SUCCESS,
  GET_DATA_FLOW_LIST_FAILURE,
  GET_DATASET_INGESTION_SUMMARY,
  GET_DATASET_INGESTION_SUMMARY_SUCCESS,
  GET_DATASET_INGESTION_SUMMARY_FAILURE,
} from "../../constants";

export const initialState = {
  loading: false,
  summaryLoading: false,
  exportStudy: null,
  ingestionData: {},
  flowData: [],
  selectedCard: {
    phase: "",
    projectcode: "",
    prot_id: "",
    protocolnumber: "",
    protocolstatus: "",
    sponsorname: "",
    vCount: "",
    dfCount: "",
    dsCount: "",
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

      case GET_DATASET_INGESTION_SUMMARY:
        newState.summaryLoading = true;
        break;

      case GET_DATASET_INGESTION_SUMMARY_SUCCESS:
        newState.summaryLoading = false;
        newState.ingestionData = action.ingestionData;
        break;

      case GET_DATASET_INGESTION_SUMMARY_FAILURE:
        newState.summaryLoading = false;
        break;

      default:
        break;
    }
  });

export default DashboardReducer;
