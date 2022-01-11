var express = require("express");
const DatakindController = require("../controller/DatakindController");

var router = express.Router();

router.get("/list", DatakindController.getDatakindList);
router.post("/create", DatakindController.createDataKind);
router.post("/update", DatakindController.updateDataKind);

module.exports = router;
