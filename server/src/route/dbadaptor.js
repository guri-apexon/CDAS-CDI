var express = require("express");
const dbadaptorController = require("../controller/dbadaptorController");

var router = express.Router();

router.post("/listtables", dbadaptorController.listtables);
router.post("/tablecolumns", dbadaptorController.tablecolumns);

module.exports = router;
