import { combineReducers } from "redux";
import { reducer as reduxFormReducer } from "redux-form";
import StudyBoardReaducer from "./StudyBoardReducer";
import DataFlowReducer from "./DataFlowReducer";

// eslint-disable-next-line import/prefer-default-export
export const appReducer = combineReducers({
  // launchPad: launchPadReducer,
  form: reduxFormReducer,
  studyBoard: StudyBoardReaducer,
  dataFlow: DataFlowReducer,
});
