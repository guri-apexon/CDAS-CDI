const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const CommonController = require("./CommonController");
const helper = require("../helpers/customFunctions");

exports.getStudyDataflows = async (req, res) => {
  try {
    const protocolId = req.params.protocolId;
    const query = `select * from (select s.prot_id as "studyId", d.dataflowid as "dataFlowId", row_number () over(partition by d.dataflowid,d2.prot_id order by dh."version" desc) as rnk, dsetcount.dsCount as "dsCount", dpackagecount.dpCount as "dpCount", s.prot_nbr as "studyName", dh."version", d.data_flow_nm as "dataFlowName", d.testflag as "type", d.insrt_tm as "dateCreated", vend_nm as "verndorSource", d.description, d.type as "adapter", d.active as "status", d.extrnl_sys_nm as "externalSourceSystem", loc_typ as "locationType", d.updt_tm as "lastModified", d.refreshtimestamp as "lastSyncDate" from cdascdi.dataflow d 
    inner join cdascdi.vendor v on d.vend_id = v.vend_id 
    inner join cdascdi.source_location sl on d.src_loc_id = sl.src_loc_id 
    inner join cdascdi.datapackage d2 on d.dataflowid = d2.dataflowid 
    inner join cdascdi.dataflow_history dh on d.dataflowid = dh.dataflowid
    inner join cdascdi.study s on d2.prot_id = s.prot_id
    inner join (select datapackageid, COUNT(DISTINCT datasetid) as dsCount FROM cdascdi.dataset d GROUP BY datapackageid) dsetcount on (d2.datapackageid=dsetcount.datapackageid)
    inner join (select dataflowid, COUNT(DISTINCT datapackageid) as dpCount FROM cdascdi.datapackage d GROUP BY dataflowid) dpackagecount on (d.dataflowid=dpackagecount.dataflowid)
    where s.prot_id = $1) as df where df.rnk=1`;

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

    const uniqueDataflows = Array.from(
      formatDateValues
        .reduce((acc, { dataSets, dataPackages, dataFlowId, ...r }) => {
          const current = acc.get(dataFlowId) || {
            ...r,
            dataSets: 0,
            dataPackages: 0,
          };
          return acc.set(dataFlowId, {
            ...current,
            dataFlowId,
            dataSets: parseInt(current.dataSets) + parseInt(dataSets),
            dataPackages:
              parseInt(current.dataPackages) + parseInt(dataPackages),
          });
        }, new Map())
        .values()
    );

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      uniqueDataflows
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
  await DB.executeQuery(deleteQuery, values).then(async (response) => {
    const deleteQuery2 = `DELETE FROM cdascdi1d.cdascdi.temp_json_log da
      WHERE da.dataflowid = '${dataflowId}';
      DELETE FROM cdascdi1d.cdascdi.columndefinition cd WHERE cd.datasetid in (select datasetid FROM cdascdi1d.cdascdi.dataset ds
      WHERE ds.datapackageid in (select datapackageid from cdascdi.datapackage dp where dp.dataflowid='a0A0E000004k79SUAQ'));
      DELETE FROM cdascdi1d.cdascdi.columndefinition_history cd WHERE cd.datasetid in (select datasetid FROM cdascdi1d.cdascdi.dataset ds
      WHERE ds.datapackageid in (select datapackageid from cdascdi.datapackage dp where dp.dataflowid='a0A0E000004k79SUAQ'));
      DELETE FROM cdascdi1d.cdascdi.dataset ds
      WHERE ds.datapackageid in (select datapackageid from cdascdi.datapackage dp where dp.dataflowid='a0A0E000004k79SUAQ');
      DELETE FROM cdascdi1d.cdascdi.dataset_history ds
      WHERE ds.datapackageid in (select datapackageid from cdascdi.datapackage dp where dp.dataflowid='a0A0E000004k79SUAQ');
      DELETE FROM cdascdi1d.cdascdi.datapackage dp WHERE dp.dataflowid = '${dataflowId}';
      DELETE FROM cdascdi1d.cdascdi.datapackage_history dph WHERE dph.dataflowid = '${dataflowId}';`;

    await DB.executeQuery(deleteQuery2)
      .then(async (response2) => {
        const deleteQuery3 = `DELETE FROM cdascdi1d.cdascdi.dataflow
      WHERE dataflowid = $1`;
        await DB.executeQuery(deleteQuery3, values)
          .then(async (response3) => {
            result = response3.rowCount > 0 ? "exist" : true;
          })
          .catch((err) => {
            result = false;
          });
      })
      .catch((err) => {
        result = false;
      });
    return result;
  });
};

const addDeleteTempLog = async (dataflowId, user) => {
  const insertTempQuery = `INSERT INTO cdascdi1d.cdascdi.temp_json_log(temp_json_log_id, dataflowid, trans_typ, trans_stat, no_of_retry_attempted, del_flg, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
  const tempId = helper.createUniqueID();
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
exports.cronHardDelete = async () => {
  DB.executeQuery(`SELECT * FROM cdascdi1d.cdascdi.temp_json_log`).then(
    async (response) => {
      const logs = response.rows || [];
      if (logs.length) {
        logs.forEach((log) => {
          const { dataflowid: dataflowId, created_by: user_id } = log;
          DB.executeQuery(
            `SELECT * FROM cdascdi1d.cdascdi.user where usr_id = $1`,
            [user_id]
          ).then(async (response) => {
            if (response.rows && response.rows.length) {
              const user = response.rows[0];
              const deleted = await hardDeleteTrigger(dataflowId);
              if (deleted) {
                return true;
              }
              return false;
            }
          });
        });
      }
    }
  );
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
        if (deleted == "exist") {
          return apiResponse.successResponseWithData(
            res,
            "Deleted successfully",
            {
              success: true,
            }
          );
        }
        if (deleted) {
          return apiResponse.successResponseWithData(
            res,
            "Records already deleted",
            {}
          );
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

exports.activateDataFlow = async (req, res) => {
  try {
    const { protocolId, userId } = req.body;
    const query = `UPDATE cdascdi.dataflow SET active=1 WHERE dataflowid=$1`;
    Logger.info({ message: "activateDataFlow" });
    const $q1 = await DB.executeQuery(query, [protocolId]);
    return apiResponse.successResponse(res, "Operation success");
  } catch (err) {
    Logger.error("catch :activateDataFlow");
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.inActivateDataFlow = async (req, res) => {
  try {
    const { protocolId, userId } = req.body;
    const query = `UPDATE cdascdi.dataflow SET active=0 WHERE dataflowid=$1`;
    Logger.info({ message: "inActivateDataFlow" });
    const $q1 = await DB.executeQuery(query, [protocolId]);
    return apiResponse.successResponse(res, "Operation success");
  } catch (err) {
    Logger.error("catch :inActivateDataFlow");
    return apiResponse.ErrorResponse(res, err);
  }
};
