var express = require("express");
const DatasetController = require("../controller/DatasetController");
const DSIngestionReportController = require("../controller/DSIngestionReportController");
const DbadapatorController = require("../controller/DbadaptorController");

var router = express.Router();

router.post("/detail/:datasetid", DatasetController.getDatasetDetail);
router.post("/update", DatasetController.updateDatasetData);
router.post("/create", DatasetController.saveDatasetData);
router.post("/getVLCData", DatasetController.getVLCData);
// router.post("/previewSQL", DatasetController.previewSql);
// router.post("/getTables", DatasetController.getTables);
// router.post("/getColumns", DatasetController.getColumns);
router.post("/previewSQL", DatasetController.previewSql);
router.post("/getTables", DbadapatorController.listtables);
router.post("/getColumns", DbadapatorController.tablecolumns);
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

router.get(
  "/ingestion-report/transferhistory/:datasetid",
  DSIngestionReportController.getFileTransferHistory
);

module.exports = router;
