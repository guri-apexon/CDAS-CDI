var express = require("express");
const SettingsController = require("../controller/SettingsController");

var router = express.Router();

router.get("/list", SettingsController.getSettingsList);
router.get("/search-settings/:query", SettingsController.searchSettingsList);
router.post("/create", SettingsController.saveSettingsData);
router.post("/update", SettingsController.updateSettingsData);
module.exports = router;
