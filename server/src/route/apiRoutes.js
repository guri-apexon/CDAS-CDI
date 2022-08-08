const express = require("express");

const locationRoute = require("./location");
const dataPackageRoute = require("./datapackages");
const AuditLogRoute = require("./auditlogs");
const studyRoute = require("./study");
const studyMonitorRoute = require("./studymonitor");
const vendorRoute = require("./vendor");
const dataFlowRoute = require("./dataflow");
const dataKindRoute = require("./datakind");
const columnSetRoute = require("./columnSet");
const datasetRoute = require("./dataset");
const systemSettingsRoute = require("./settings");
const CommonController = require("../controller/CommonController");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.use("/location/", locationRoute);
router.use("/data-package/", dataPackageRoute);
router.use("/study/", studyRoute);
router.use("/monitor/", studyMonitorRoute);
router.use("/vendor/", vendorRoute);
router.use("/audit-logs/", AuditLogRoute);
router.use("/dataflow/", dataFlowRoute);
router.use("/columnset/", columnSetRoute);
router.use("/datakind/", dataKindRoute);
router.use("/dataset/", datasetRoute);
router.use("/system-settings/", systemSettingsRoute);

//fsr-connect API
router.post("/fsr-connect", CommonController.fsrConnect);

module.exports = router;
