var express = require("express");
const HardDeleteController = require("../controller/HardDeleteController");
var router = express.Router();

router.post("/hard-delete", HardDeleteController.hardDelete);

module.exports = router;
