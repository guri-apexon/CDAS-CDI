const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");

/**
 * Study Search List.
 *
 * @returns {Object}
 */

exports.studyList = function (req, res) {
  try {
    const searchParam = req.params.query;
    const searchQuery = `SELECT * from cdascore1d.cdascore.cdas_study_master WHERE prot_nbr LIKE '%${searchParam}%' OR 
    spnsr_nm LIKE '%${searchParam}%' OR project_code LIKE '%${searchParam}%' LIMIT 60`;

    Logger.info({
      message: "studyList",
    });

    DB.executeQuery(searchQuery).then((response) => {
      const studies = response.rows || [];
      if (studies.length > 0) {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          studies
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          []
        );
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :studyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.noOnboardedStat = function (req, res) {
  try {
      const query = `SELECT 
      COUNT(DISTINCT CASE WHEN ob_stat = 'In Progress'   THEN prot_id END) inprogress_count,
      COUNT(DISTINCT CASE WHEN ob_stat = 'Failed' THEN prot_id END) faliure_count
FROM cdascore1d.cdascore.cdas_study`;
      DB.executeQuery(query).then( response => {
          const studies = response.rows || [];
          if(studies.length > 0){
              return apiResponse.successResponseWithData(res, "Operation success", studies[0]);
          }else{
              return apiResponse.successResponseWithData(res, "Operation success", []);
          }
      });
  } catch (err) {
      //throw error in json response with status 500. 
      return apiResponse.ErrorResponse(res, err);
  }
}

exports.getStudyList = async (req, res) => {
  try {
    //
    const query =
      "SELECT prot_id, prot_nbr as protocolnumber, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, cs.insrt_tm as dateadded, cs.updt_tm as dateedited, ob_stat as onboardingprogress, cs.usr_descr as assignmentcount, thptc_area as therapeuticarea, proj_cd as projectcode FROM cdascore.cdas_study cs INNER JOIN cdascore.cdas_sponsor cs2 ON cs2.spnsr_id = cs.spnsr_id ORDER BY cs.insrt_tm";
    const query2 = "SELECT prot_id, COUNT(DISTINCT usr_id) FROM cdascore.cdas_study_assignment csa GROUP BY prot_id";
    const query3 = "SELECT DISTINCT phase FROM cdascore.cdas_study";
    const query4 = "SELECT DISTINCT prot_stat as protocolstatus FROM cdascore.cdas_study";

    Logger.info({
      message: "getStudyList",
    });

    const $q1 = await DB.executeQuery(query);
    const $q2 = await DB.executeQuery(query2);
    const $q3 = await DB.executeQuery(query3);
    const $q4 = await DB.executeQuery(query4);

    const formatDateValues = await $q1.rows.map((e) => {
      let acc = $q2.rows.filter((d) => d.prot_id === e.prot_id);
      let newObj = acc[0] ? acc[0] : { count: 0 };
      let { count } = newObj;
      let newData = _.omit(e, ['prot_id']);
      return { ...newData, "assignmentcount": count };
    });

    let uniquePhase = $q3.rows.map(e => Object.values(e)).flat();
    let uniqueProtocolStatus = $q4.rows.map(e => Object.values(e)).flat();
    // console.log('rows', $data.rows, formatDateValues);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      { studyData: formatDateValues, uniquePhase: uniquePhase, uniqueProtocolStatus: uniqueProtocolStatus }
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :studyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

// exports.getUniqueValueofColumn = async (req, res) => {
//   try {
//     let searchData = req.body;
//     let { columnName } = searchData;
//     //   searchData;
//     // const ist_update = new Date();

//     // const searchString = searchData.searchString ? searchData.searchString : "";
//     // const searchStringDataType = searchData.searchStringDataType
//     //   ? searchData.searchStringDataType
//     //   : "";

//     // const offset = pageNo > 1 ? (pageNo - 1) * pageLimit : 0;
//     // const query =
//     //   "SELECT prot_nbr as protocolNumber, spnsr_nm as sponsorName, phase as phase, prot_status as protocolStatus, thptc_area as therapeuticArea, project_code as projectCode from cdascore1d.cdascore.cdas_study_master";

//     const query = "SELECT DISTINCT  FROM cdascore.cdas_study";

//     Logger.info({
//       message: "getStudyList",
//     });

//     const $data = await DB.executeQuery(query);
//     return apiResponse.successResponseWithData(
//       res,
//       "Operation success",
//       $data.rows
//     );
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :studyList");
//     Logger.error(err);
//     return apiResponse.ErrorResponse(res, err);
//   }
// };
