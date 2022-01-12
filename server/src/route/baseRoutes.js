const express = require("express");
const authController = require("../controller/authController");
const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.all("/sda", authController.authHandler);
router.get("/logout", authController.logoutHandler);

module.exports = router;
