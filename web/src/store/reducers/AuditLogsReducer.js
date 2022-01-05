import produce from "immer";

import {
  AUDIT_LOGS,
  AUDIT_LOGS_SUCCESS,
  AUDIT_LOGS_FAILURE,
} from "../../constants";

export const initialState = {
  data: [],
  loading: false,
  refreshData: false,
};

const AuditLogsReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case AUDIT_LOGS:
        newState.loading = true;
        break;

      case AUDIT_LOGS_SUCCESS:
        newState.loading = false;
        newState.data = action.auditLogs;
        break;

      case AUDIT_LOGS_FAILURE:
        newState.loading = true;
        newState.refreshData = false;
        break;

      default:
        break;
    }
  });

export default AuditLogsReducer;
