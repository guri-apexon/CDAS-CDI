const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const CommonController = require("./CommonController");

exports.getStudyDataflows = async (req, res) => {
  try {
    const protocolId = req.params.protocolId;
    const query = `select s.prot_id as "studyId", d.dataflowid as "dataFlowId", dsetcount.dsCount as "dataSets", dpackagecount.dpCount as "dataPackages", s.prot_nbr as "studyName", d.data_flow_nm as "dataFlowName", dh."version", d.testflag as "type", d.insrt_tm as "dateCreated", vend_nm as "vendorSource", d.description, d.type as "adapter", d.active as "status", d.extrnl_sys_nm as "externalSourceSystem", loc_typ as "locationType", d.updt_tm as "lastModified", d.refreshtimestamp as "lastSyncDate" from cdascdi.dataflow d 
      inner join cdascdi.vendor v on d.vend_id = v.vend_id 
      inner join cdascdi.source_location sl on d.src_loc_id = sl.src_loc_id 
      inner join cdascdi.datapackage d2 on d.dataflowid = d2.dataflowid 
      inner join cdascdi.dataflow_history dh on d.dataflowid = dh.dataflowid
      inner join cdascdi.study s on d2.prot_id = s.prot_id
      inner join (select datapackageid, COUNT(DISTINCT datasetid) as dsCount FROM cdascdi.dataset d GROUP BY datapackageid) dsetcount on (d2.datapackageid=dsetcount.datapackageid)
      inner join (select dataflowid, COUNT(DISTINCT datapackageid) as dpCount FROM cdascdi.datapackage d GROUP BY dataflowid) dpackagecount on (d.dataflowid=dpackagecount.dataflowid)
      where s.prot_id = $1`;
    // const q2 = `select dataflowid, COUNT(DISTINCT datapackageid) FROM cdascdi.datapackage d GROUP BY dataflowid`;
    // const q3 = `select datapackageid, COUNT(DISTINCT datasetid) FROM cdascdi.dataset d GROUP BY datapackageid`;
    Logger.info({ message: "getStudyDataflows" });
    const $q1 = await DB.executeQuery(query, [protocolId]);
    // const $q2 = await DB.executeQuery(q2);
    // const $q3 = await DB.executeQuery(q3);

    // console.log("results", protocolId, $q1, $q2, $q3);

    // const getTotalCount = (arr) => {
    //   let sum = [...arr].reduce(
    //     (previousValue, currentValue) => previousValue + currentValue.count,
    //     0
    //   );
    //   return { count: sum };
    // };

    const formatDateValues = await $q1.rows.map((e) => {
      // let filterByDF = $q2.rows.filter((d) => d.dataflowid === e.dataFlowId);
      // let newObj = filterByDF[0] ? getTotalCount([...acc]) : { count: 0 };
      // let { count: dpCount } = newObj;
      // let dsCount = 10;
      // let dpCount = 5;
      let editT = moment(e.lastModified).format("MM/DD/YYYY");
      let addT = moment(e.dateCreated).format("MM/DD/YYYY");
      let syncT = moment(e.lastSyncDate).format("MM/DD/YYYY");
      return {
        ...e,
        dateCreated: addT,
        lastModified: editT,
        lastSyncDate: syncT,
        // dataSets: dsCount,
        // dataPackages: dpCount,
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      formatDateValues
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getStudyDataflows");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

const hardDeleteTrigger = async (dataflowId) => {
  const values = [dataflowId];
  const deleteQuery = `DELETE FROM cdascdi1d.cdascdi.dataflow_audit_log da
      WHERE da.dataflowid = $1`;
  let result;
  await DB.executeQuery(deleteQuery, values)
    .then(async (response) => {
      const deleteQuery2 = `DELETE FROM cdascdi1d.cdascdi.datapackage dp WHERE dp.dataflowid = '${dataflowId}';
    DELETE FROM cdascdi1d.cdascdi.datapackage_history dph WHERE dph.dataflowid = '${dataflowId}';`;
      // DELETE FROM cdascdi1d.cdascdi.dataset ds WHERE ds.dataflowid = $1;
      // DELETE FROM cdascdi1d.cdascdi.dataset_history dsh WHERE dsh.dataflowid = $1;
      await DB.executeQuery(deleteQuery2)
        .then(async (response2) => {
          const deleteQuery3 = `DELETE FROM cdascdi1d.cdascdi.dataflow
      WHERE dataflowid = $1`;
          await DB.executeQuery(deleteQuery3, values)
            .then(async (response3) => {
              result = true;
            })
            .catch((err) => {
              result = false;
            });
        })
        .catch((err) => {
          result = false;
        });
    })
    .catch((err) => {
      result = false;
    });
  return result;
};

const addDeleteTempLog = async (dataflowId, user) => {
  const insertTempQuery = `INSERT INTO cdascdi1d.cdascdi.temp_json_log(temp_json_log_id, dataflowid, trans_typ, trans_stat, no_of_retry_attempted, del_flg, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
  const tempId = CommonController.createUniqueID();
  let result;
  const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
  const values = [
    tempId,
    dataflowId,
    "DELETE",
    "FAILURE",
    1,
    "N",
    user.usr_id,
    currentTime,
    user.usr_id,
    currentTime,
  ];
  await DB.executeQuery(insertTempQuery, values)
    .then(async (response) => {
      result = true;
    })
    .catch((err) => {
      result = false;
    });
  return result;
};

exports.cronHardDelete = async (log) => {
  const { dataflowid: dataflowId, created_by: user_id } = log;
  DB.executeQuery(`SELECT * FROM cdascdi1d.cdascdi.user where usr_id = $1`, [
    user_id,
  ]).then(async (response) => {
    if (response.rows && response.rows.length) {
      const user = response.rows[0];
      const deleted = await hardDeleteTrigger(dataflowId);
      if (deleted) {
        // const deleteQuery = `DELETE FROM cdascdi1d.cdascdi.temp_json_log da
        // WHERE da.dataflowid = $1`;
        // DB.executeQuery(deleteQuery, [dataflowId]).then(async (response) => {
        //   return true;
        // });
      }
      return false;
    }
  });
};

exports.hardDelete = async (req, res) => {
  try {
    const { dataflowId, user_id } = req.body;
    DB.executeQuery(`SELECT * FROM cdascdi1d.cdascdi.user where usr_id = $1`, [
      user_id,
    ]).then(async (response) => {
      if (response.rows && response.rows.length) {
        const user = response.rows[0];
        const deleted = await hardDeleteTrigger(dataflowId);
        if (deleted) {
          const deleteQuery = `DELETE FROM cdascdi1d.cdascdi.temp_json_log da
          WHERE da.dataflowid = $1`;
          DB.executeQuery(deleteQuery, [dataflowId]).then(async (response) => {
            return apiResponse.successResponseWithData(
              res,
              "Deleted successfully",
              {
                success: true,
              }
            );
          });
        } else {
          const inserted = await addDeleteTempLog(dataflowId, user);
          if (inserted) {
            return apiResponse.successResponseWithData(
              res,
              "Deleted is in queue. System will delete it automatically after sometime.",
              {
                success: false,
              }
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Something wrong. Please try again",
              {}
            );
          }
        }
      } else {
        return apiResponse.ErrorResponse(res, "User not found");
      }
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.activateDataFlow = async (req, ser) => {
  try {
    const { protocolId, userId } = req.body;
    Logger.info({ message: "activateDataFlow" });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :activateDataFlow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.inActivateDataFlow = async (req, ser) => {
  try {
    const { protocolId, userId } = req.body;
    Logger.info({ message: "inActivateDataFlow" });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :inActivateDataFlow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
