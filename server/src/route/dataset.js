var express = require("express");
const DatasetController = require("../controller/DatasetController");

var router = express.Router();

router.post("/create", DatasetController.saveDatasetData);
router.post("/create-columns", DatasetController.saveDatasetColumns);

module.exports = router;