const express = require("express");
const StudyController = require("../controller/StudyController");
const router = express.Router();

router.get("/listbyUser/:userId", StudyController.getUserStudyList);
router.post("/pinStudy", StudyController.pinStudy);
router.post("/search-study/:searchQuery", StudyController.searchStudyList);
router.get("/pinnedStudies/:userId", StudyController.getUserPinnedStudies);
router.post("/unPinStudy", StudyController.unPinStudy);
router.get("/datasetIngestionDetail/:protocolNumber", StudyController.getDatasetIngestionDashboardDetail)

module.exports = router;
