/* eslint-disable no-case-declarations */
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
  UPDATE_DF_STATUS,
} from "../../constants";

export const initialState = {
  loading: false,
  summaryLoading: false,
  exportStudy: null,
  ingestionData: {},
  flowData: [],
  selectedCard: {
    prot_id: "",
    protocolnumber: "",
    protocolnumberstandard: "",
    sponsorname: "",
    phase: "",
    protocolstatus: "",
    projectcode: "",
    ingestionCount: "",
    priorityCount: "",
    staleFilesCount: "",
    ActiveDfCount: "",
    InActiveDfCount: "",
    vCount: "",
    dpCount: "",
    ActiveDsCount: "",
    InActiveDsCount: "",
    dfCount: "",
    dsCount: "",
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

      case UPDATE_DF_STATUS:
        const updateDF = state.flowData.map((df) => {
          if (df.dataFlowId === action.dfId) {
            return {
              ...df,
              status: action.newStatus,
            };
          }
          return df;
        });
        newState.selectedDataFlow = {
          ...state.selectedDataFlow,
          status: action.newStatus,
        };
        newState.flowData = updateDF;
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
          ActiveDfCount: action.ActiveDfCount,
          InActiveDfCount: action.InActiveDfCount,
          ActiveDsCount: action.ActiveDsCount,
          InActiveDsCount: action.InActiveDsCount,
        };
        newState.userStudies = state?.userStudies?.map((e) => {
          let newObj = {};
          if (e.prot_id === state?.selectedCard?.prot_id) {
            newObj = {
              ...e,
              dfCount: action.dfCount,
              dsCount: action.dsCount,
              ActiveDfCount: action.ActiveDfCount,
              InActiveDfCount: action.InActiveDfCount,
              ActiveDsCount: action.ActiveDsCount,
              InActiveDsCount: action.InActiveDsCount,
            };
          } else {
            newObj = {
              ...e,
            };
          }
          return newObj;
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
