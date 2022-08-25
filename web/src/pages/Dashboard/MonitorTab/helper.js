/* eslint-disable import/prefer-default-export */
const queryParams = {
  JOB_STATUS_FAILED: "jsf",
  JOB_STATUS_IN_QUEUE: "jsq",
  EXCEEDS_PER_CHANGE: "epc",
  STALE: "stale",
  QUARANTINE: "quarantine",
  LATENCY_WARNING: "lw",
  REFRESH_ALERTS: "ra",
  CONTROL: "control",
};

const queryParamsFull = {
  JOB_STATUS_FAILED: "FAILED",
  JOB_STATUS_IN_QUEUE: "QUEUED",
  EXCEEDS_PER_CHANGE: "EXCEEDSPERCENTAGE",
  STALE: "STALE",
  QUARANTINE: "QUARANTINED",
  LATENCY_WARNING: "DATALATENCYWARNINGS",
  REFRESH_ALERTS: "ra",
  CONTROL: "control",
};

export { queryParams, queryParamsFull };
