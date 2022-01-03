const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");

exports.getStudyDataflows = async (req, res) => {
  try {
    // const protocolId = req.params.protocolId;
    const query =
      'select dataflowid as "dataFlowId", data_flow_nm as "dataFlowName", testflag as "type", d.insrt_tm as "dateCreated", vend_nm as "verndorSource", d.description, "type" as "adapter", d.active as "status", d.extrnl_sys_nm as "externalSourceSystem", loc_typ as "locationType", d.updt_tm as "lastModified", d.refreshtimestamp as "lastSyncDate" from cdascdi.dataflow d inner join cdascdi.vendor v on d.vend_id = v.vend_id inner join cdascdi.source_location sl on d.src_loc_id = sl.src_loc_id';
    const q2 = `select dataflowid, COUNT(DISTINCT datapackageid) FROM cdascdi.datapackage d GROUP BY dataflowid`;
    // const q3 = `select datapackageid, COUNT(DISTINCT datasetid) FROM cdascdi.dataset d GROUP BY datapackageid`;
    Logger.info({ message: "getStudyDataflows" });
    const $q1 = await DB.executeQuery(query);
    const $q2 = await DB.executeQuery(q2);
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
      let filterByDF = $q2.rows.filter((d) => d.dataflowid === e.dataFlowId);
      // let newObj = filterByDF[0] ? getTotalCount([...acc]) : { count: 0 };
      // let { count: dpCount } = newObj;
      let dsCount = 10;
      let dpCount = 5;
      let editT = moment(e.lastModified).format("MM/DD/YYYY");
      let addT = moment(e.dateCreated).format("MM/DD/YYYY");
      let syncT = moment(e.lastSyncDate).format("MM/DD/YYYY");
      return {
        ...e,
        dateCreated: addT,
        lastModified: editT,
        lastSyncDate: syncT,
        dataSets: dsCount,
        dataPackages: dpCount,
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

// exports.pinStudy = async (req, res) => {
//   try {
//     const { userId, protocolId } = req.body;
//     const curDate = new Date();
//     const insertQuery = `INSERT INTO cdascdi.study_user_pin
//       (usr_id, prot_id, pinned_stdy, pinned_stdy_dt, insrt_tm, updt_tm)
//       VALUES($1, $2, '', $3, $3, $3);
//       `;
//     Logger.info({
//       message: "pinStudy",
//     });

//     const inset = await DB.executeQuery(insertQuery, [userId, protocolId, curDate]);
//     return apiResponse.successResponseWithData(res, "Operation success", inset);
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :pinStudy");
//     Logger.error(err);

//     return apiResponse.ErrorResponse(res, err);
//   }
// };
