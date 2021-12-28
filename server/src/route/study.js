const express = require("express");
const StudyController = require("../controller/studyController");

const router = express.Router();

router.get("/listbyUser/:query", StudyController.getUserStudyList);
router.post("/pinStudy", StudyController.pinStudy);
router.post("/searchStudy", StudyController.searchUserStudyList);

module.exports = router;
