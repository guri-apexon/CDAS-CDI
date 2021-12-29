var express = require("express");
const PackagesController = require("../controller/PackagesController");

var router = express.Router();

router.get("/search/:query?", PackagesController.searchList);
router.post("/add", PackagesController.addPackage);

module.exports = router;