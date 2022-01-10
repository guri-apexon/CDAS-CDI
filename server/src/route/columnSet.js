const express = require("express");
const ColumnSetController = require("../controller/ColumnsController");
const router = express.Router();

router.get("/create", ColumnSetController.ColumnSetController);

module.exports = router;
