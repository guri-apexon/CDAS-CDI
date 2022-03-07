var express = require("express");
const HardDeleteController = require("../controller/HardDeleteController");
var router = express.Router();

router.post("/add-edit-delete", HardDeleteController.addEdit);

module.exports = router;
