const express = require("express");
const authController = require("../controller/authController");
const roleRoute = require("./role");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.all("/sda", authController.authHandler);
router.get("/logout", authController.logoutHandler);
router.use("/v1/api/role/", roleRoute);

module.exports = router;
