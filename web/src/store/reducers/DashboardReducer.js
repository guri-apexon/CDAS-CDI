import produce from "immer";
// import moment from "moment";

import {
  DASHBOARD_FETCH_SUCCESS,
  DASHBOARD_FETCH_FAILUR,
  DASHBOARD_DATA,
  PAGEHEADER_UPDATE,
} from "../../constants";

export const initialState = {
  dashboardData: [],
  notOnBoardedStudyStatus: {},
  loading: false,
  exportStudy: null,
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
      case DASHBOARD_DATA:
        newState.loading = true;
        break;

      case PAGEHEADER_UPDATE:
        newState.selectedCard = action.study;
        break;

      case DASHBOARD_FETCH_SUCCESS:
        newState.loading = false;
        newState.studyboardData = action.studyboardData;
        newState.vendors = action.vendors;
        newState.dataFlows = action.dataFlows;
        newState.dataSets = action.dataSets;
        break;

      case DASHBOARD_FETCH_FAILUR:
        newState.loading = false;
        newState.vendors = 0;
        newState.dataFlows = 0;
        newState.dataSets = 0;
        break;

      default:
        break;
    }
  });

export default DashboardReducer;
