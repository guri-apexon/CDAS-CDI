var express = require("express");
const DatasetController = require("../controller/DatasetController");
const DSIngestionReportController = require("../controller/DSIngestionReportController");

var router = express.Router();

router.get("/detail/:datasetid", DatasetController.getDatasetDetail);
router.post("/update", DatasetController.updateDatasetData);
router.post("/create", DatasetController.saveDatasetData);
router.post("/getVLCData", DatasetController.getVLCData);
router.post("/previewSQL", DatasetController.previewSQL);
router.post("/getTables", DatasetController.getTables);
router.post("/getColumns", DatasetController.getColumns);
router.get(
  "/ingestion-report/properties/:datasetid",
  DSIngestionReportController.getDatasetIngestionReportProperties
);
router.get(
  "/ingestion-report/transferlog/:datasetid",
  DSIngestionReportController.getDatasetIngestionReportTransferLog
);
router.get(
  "/ingestion-report/metrics/:datasetid",
  DSIngestionReportController.getDatasetIngestionReportMetrics
);

router.get(
  "/ingestion-report/issuetypes/:datasetid",
  DSIngestionReportController.getDatasetIssueTypes
);

module.exports = router;
