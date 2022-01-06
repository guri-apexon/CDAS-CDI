const db = require("../config/db");
const express = require("express");
const authController = require("../controller/authController");

const locationRoute = require("./location");
const dataPackageRoute = require("./datapackages");
const AuditLogRoute = require("./auditlogs");
const studyRoute = require("./study");
const vendorRoute = require("./vendor");
const dataFlowRoute = require("./dataflow");
const dataKindRoute = require("./datakind");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.all("/sda", authController.authHandler);

router.get("/logout", authController.logoutHandler);

router.use("/v1/api/location/", locationRoute);
router.use("/v1/api/data-package/", dataPackageRoute);
router.use("/v1/api/study/", studyRoute);
router.use("/v1/api/vendor/", vendorRoute);
router.use("/v1/api/audit-logs/", AuditLogRoute);
router.use("/v1/api/dataflow/", dataFlowRoute);
router.use("/v1/api/datakind/", dataKindRoute);

module.exports = router;
