const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const crypto = require("crypto");
const moment = require("moment");

exports.searchList = function (req, res) {
  try {
    const searchParam = req.params.query?.toLowerCase() || '';
    const searchQuery = `SELECT * from cdascdi1d.cdascdi.dataflow_audit_log`;
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