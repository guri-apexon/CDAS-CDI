var express = require("express");
const DatasetController = require("../controller/DatasetController");

var router = express.Router();

router.get("/:datasetid/dataset-columns", DatasetController.getDatasetColumns);
router.get("/detail/:datasetid", DatasetController.getDatasetDetail);
router.post("/update", DatasetController.updateDatasetData);
router.post("/create", DatasetController.saveDatasetData);
router.post("/:datasetid/create-columns", DatasetController.saveDatasetColumns);

module.exports = router;