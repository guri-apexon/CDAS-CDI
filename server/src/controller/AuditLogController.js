const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const crypto = require("crypto");
const moment = require("moment");

exports.searchList = function (req, res) {
  try {
    const dataflowId = req.params.dataflowId;
    const searchQuery = `SELECT al.*, u.usr_fst_nm user_name, dp.name from cdascdi1d.cdascdi.dataflow_audit_log as al
    LEFT JOIN cdascdi1d.cdascdi.datapackage as dp ON dp.datapackageid = al.datapackageid
    LEFT JOIN cdascdi1d.cdascdi.user as u ON u.usr_id = al.usr_id
    WHERE al.dataflowid='${dataflowId}'`;
    Logger.info({
      message: "AuditLogs",
    });

    DB.executeQuery(searchQuery).then((response) => {
      const logs = response.rows || [];
      return apiResponse.successResponseWithData(res, "Logs retreived successfully", {
        data: logs,
        data_count: logs.length,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :List");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};