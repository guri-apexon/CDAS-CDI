const express = require("express");
const DatakindController = require("../controller/DatakindController");
const router = express.Router();

router.post("/create", DatakindController.createDataKind);
// router.post("/update", DatakindController.updateDataKind);
router.get("/list", DatakindController.getDatakindList);
router.get("/table/list", DatakindController.getDKList);
router.post("/status-update", DatakindController.dkStatusUpdate);
router.get("/ens/list", DatakindController.getENSList);

module.exports = router;
