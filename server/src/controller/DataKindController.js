const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.createDataKind = async (req, res) => {
  try {
    const { dkId, dkName, dkDesc, dkExternalId, dkESName } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO cdascdi.datakind
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
    const query = `UPDATE cdascdi.datakind SET "name"=$3, active=$5, updt_tm=$1, dk_desc=$4 WHERE datakindid=$2 AND extrnl_sys_nm=$6`;

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
