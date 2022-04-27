const express = require("express");
const DataflowController = require("../controller/DataflowController");

const router = express.Router();

router.post("/studyDataflowList", DataflowController.getStudyDataflows);
router.get("/detail/:dataFlowId", DataflowController.getDataflowDetail);
router.post("/create", DataflowController.createDataflow);
router.post("/update-config", DataflowController.updateDataflowConfig);
router.post("/hard-delete", DataflowController.hardDeleteNew);
router.post("/activate", DataflowController.activateDataFlow);
router.post("/inActivate", DataflowController.inActivateDataFlow);
router.post("/syncNow", DataflowController.syncDataFlow);
router.post("/update", DataflowController.updateDataFlow);

router.post("/search-dataflow/:id", DataflowController.searchDataflow);
router.get("/:id", DataflowController.fetchdataflowSource);
router.get("/details/:id", DataflowController.fetchdataflowDetails);

module.exports = router;
