var express = require("express");
const LocationController = require("../controller/LocationController");

var router = express.Router();

router.get("/list", LocationController.getLocationList);
router.get("/list/:location_id", LocationController.getLocationById);
router.get(
  "/check-in-df/:location_id",
  LocationController.checkLocationExistsInDataFlow
);
router.get("/search-location/:query", LocationController.searchLocationList);
router.post("/create", LocationController.saveLocationData);
router.post("/update", LocationController.updateLocationData);
router.get("/service_owners", LocationController.getServiceOwnersList);
router.post("/statusUpdate", LocationController.statusUpdate);
module.exports = router;
