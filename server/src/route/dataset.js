var express = require("express");
const DatasetController = require("../controller/DatasetController");

var router = express.Router();

router.post("/create", DatasetController.saveDatasetData);

module.exports = router;