const express = require("express");
const DataflowController = require("../controller/DataflowController");
const router = express.Router();

router.get(
  "/studyDataflowList/:protocolId",
  DataflowController.getStudyDataflows
);
router.post("/CreateDataflow",DataflowController.createDataflow)

module.exports = router;
