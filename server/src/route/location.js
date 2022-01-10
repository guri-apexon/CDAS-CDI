var express = require("express");
const LocationController = require("../controller/LocationController");

var router = express.Router();

router.get("/list", LocationController.getLocationList);
router.get("/list/:location_id", LocationController.getLocationById);
router.get("/search-location/:query", LocationController.searchLocationList);
router.post("/create", LocationController.saveLocationData);
router.get("/service_owners", LocationController.getServiceOwnersList);

module.exports = router;
