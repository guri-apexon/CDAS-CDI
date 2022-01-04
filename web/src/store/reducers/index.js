import { combineReducers } from "redux";
import { reducer as reduxFormReducer } from "redux-form";
import DataPackageReducer from "./DataPackageReducer";
import StudyBoardReaducer from "./StudyBoardReducer";
import DataFlowReducer from "./DataFlowReducer";
import AuditLogsReducer from "./AuditLogsReducer";

// eslint-disable-next-line import/prefer-default-export
export const appReducer = combineReducers({
  // launchPad: launchPadReducer,
  form: reduxFormReducer,
  studyBoard: StudyBoardReaducer,
  dataPackage: DataPackageReducer,
  dataFlow: DataFlowReducer,
  auditLogs: AuditLogsReducer,
});
