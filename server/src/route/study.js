const express = require("express");
const StudyController = require("../controller/studyController");
const router = express.Router();

router.get("/listbyUser/:query", StudyController.getUserStudyList);
router.post("/pinStudy", StudyController.pinStudy);
router.get("/search-study/:searchQuery", StudyController.searchUserStudyList);

module.exports = router;
