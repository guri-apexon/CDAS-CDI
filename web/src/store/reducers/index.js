import { combineReducers } from "redux";
import { reducer as reduxFormReducer } from "redux-form";
import DataPackageReducer from "./DataPackageReducer";
import DashboardReaducer from "./DashboardReducer";
import DataFlowReducer from "./DataFlowReducer";
import AuditLogsReducer from "./AuditLogsReducer";

// eslint-disable-next-line import/prefer-default-export
export const appReducer = combineReducers({
  // launchPad: launchPadReducer,
  form: reduxFormReducer,
  dashboard: DashboardReaducer,
  dataPackage: DataPackageReducer,
  dataFlow: DataFlowReducer,
  auditLogs: AuditLogsReducer,
});
