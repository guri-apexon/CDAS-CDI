const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");

exports.getStudyDataflows = function (req, res) {
  try {
    const userId = req.params.protocolId;
    const query = `SELECT prot_id, prot_nbr as protocolnumber, s.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM cdascdi.study s INNER JOIN cdascdi.sponsor s2 ON s2.spnsr_id = s.spnsr_id WHERE s.usr_id = $1 ORDER BY sponsorname`;

    Logger.info({
      message: "getStudyDataflows",
    });

    DB.executeQuery(query, [userId]).then((resp) => {
      const studies = resp.rows || [];
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

