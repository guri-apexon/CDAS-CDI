import produce from "immer";
// import moment from "moment";

import {
  STUDYBOARD_FETCH_SUCCESS,
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  STUDY_NOTONBOARDED_SUCCESS,
  STUDY_NOTONBOARDED_FAILURE,
} from "../../constants";

export const initialState = {
  studyboardData: [],
  notOnBoardedStudyStatus: {},
  loading: false,
  exportStudy: null,
};

const StudyBoardReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case STUDYBOARD_DATA:
        newState.loading = true;
        break;

      case STUDY_NOTONBOARDED_STATUS:
        newState.loading = true;
        break;

      case STUDYBOARD_FETCH_SUCCESS:
        newState.loading = false;
        newState.studyboardData = action.studyboardData;
        newState.uniqurePhase = action.uniqurePhase;
        newState.uniqueProtocolStatus = action.uniqueProtocolStatus;
        newState.studyboardFetchSuccess = true;
        newState.studyboardFetchFailure = false;
        break;

      case STUDY_NOTONBOARDED_SUCCESS:
        newState.loading = false;
        newState.notOnBoardedStudyStatus = action.notOnBoardedStudyStatus;
        break;

      case STUDY_NOTONBOARDED_FAILURE:
        newState.loading = true;
        break;

      default:
        break;
    }
  });

export default StudyBoardReducer;
