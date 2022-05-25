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
  const existingInDF = res.rows.map((e) => e.datakindid);
  return existingInDF.includes(dkId.toString());
}

const updateSuccess = `Clinical Data Type was updated successfully`;
const savedSuccess = `Clinical Data Type was saved successfully`;
const commonError = `Something went wrong`;
const mandatoryMissing = `Please check payload mandatory fields are missing`;
const alreadyExist = `Clinical data type name and external system name combination already exists.`;
const inactiveNotAllowed = `Clinical Data Type Name cannot be inactivated until removed from all datasets using this Clinical Data Type.`;

const insertQuery = `INSERT INTO ${schemaName}.datakind ("name", dk_desc, extrnl_sys_nm, active, extrnl_id, insrt_tm, updt_tm) VALUES($2, $3, $4, $5, $6, $1, $1) RETURNING *`;
const updateQuery = `UPDATE ${schemaName}.datakind SET "name"=$2, dk_desc=$3, extrnl_sys_nm=$4, extrnl_id=$5, updt_tm=$1 WHERE datakindid=$6 RETURNING *`;
const updateActive = `UPDATE ${schemaName}.datakind SET "name"=$2, dk_desc=$3, extrnl_sys_nm=$4, active=$5, extrnl_id=$6, updt_tm=$1 WHERE datakindid=$7 RETURNING *`;
const selectQuery = `SELECT * FROM ${schemaName}.datakind WHERE datakindid=$1`;
const selectExternalId = `SELECT * FROM ${schemaName}.datakind WHERE extrnl_id=$1`;
const selectExist = `SELECT "name", extrnl_sys_nm, dk_desc FROM ${schemaName}.datakind where datakindid = $1`;

const getReleatedDF = `select distinct (d.dataflowid), max (dv."version") from ${schemaName}.dataflow d 
inner join ${schemaName}.dataflow_version dv on d.dataflowid = dv.dataflowid 
right join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid 
right join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid
where d.active = 1 and d2.active = 1 and d3.active = 1 and d3.datakindid=$1 group by d.dataflowid`;

exports.createDataKind = async (req, res) => {
  try {
    Logger.info({ message: "handle datakind" });
    const {
      dkId,
      dkName,
      dkDesc,
      ExternalId,
      dkESName,
      dkStatus,
      systemName,
      userId,
    } = req.body;

    const curDate = helper.getCurrentTime();

    if (!dkName || !dkESName || !dkStatus) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        mandatoryMissing
      );
    }

    let payload = [curDate, dkName, dkDesc || null, dkESName];

    // for cdi application
    if (systemName === "CDI") {
      //create datakind for cdi application
      if (!dkId) {
        const inset = await DB.executeQuery(insertQuery, [
          ...payload,
          dkStatus,
          null,
        ]);
        return apiResponse.successResponseWithData(
          res,
          savedSuccess,
          inset.rows[0]
        );
      }

      const existingDK = await DB.executeQuery(selectQuery, [dkId]);

      if (!existingDK?.rowCount) {
        return apiResponse.ErrorResponse(res, commonError);
      } else {
        const isExist = await checkIsExistInDF(dkId);

        // inactivating status is not allowed
        if (isExist && !existingDK.rows[0].active === dkStatus) {
          return apiResponse.ErrorResponse(res, inactiveNotAllowed);
        }

        // update datakind and related dataflow
        if (isExist) {
          const updatedData = await DB.executeQuery(updateQuery, [
            ...payload,
            null,
            dkId,
          ]);

          if (!updatedData?.rowCount) {
            return apiResponse.ErrorResponse(res, commonError);
          }

          const dfList = await DB.executeQuery(getReleatedDF, [dkId]);
          const { rows: existRows } = await DB.executeQuery(selectExist, [
            dkId,
          ]);

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

            // updating dataflow version and audit history
            await addLocationCDHHistory({
              dataflowId,
              externalSystemName: systemName,
              userId,
              config_json: datakindObj,
              diffObj,
              existingObj,
            });
          });
          return apiResponse.successResponse(res);
        } else {
          await DB.executeQuery(updateActive, [
            ...payload,
            dkStatus,
            null,
            dkId,
          ]);

          return apiResponse.successResponse(res, updateSuccess);
        }
      }
    }

    if (!ExternalId) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        mandatoryMissing
      );
    }

    const existingDK = await DB.executeQuery(selectExternalId, [ExternalId]);

    // create datakind for external system
    if (existingDK?.rowCount) {
      // update of datakind for external system
      let id = existingDK?.rows[0]?.datakindid;
      const isExist = await checkIsExistInDF(id);

      // inactivating status is not allowed
      if (isExist && !existingDK.rows[0].active === dkStatus) {
        return apiResponse.ErrorResponse(res, inactiveNotAllowed);
      }

      // update datakind and related dataflow
      if (isExist) {
        const updatedData = await DB.executeQuery(updateQuery, [
          ...payload,
          null,
          id,
        ]);

        if (!updatedData?.rowCount) {
          return apiResponse.ErrorResponse(res, commonError);
        }

        const dfList = await DB.executeQuery(getReleatedDF, [id]);
        const { rows: existRows } = await DB.executeQuery(selectExist, [id]);

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

          // updating dataflow version and audit history
          await addLocationCDHHistory({
            dataflowId,
            externalSystemName: dkESName,
            userId,
            config_json: datakindObj,
            diffObj,
            existingObj,
          });
        });
        return apiResponse.successResponseWithMoreData(res, { ExternalId, id });
      } else {
        await DB.executeQuery(updateActive, [...payload, dkStatus, null, id]);
        return apiResponse.successResponseWithMoreData(res, { ExternalId, id });
      }
    } else {
      const inset = await DB.executeQuery(insertQuery, [
        ...payload,
        dkStatus,
        ExternalId,
      ]);

      return apiResponse.successResponseWithMoreData(res, {
        ExternalId,
        id: inset?.rows[0].datakindid,
      });
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch: handle datakind");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        alreadyExist
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
    let selectQuery = `SELECT datakindid as "dkId", name as "dkName", extrnl_sys_nm as "dkESName", extrnl_id as dkESNId, dk_desc as "dkDesc", active as "dkStatus" from ${schemaName}.datakind order by name`;
    let dbQuery = await DB.executeQuery(selectQuery);
    Logger.info({ message: "getDKList" });
    const datakind = (await dbQuery.rows) || [];
    const replaceNullDataWithBlank = datakind.map((el) => {
      if (!el.dkESName) {
        el.dkESName = "Blank";
      }
      return el;
    });
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      replaceNullDataWithBlank
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

exports.dkStatusUpdate = async (req, res) => {
  try {
    const { dkId, dkStatus } = req.body;
    const curDate = helper.getCurrentTime();
    const query = `UPDATE ${schemaName}.datakind SET updt_tm=$3, active=$1 WHERE datakindid=$2 RETURNING *`;

    Logger.info({ message: "dkStatusUpdate" });
    const isExist = await checkIsExistInDF(dkId);
    if (isExist) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation Failed",
        inactiveNotAllowed
      );
    } else {
      const up = await DB.executeQuery(query, [dkStatus, dkId, curDate]);
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        up.rows[0]
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :dkStatusUpdate");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

// exports.createDataKind = async (req, res) => {
//   try {
//     const { dkName, dkDesc, dkExternalId, dkESName, dkStatus } = req.body;
//     const insertQuery = `INSERT INTO ${schemaName}.datakind ("name", dk_desc, extrnl_id, extrnl_sys_nm, active, insrt_tm, updt_tm) VALUES($2, $3, $4, $5, $6, $1, $1)`;
//     Logger.info({ message: "createDataKind" });
//     const inset = await DB.executeQuery(insertQuery, [
//       helper.getCurrentTime(),
//       dkName,
//       dkDesc || null,
//       dkExternalId,
//       dkESName,
//       dkStatus,
//     ]);
//     return apiResponse.successResponseWithData(res, "Operation success", inset);
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch: createDataKind");
//     Logger.error(err);
//     if (err.code === "23505") {
//       return apiResponse.validationErrorWithData(
//         res,
//         "Operation failed",
//         "Clinical data type name and external system name combination already exists."
//       );
//     }
//     return apiResponse.ErrorResponse(res, err);
//   }
// };

// exports.updateDataKind = async (req, res) => {
//   try {
//     const { dkId, dkName, dkDesc, dkStatus, dkESName, userId } = req.body;
//     Logger.info({ message: "updateDataKind" });
//     const curDate = helper.getCurrentTime();
//     const isExist = await checkIsExistInDF(dkId);

//     const payload = [curDate, dkName, dkDesc, dkESName];

//     if (isExist) {
//       const updatedData = await DB.executeQuery(updateQuery, [
//         ...payload,
//         null,
//         dkId,
//       ]);

//       if (!updatedData?.rowCount) {
//         return apiResponse.ErrorResponse(res, commonError);
//       }

//       const dfList = await DB.executeQuery(getReleatedDF, [dkId]);
//       const { rows: existRows } = await DB.executeQuery(selectExist, [dkId]);

//       const existingObj = existRows[0];

//       dfList?.rows?.forEach(async (row) => {
//         const dataflowId = row.dataflowid;
//         const datakindObj = updatedData.rows[0];
//         const comparisionObj = {
//           name: dkName,
//           extrnl_sys_nm: dkESName,
//           dk_desc: dkDesc,
//         };
//         const diffObj = helper.getdiffKeys(comparisionObj, existingObj);
//         await addLocationCDHHistory({
//           dataflowId,
//           externalSystemName: "CDI",
//           userId,
//           config_json: datakindObj,
//           diffObj,
//           existingObj,
//         });
//       });

//       return apiResponse.successResponse(res, updateSuccess);
//     } else {
//       DB.executeQuery(updateActive, [...payload, dkStatus, null, dkId])
//         .then(() => {
//           return apiResponse.successResponse(res, "Operation success");
//         })
//         .catch((err) => {
//           return apiResponse.validationErrorWithData(
//             res,
//             "Operation failed",
//             err
//           );
//         });
//     }
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :updateDataKind");
//     Logger.error(err);
//     if (err.code === "23505") {
//       return apiResponse.validationErrorWithData(
//         res,
//         "Operation failed",
//         alreadyExist
//       );
//     }
//     return apiResponse.ErrorResponse(res, commonError);
//   }
// };
