const express = require("express");
const StudyControllerMonitor = require("../controller/StudyControllerMonitor");
const router = express.Router();

router.get(
  "/datasetIngestionDetail/:userId(*)",
  StudyControllerMonitor.getDatasetIngestionMonitorDetail
);

module.exports = router;
