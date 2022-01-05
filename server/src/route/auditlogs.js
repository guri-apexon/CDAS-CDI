var express = require("express");
const AuditLogController = require("../controller/AuditLogController");

var router = express.Router();

router.get("/get/:query?", AuditLogController.searchList);

module.exports = router;