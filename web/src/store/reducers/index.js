import { combineReducers } from "redux";
import DataPackageReducer from "./DataPackageReducer";
import StudyBoardReaducer from "./StudyBoardReducer";

// eslint-disable-next-line import/prefer-default-export
export const appReducer = combineReducers({
  // launchPad: launchPadReducer,
  studyBoard: StudyBoardReaducer,
  dataPackage: DataPackageReducer,
});
