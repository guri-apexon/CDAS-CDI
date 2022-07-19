var express = require("express");
const PackagesController = require("../controller/PackagesController");

var router = express.Router();

router.get("/search/:dataflowId/:query?", PackagesController.searchList);
router.post("/add", PackagesController.addPackage);
router.post("/delete", PackagesController.deletePackage);
router.post("/update-status", PackagesController.changeStatus);
router.post("/change-datasets-status", PackagesController.changeDatasetsStatus);

router.get(
  "/getpassword/:dataflowid/:datapackageid",
  PackagesController.getPassword
);

module.exports = router;
