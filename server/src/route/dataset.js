var express = require("express");
const DatasetController = require("../controller/DatasetController");

var router = express.Router();

router.get("/detail/:datasetid", DatasetController.getDatasetDetail);
router.post("/update", DatasetController.updateDatasetData);
router.post("/create", DatasetController.saveDatasetData);
router.post("/create-columns", DatasetController.saveDatasetColumns);
router.post("/getVLCData", DatasetController.getVLCData);

module.exports = router;
