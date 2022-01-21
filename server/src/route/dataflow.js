const express = require("express");
const DataflowController = require("../controller/DataflowController");
const router = express.Router();

router.post("/studyDataflowList", DataflowController.getStudyDataflows);
router.get("/detail/:dataFlowId", DataflowController.getDataflowDetail);
router.post("/createDataflow", DataflowController.createDataflow);
router.post("/hardDelete", DataflowController.hardDelete);
router.post("/activate", DataflowController.activateDataFlow);
router.post("/inActivate", DataflowController.inActivateDataFlow);
router.post("/syncNow", DataflowController.syncDataFlow);

module.exports = router;
