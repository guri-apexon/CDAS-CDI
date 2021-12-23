var express = require("express");
const StudyController = require("../controller/StudyController");

var router = express.Router();

router.get("/search-study/:query", StudyController.studyList);

router.post("/list", StudyController.getStudyList);

router.get("/notonboarded-studies-stat",  StudyController.noOnboardedStat)


module.exports = router;