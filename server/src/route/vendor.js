var express = require("express");
const VendorController = require("../controller/VendorController");

var router = express.Router();

router.get("/list", VendorController.getVendorList);
router.get("/list/:vendor_id", VendorController.getVendorById);
router.get("/search-vendor/:query", VendorController.searchVendorList);
router.post("/create", VendorController.createVendor);
router.post("/update", VendorController.updateVendor);

module.exports = router;
