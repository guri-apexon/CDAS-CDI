const express = require("express");
const DatakindController = require("../controller/DatakindController");
const router = express.Router();

router.post("/create", DatakindController.createDataKind);
router.post("/update", DatakindController.updateDataKind);
router.get("/list", DatakindController.getDatakindList);

module.exports = router;
