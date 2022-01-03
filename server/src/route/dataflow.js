const express = require("express");
const DataflowController = require("../controller/DataflowController");
const router = express.Router();

router.get("/studyDataflowList/", DataflowController.getStudyDataflows);

module.exports = router;
