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

exports.getUserStudyList = function (req, res) {
  try {
    const userId = req.params.query;
    const query = `SELECT prot_id, prot_nbr as protocolnumber, s.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM cdascdi.study s INNER JOIN cdascdi.sponsor s2 ON s2.spnsr_id = s.spnsr_id WHERE s.usr_id = '${userId}' ORDER BY sponsorname`;

    Logger.info({
      message: "getUserStudyList",
    });

    DB.executeQuery(query).then((resp) => {
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
    Logger.error("catch :getUserStudyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.pinStudy = async (req, res) => {
  try {
    const { userId, protocolId } = req.params.body;
    const insertQuery = `INSERT INTO cdascdi.study_user_pin
      (usr_id, prot_id, pinned_stdy_dt, insrt_tm, updt_tm)
      VALUES('${userId}', '${protocolId}', , , );
      `;
    Logger.info({
      message: "pinStudy",
    });

    const inset = await DB.executeQuery(insertQuery);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :pinStudy");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.searchUserStudyList = function (req, res) {
  try {
    const { search, userId } = req.params.body;
    const searchParam = search.toLowerCase();
    const searchQuery = `SELECT  prot_id, prot_nbr as protocolnumber, s.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM cdascdi.study s INNER JOIN cdascdi.sponsor s2 ON s2.spnsr_id = s.spnsr_id 
              WHERE s.usr_id = $4 AND 
              LOWER(prot_id) LIKE $1 OR 
              LOWER(sponsorname) LIKE $2 OR
              LOWER(projectcode) LIKE $3
              `;
    Logger.info({
      message: "searchUserStudyList",
    });

    DB.executeQuery(searchQuery, [
      `%${searchParam}%`,
      `%${searchParam}%`,
      `%${searchParam}%`,
      `%${userId}%`,
    ]).then((response) => {
      const studies = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        studies: studies,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :searchUserStudyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
