const express = require("express");
const DataflowController = require("../controller/DataflowController");
const router = express.Router();

router.get(
  "/studyDataflowList/:protocolId",
  DataflowController.getStudyDataflows
);
router.get(
  "/hard-delete/:dataflowId",
  DataflowController.hardDelete
);

module.exports = router;
