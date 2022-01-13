import { AUDIT_LOGS } from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getAuditLogs = (dataflowId) => {
  return {
    type: AUDIT_LOGS,
    dataflowId,
  };
};
