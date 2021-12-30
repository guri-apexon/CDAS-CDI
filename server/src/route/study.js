const express = require("express");
const StudyController = require("../controller/studyController");
const router = express.Router();

router.get("/listbyUser/:userId", StudyController.getUserStudyList);
router.post("/pinStudy", StudyController.pinStudy);
router.get("/search-study/:searchQuery", StudyController.searchStudyList);
router.get("/pinnedStudies/:userId", StudyController.getUserPinnedStudies);
router.post("/unPinStudy", StudyController.unPinStudy);

module.exports = router;
