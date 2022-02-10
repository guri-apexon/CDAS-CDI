const express = require("express");
const ColumnSetController = require("../controller/ColumnsController");
const router = express.Router();

router.post("/create/:datasetid", ColumnSetController.saveDatasetColumns);
router.post("/list", ColumnSetController.getColumnsSet);

module.exports = router;
