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
  JOB_STATUS_FAILED: "Failed",
  JOB_STATUS_IN_QUEUE: "Queued",
  EXCEEDS_PER_CHANGE: "ExceedsPercentage",
  STALE: "Stale",
  QUARANTINE: "Quarantined",
  LATENCY_WARNING: "Datalatancywarnings",
  REFRESH_ALERTS: "ra",
  CONTROL: "control",
};

export { queryParams, queryParamsFull };
