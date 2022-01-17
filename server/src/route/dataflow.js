const express = require("express");
const DataflowController = require("../controller/DataflowController");
const router = express.Router();

router.get(
  "/studyDataflowList/:protocolId",
  DataflowController.getStudyDataflows
);
router.get("/detail/:dataFlowId", DataflowController.getDataflowDetail);
router.post("/CreateDataflow",DataflowController.createDataflow)
router.post("/hard-delete", DataflowController.hardDelete);
router.post("/activate", DataflowController.activateDataFlow);
router.post("/inActivate", DataflowController.inActivateDataFlow);
router.post("/SyncAPI", DataflowController.SyncAPI);

module.exports = router;
