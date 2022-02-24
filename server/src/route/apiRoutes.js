const express = require("express");

const locationRoute = require("./location");
const dataPackageRoute = require("./datapackages");
const AuditLogRoute = require("./auditlogs");
const studyRoute = require("./study");
const vendorRoute = require("./vendor");
const dataFlowRoute = require("./dataflow");
const dataKindRoute = require("./datakind");
const columnSetRoute = require("./columnSet");
const datasetRoute = require("./dataset");
const systemSettingsRoute = require("./settings");

const router = express.Router();
// const alother= express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

// router.use("/", alothers);

router.use("/location/", locationRoute);
router.use("/data-package/", dataPackageRoute);
router.use("/study/", studyRoute);
// alothers.use("/study/", studyRoute);
router.use("/vendor/", vendorRoute);
router.use("/audit-logs/", AuditLogRoute);
router.use("/dataflow/", dataFlowRoute);
router.use("/columnset/", columnSetRoute);
router.use("/datakind/", dataKindRoute);
router.use("/dataset/", datasetRoute);
router.use("/system-settings/", systemSettingsRoute);

module.exports = router;
