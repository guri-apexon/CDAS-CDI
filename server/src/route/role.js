const express = require("express");
const RoleController = require("../controller/RoleController");

const router = express.Router();
// router.post("/create", RoleController.createRole);
// router.post("/update", RoleController.updateRole);
// router.get("/", RoleController.listRoles);
// router.get("/:roleId", RoleController.getDetails);
// router.post("/update/status", RoleController.updateStatus);
router.post("/getUserRolesPermissions", RoleController.getRolesPermissions);

module.exports = router;
