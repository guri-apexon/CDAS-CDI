const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");

exports.getDatakindList = function (req, res) {
  try {
    let searchQuery = `SELECT datakindid,datakindid as value,CONCAT(name, ' - ', extrnl_sys_nm) as label, name from cdascdi1d.cdascdi.datakind where active= $1 order by label asc`;
    let dbQuery = DB.executeQuery(searchQuery, [1]);
    Logger.info({
      message: "datakindList",
    });

    dbQuery.then((response) => {
      const datakind = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        records: datakind,
        totalSize: response.rowCount,
      });
    }).catch((err) => {
      return apiResponse.ErrorResponse(res, err.message);
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :datakindList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};