const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");

exports.getUserStudyList = function (req, res) {
  try {
    const userId = req.params.userId;
    const query = `SELECT prot_id, prot_nbr as protocolnumber, s.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM cdascdi.study s INNER JOIN cdascdi.sponsor s2 ON s2.spnsr_id = s.spnsr_id WHERE s.usr_id = $1 ORDER BY sponsorname`;

    Logger.info({
      message: "getUserStudyList",
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
    Logger.error("catch :getUserStudyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.pinStudy = async (req, res) => {
  try {
    const { userId, protocolId } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO cdascdi.study_user_pin
      (usr_id, prot_id, pinned_stdy, pinned_stdy_dt, insrt_tm, updt_tm)
      VALUES($1, $2, '', $3, $3, $3);
      `;
    Logger.info({
      message: "pinStudy",
    });

    const inset = await DB.executeQuery(insertQuery, [userId, protocolId, curDate]);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :pinStudy");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.unPinStudy = async (req, res) => {
  try {
    const { userId, protocolId } = req.body;
    const deleteQuery = `delete from cdascdi.study_user_pin where usr_id = $1 and prot_id = $2`;
    Logger.info({
      message: "unPinStudy",
    });

    const del = await DB.executeQuery(deleteQuery, [userId, protocolId]);
    return apiResponse.successResponseWithData(res, "Operation success", del);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :unPinStudy");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getUserPinnedStudies = function(req, res) {
  try {
    const userId = req.params.userId;
    const query = `select * from cdascdi.study_user_pin sup where usr_id = $1 order by pinned_stdy_dt desc `;

    Logger.info({
      message: "getUserPinnedStudies",
    });

    DB.executeQuery(query, [userId]).then((resp) => {
      const studies = resp.rows || [];
      if (studies.length > 0) {
        const protList = studies.map((e) => e.prot_id);
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          protList
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
    Logger.error("catch :getUserPinnedStudies");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
}

exports.searchStudyList = function (req, res) {
  try {
    // const { search, userId } = req.body();
    const searchParam = req.params.searchQuery.toLowerCase();
    console.log("req",searchParam);
    Logger.info({
      message: "searchUserStudyList",
      searchParam,
    });
    // console.log("search", searchParam, userId);
    const searchQuery = `SELECT prot_id, prot_nbr as protocolnumber, s.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM cdascdi.study s INNER JOIN cdascdi.sponsor s2 ON s2.spnsr_id = s.spnsr_id 
              WHERE LOWER(prot_id) LIKE $1 OR LOWER(spnsr_nm) LIKE $1 OR LOWER(proj_cd) LIKE $1 LIMIT 10`;

    DB.executeQuery(searchQuery, [`%${searchParam}%`]).then(
      (response) => {
        const studies = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          studies: studies,
          totalSize: response.rowCount,
        });
      }
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :searchUserStudyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
