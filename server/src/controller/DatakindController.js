const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

async function checkIsExistInDF(dkId) {
  let listQuery = `select distinct (d3.datakindid) from ${schemaName}.dataflow d 
  right join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid 
  right join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid
  where d.active = 1 and d2.active = 1 and d3.active = 1`;
  const res = await DB.executeQuery(listQuery);
  const existingInDF = res.rows.map((e) => parseInt(e.datakindid));
  return existingInDF.includes(parseInt(dkId));
}

exports.createDataKind = async (req, res) => {
  try {
    const { dkId, dkName, dkDesc, dkExternalId, dkESName, dkStatus } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO ${schemaName}.datakind
    (datakindid, "name", extrnl_sys_nm, active, extrnl_id, insrt_tm, updt_tm, dk_desc)
    VALUES($2, $3, $6, $7, $5, $1, $1, $4)`;

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
      dkStatus,
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
    Logger.info({ message: "updateDataKind" });
    const isExist = await checkIsExistInDF(dkId);
    if (isExist) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation Failed",
        "Clinical Data Type Name cannot be inactivated until removed from all datasets using this Clinical Data Type."
      );
    } else {
      const up = await DB.executeQuery(query, [
        curDate,
        dkId,
        dkName,
        dkDesc,
        dkStatus,
        dkESName,
      ]);
      return apiResponse.successResponseWithData(res, "Operation success", up);
    }
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

exports.getDKList = async (req, res) => {
  try {
    let selectQuery = `SELECT datakindid as "dkId", name as "dkName", extrnl_sys_nm as "dkESName", dk_desc as "dkDesc", active as "dkStatus" from ${schemaName}.datakind order by name`;
    let dbQuery = await DB.executeQuery(selectQuery);
    Logger.info({ message: "getDKList" });
    const datakind = (await dbQuery.rows) || [];
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      datakind
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getDKList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.dkStatusUpdate = async (req, res) => {
  try {
    const { dkId, dkStatus } = req.body;
    const curDate = new Date();
    const query = `UPDATE ${schemaName}.datakind SET active=$3, updt_tm=$1 WHERE datakindid=$2`;
    Logger.info({ message: "dkStatusUpdate" });
    const isExist = await checkIsExistInDF(dkId);
    if (isExist) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation Failed",
        "Clinical Data Type Name cannot be inactivated until removed from all datasets using this Clinical Data Type."
      );
    } else {
      const up = await DB.executeQuery(query, [curDate, dkId, dkStatus]);
      return apiResponse.successResponseWithData(res, "Operation success", up);
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :dkStatusUpdate");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
