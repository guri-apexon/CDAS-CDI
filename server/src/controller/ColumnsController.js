const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const config = require("../config/dbconstant.json");

exports.createColumnSet = async (req, res) => {
  try {
    const {
      columnId,
      variableLabel,
      datasetId,
      columnName,
      dataType,
      primaryKey,
      requiredKey,
      minChar,
      maxChar,
      position,
      format,
      lovs,
      uniqueKey,
    } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO ${config.DB_SCHEMA_NAME}.columndefinition (columnid, "VARIABLE", datasetid, "name", "datatype", primarykey, required, charactermin, charactermax, "position", "FORMAT", lov, "UNIQUE", insrt_tm, updt_tm)
    VALUES($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $1, $1)`;

    Logger.info({
      message: "createColumnSet",
    });

    const inset = await DB.executeQuery(insertQuery, [
      curDate,
      columnId,
      variableLabel,
      datasetId,
      columnName,
      dataType,
      primaryKey,
      requiredKey,
      minChar,
      maxChar,
      position,
      format,
      lovs,
      uniqueKey,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :createColumnSet");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateColumnSet = async (req, res) => {
  try {
    const {
      columnId,
      variableLabel,
      datasetId,
      columnName,
      dataType,
      primaryKey,
      requiredKey,
      minChar,
      maxChar,
      position,
      format,
      lovs,
      uniqueKey,
    } = req.body;
    const curDate = new Date();
    const query = `UPDATE ${config.DB_SCHEMA_NAME}.datakind SET "name"=$3, active=$5, updt_tm=$1, dk_desc=$4 WHERE datakindid=$2 AND extrnl_sys_nm=$6`;

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
