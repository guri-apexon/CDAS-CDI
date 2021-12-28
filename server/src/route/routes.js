const db = require("../config/db");
const express = require("express");
const authController = require("../controller/authController");

const locationRoute = require("./location");
const vendorRoute = require("./vendor");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);


router.all("/sda", authController.authHandler);

router.get("/logout", authController.logoutHandler);

router.use("/v1/api/location/", locationRoute)
router.use("/v1/api/vendor/", vendorRoute)

module.exports = router;