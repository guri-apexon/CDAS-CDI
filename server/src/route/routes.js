const db = require("../config/db");
const express = require("express");
const authController = require("../controller/authController");
const StudyController = require("../controller/StudyController");

const studyRoute = require("./study")

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);


router.all("/sda", authController.authHandler);

router.get("/logout", authController.logoutHandler);

router.use("/v1/api/study/", studyRoute)

module.exports = router;