const express = require("express");
const ColumnSetController = require("../controller/ColumnsController");
const router = express.Router();

router.post("/create", ColumnSetController.saveDatasetColumns);
router.post("/list", ColumnSetController.getColumnsSet);
router.post("/update", ColumnSetController.updateColumns);
router.post("/delete", ColumnSetController.updateColumns);
router.post("/lov-update", ColumnSetController.lovUpdate);

module.exports = router;
