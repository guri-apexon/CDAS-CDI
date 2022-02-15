var express = require("express");
const PackagesController = require("../controller/PackagesController");

var router = express.Router();

router.get("/search/:dataflowId/:query?", PackagesController.searchList);
router.post("/add", PackagesController.addPackage);
router.post("/delete", PackagesController.deletePackage);
router.post("/update-status", PackagesController.changeStatus);

module.exports = router;