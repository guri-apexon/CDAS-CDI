const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.createDataKind = async (req, res) => {
  try {
    const { dkId, dkName, dkDesc, dkExternalId, dkESName } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO ${schemaName}.datakind
    (datakindid, "name", extrnl_sys_nm, active, extrnl_id, insrt_tm, updt_tm, dk_desc)
    VALUES($2, $3, $6, 0, $5, $1, $1, $4)`;

    Logger.info({
      message: "createDataKind",
    });

    const inset = await DB.executeQuery(insertQuery, [
      curDate,
      dkId,
      dkName,
      dkDesc,
      dkExternalId,
      dkESName,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :createDataKind");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateDataKind = async (req, res) => {
  try {
    const { dkId, dkName, dkDesc, dkStatus, dkESName } = req.body;
    const curDate = new Date();
    const query = `UPDATE ${schemaName}.datakind SET "name"=$3, active=$5, updt_tm=$1, dk_desc=$4 WHERE datakindid=$2 AND extrnl_sys_nm=$6`;

    Logger.info({
      message: "updateDataKind",
    });

    const up = await DB.executeQuery(query, [
      curDate,
      dkId,
      dkName,
      dkDesc,
      dkStatus,
      dkESName,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", up);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateDataKind");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatakindList = function (req, res) {
  try {
    let searchQuery = `SELECT datakindid,datakindid as value,CONCAT(name, ' - ', extrnl_sys_nm) as label, name from ${schemaName}.datakind where active= $1 order by label asc`;
    let dbQuery = DB.executeQuery(searchQuery, [1]);
    Logger.info({
      message: "datakindList",
    });

    dbQuery
      .then((response) => {
        const datakind = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: datakind,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :datakindList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDKList = function (req, res) {
  try {
    let selectQuery = `SELECT datakindid as dkId, name as dkName, extrnl_sys_nm as dkESName, dk_desc as dkDesc, active as dkStatus from ${schemaName}.datakind order by dkName`;
    let dbQuery = DB.executeQuery(selectQuery);
    Logger.info({ message: "getDKList" });
    dbQuery
      .then((response) => {
        const datakind = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          datakind,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getDKList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
