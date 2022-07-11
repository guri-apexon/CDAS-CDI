const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const crypto = require("crypto");
const moment = require("moment");
const constants = require("../config/constants");

exports.searchList = function (req, res) {
  try {
    const dataflowId = req.params.dataflowId;
    const searchQuery = `SELECT al.*, CONCAT(al.audit_vers, '.0') as log_version, to_char(al.audit_updt_dt , 'DD-mon-YYYY HH:MI AM') as update_dt, COALESCE(u.usr_fst_nm || ' ' || u.usr_lst_nm, '') as user_name, dp.name , mnemonic as dataset_name from  ${constants.DB_SCHEMA_NAME}.dataflow_audit_log as al
    LEFT JOIN ${constants.DB_SCHEMA_NAME}.datapackage as dp ON dp.datapackageid = al.datapackageid
    LEFT JOIN dataset as d on d.datasetid  = al.datasetid
    LEFT JOIN ${constants.DB_SCHEMA_NAME}.user as u ON u.usr_id = al.audit_updt_by
    WHERE al.dataflowid='${dataflowId}'`;
    Logger.info({ message: "AuditLogs" });

    DB.executeQuery(searchQuery).then((response) => {
      const logs = response.rows || [];
      return apiResponse.successResponseWithData(
        res,
        "Logs retreived successfully",
        {
          data: logs,
          data_count: logs.length,
        }
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :List");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
