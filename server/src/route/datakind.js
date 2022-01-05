const express = require("express");
const DataKindController = require("../controller/DataKindController");
const router = express.Router();

router.post("/create", DataKindController.createDataKind);
router.post("/update", DataKindController.updateDataKind);

module.exports = router;
