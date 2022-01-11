const express = require("express");
const ColumnSetController = require("../controller/ColumnsController");
const router = express.Router();

router.get("/create", ColumnSetController.createColumnSet);

module.exports = router;
