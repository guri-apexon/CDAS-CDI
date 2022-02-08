var express = require("express");
const DatasetController = require("../controller/DatasetController");

var router = express.Router();

router.get("/detail/:datasetid", DatasetController.getDatasetDetail);
router.post("/update", DatasetController.updateDatasetData);
router.post("/create", DatasetController.saveDatasetData);
router.post("/getVLCData", DatasetController.getVLCData);
router.post("/previewSQL", DatasetController.previewSQL);
router.post("/getTables", DatasetController.getTables);
router.post("/getColumns", DatasetController.getColumns);

module.exports = router;
