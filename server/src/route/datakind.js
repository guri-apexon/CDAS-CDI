var express = require("express");
const DatakindController = require("../controller/DatakindController");

var router = express.Router();

router.get("/list", DatakindController.getDatakindList);

module.exports = router;