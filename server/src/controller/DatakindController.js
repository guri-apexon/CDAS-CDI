const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

const { addLocationCDHHistory } = require("./CommonController");

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
    const { dkName, dkDesc, dkExternalId, dkESName, dkStatus } = req.body;
    const insertQuery = `INSERT INTO ${schemaName}.datakind ("name", dk_desc, extrnl_id, extrnl_sys_nm, active, insrt_tm, updt_tm) VALUES($2, $3, $4, $5, $6, $1, $1)`;
    Logger.info({ message: "createDataKind" });
    const inset = await DB.executeQuery(insertQuery, [
      helper.getCurrentTime(),
      dkName,
      dkDesc || null,
      dkExternalId,
      dkESName,
      dkStatus,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch: createDataKind");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Clinical data type name and external system name combination already exists."
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatakindList = function (req, res) {
  try {
    let searchQuery = `SELECT datakindid,datakindid as value,CONCAT(name, ' - ', extrnl_sys_nm) as label, name from ${schemaName}.datakind where active= $1 order by label asc`;
    let dbQuery = DB.executeQuery(searchQuery, [1]);
    Logger.info({ message: "datakindList" });

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

exports.getENSList = async (req, res) => {
  try {
    Logger.info({ message: "getENSList" });
    const selectQuery = `select lov_nm, lov_id from ${schemaName}.cdas_core_lov ccl where lov_typ = 'externalsystemname' and act_flg = 1`;
    const list = await DB.executeQuery(selectQuery);
    const formatted = list.rows.map((e) => {
      return { label: e.lov_nm, value: e.lov_id };
    });
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      formatted || []
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getENSList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateDataKind = async (req, res) => {
  try {
    const { dkId, dkName, dkDesc, dkStatus, dkESName, dkExternalId, userId } =
      req.body;
    Logger.info({ message: "updateDataKind" });
    const curDate = helper.getCurrentTime();
    const isExist = await checkIsExistInDF(dkId);

    if (isExist) {
      let getReleatedDF = `select distinct (d.dataflowid), max (dv."version") from ${schemaName}.dataflow d 
      inner join ${schemaName}.dataflow_version dv on d.dataflowid = dv.dataflowid 
      right join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid 
      right join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid
      where d.active = 1 and d2.active = 1 and d3.active = 1 and d3.datakindid=$1 group by d.dataflowid`;

      const updatedData = await DB.executeQuery(
        `UPDATE ${schemaName}.datakind SET "name"=$1, extrnl_sys_nm=$2, extrnl_id=$3, dk_desc=$5, updt_tm=$4 WHERE datakindid=$6 RETURNING *`,
        [dkName, dkESName, dkExternalId, curDate, dkDesc, dkId]
      );

      if (!updatedData?.rowCount) {
        return apiResponse.ErrorResponse(res, "Something went wrong on update");
      }

      const dfList = await DB.executeQuery(getReleatedDF, [dkId]);

      const { rows: existRows } = await DB.executeQuery(
        `SELECT "name", extrnl_sys_nm, dk_desc FROM ${schemaName}.datakind where datakindid = $1`,
        [dkId]
      );
      const existingObj = existRows[0];

      dfList?.rows?.forEach(async (row) => {
        const dataflowId = row.dataflowid;
        const datakindObj = updatedData.rows[0];
        const comparisionObj = {
          name: dkName,
          extrnl_sys_nm: dkESName,
          dk_desc: dkDesc,
        };
        const diffObj = helper.getdiffKeys(comparisionObj, existingObj);
        await addLocationCDHHistory({
          dataflowId,
          externalSystemName: "CDI",
          userId,
          config_json: datakindObj,
          diffObj,
          existingObj,
        });
      });

      return apiResponse.successResponse(res, "Updated successfully");
    } else {
      DB.executeQuery(
        `UPDATE ${schemaName}.datakind SET "name"=$2, extrnl_sys_nm=$3, active=$4, extrnl_id=$5, updt_tm=$6, dk_desc=$7 WHERE datakindid=$1`,
        [dkId, dkName, dkESName, dkStatus, dkExternalId, curDate, dkDesc]
      )
        .then(() => {
          return apiResponse.successResponse(res, "Operation success");
        })
        .catch((err) => {
          return apiResponse.validationErrorWithData(
            res,
            "Operation failed",
            err
          );
        });
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateDataKind");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Clinical data type name and external system name combination already exists."
      );
    }
    return apiResponse.ErrorResponse(res, "Something went wrong try again");
  }
};

exports.dkStatusUpdate = async (req, res) => {
  try {
    const { dkId, dkStatus } = req.body;
    const curDate = helper.getCurrentTime();
    const query = `UPDATE ${schemaName}.datakind SET updt_tm=$3, active=$1 WHERE datakindid=$2`;
    Logger.info({ message: "dkStatusUpdate" });
    const isExist = await checkIsExistInDF(dkId);
    if (isExist) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation Failed",
        "Clinical Data Type Name cannot be inactivated until removed from all datasets using this Clinical Data Type."
      );
    } else {
      const up = await DB.executeQuery(query, [dkStatus, dkId, curDate]);
      return apiResponse.successResponseWithData(res, "Operation success", up);
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :dkStatusUpdate");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
