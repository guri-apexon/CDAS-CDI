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
  GET_STUDIES_LIST,
  GET_STUDIES_LIST_SUCCESS,
  GET_STUDIES_LIST_FAILURE,
  GET_PINNED_LIST,
  GET_PINNED_LIST_SUCCESS,
  GET_PINNED_LIST_FAILURE,
  SELECTED_DATAFLOW,
  UPDATE_HEADER_COUNT,
} from "../../constants";

export const initialState = {
  loading: false,
  summaryLoading: false,
  exportStudy: null,
  ingestionData: {},
  flowData: [],
  selectedCard: {
    prot_id: "ozjow62qlqtcyxc2",
    protocolnumber: "PJIA Phase IV Study",
    protocolnumberstandard: "PJIAPHASEIVSTUDY",
    sponsorname: "ABBVIE",
    phase: "Phase 4",
    protocolstatus: "Discontinued",
    projectcode: "XZA13449",
    ingestionCount: "0",
    priorityCount: "0",
    staleFilesCount: "0",
    dfCount: "2",
    vCount: "1",
    dpCount: "3",
    dsCount: "2",
  },
  dfId: "",
  userStudies: [],
  selectedDataFlow: "",
  userPinnedStudies: [],
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

      case GET_STUDIES_LIST:
        newState.loading = true;
        break;

      case GET_STUDIES_LIST_SUCCESS:
        newState.loading = false;
        newState.userStudies = action.userStudies;
        break;

      case GET_STUDIES_LIST_FAILURE:
        newState.loading = false;
        break;

      case GET_PINNED_LIST:
        newState.loading = true;
        break;

      case GET_PINNED_LIST_SUCCESS:
        newState.loading = false;
        newState.userPinnedStudies = action.userPinnedStudies;
        break;

      case GET_PINNED_LIST_FAILURE:
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

      case UPDATE_HEADER_COUNT:
        newState.selectedCard = {
          ...state?.selectedCard,
          dfCount: action.dfCount,
          dsCount: action.dsCount,
        };
        newState.userStudies = state?.userStudies?.map((e) => {
          if (e?.prot_id === state?.selectedCard?.prot_id) {
            e.dfCount = action.dfCount;
            e.dsCount = action.dsCount;
          }
          return e;
        });
        break;

      case SELECTED_DATAFLOW:
        newState.selectedDataFlow = action.dataflow;
        break;

      default:
        break;
    }
  });

export default DashboardReducer;
