const express = require("express");
const StudyControllerMonitor = require("../controller/StudyControllerMonitor");
const router = express.Router();

router.get(
  "/datasetIngestionDetail/:userId(*)",
  StudyControllerMonitor.getDatasetIngestionMonitorDetail
);

router.get(
  "/ingestionMonitorDataSets/:userId(*)",
  StudyControllerMonitor.getIngestionMonitorDataSets
);

module.exports = router;
