const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getUserStudyList = function (req, res) {
  try {
    const userId = req.params.userId;

    const newQuery = `SELECT * from ${schemaName}.fn_get_study_cards($1)`;

    Logger.info({ message: `getUserStudyList` });

    DB.executeQuery(newQuery, [userId]).then((resp) => {
      const studies = resp.rows || [];
      if (studies.length > 0) {
        // studies.forEach();
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
    const insertQuery = `INSERT INTO ${schemaName}.study_user_pin
      (usr_id, prot_id, pinned_stdy, pinned_stdy_dt, insrt_tm, updt_tm)
      VALUES($1, $2, '', $3, $3, $3);
      `;
    Logger.info({ message: "pinStudy" });

    const inset = await DB.executeQuery(insertQuery, [
      userId,
      protocolId,
      curDate,
    ]);
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
    const deleteQuery = `delete from ${schemaName}.study_user_pin where usr_id = $1 and prot_id = $2`;
    Logger.info({ message: "unPinStudy" });
    const del = await DB.executeQuery(deleteQuery, [userId, protocolId]);
    return apiResponse.successResponseWithData(res, "Operation success", del);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :unPinStudy");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getUserPinnedStudies = function (req, res) {
  try {
    const userId = req.params.userId;
    const query = `select * from ${schemaName}.study_user_pin sup where usr_id = $1 order by pinned_stdy_dt desc `;

    Logger.info({ message: "getUserPinnedStudies" });

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
};

exports.searchStudyList = function (req, res) {
  try {
    const searchParam = req.params.searchQuery.toLowerCase();
    const { userId } = req.body;

    Logger.info({
      message: "searchUserStudyList",
      searchParam,
    });

    const searchQuery = "SELECT * from fn_get_study_cards($1, $2)";
    DB.executeQuery(searchQuery, [userId, searchParam]).then((response) => {
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

exports.getDatasetIngestionDashboardDetail = async function (req, res) {
  try {
    const prot_id = req.params.protocolNumber;
    let searchCondition = " and df.testflag in (1, 0)";
    let queryCondition = " and df.testflag in (1, 0)";
    const testFlag = req.query.testFlag || 9;
    const active = parseInt(req.query.active, 10) === 1 ? "Y" : "N";
    const processStatus = req.query.processStatus || null;
    const limit = req.query.limit || null; // default valu is 10
    const noOfDays = req.query.noOfDays || null; // deafult value is 10
    const userId = req.query.userId;

    if (testFlag == 1 || testFlag == 0) {
      searchCondition = ` and df.testflag in (${testFlag}) `;
      queryCondition = ` and df.testflag in (${testFlag})`;
    }
    Logger.info({
      message: "getDatasetIngestionDashboardDetail",
      prot_id,
    });

    const summaryCount = await DB.executeQuery(
      `select * from fn_get_study_summary_20('${userId}', '${prot_id}', ${testFlag})`
    );

    const searchQuery = `select * from fn_get_study_dataset_summary('${userId}', ${testFlag}, '${prot_id}', ${
      processStatus ? `'${processStatus}'` : null
    }, ${limit}, ${noOfDays}, '${active}')`;

    const response = await DB.executeQuery(searchQuery);

    const datasets = response.rows || [];
    const summary = summaryCount.rows ? summaryCount.rows[0] : {};
    console.log(">> summary", summary);
    return apiResponse.successResponseWithData(res, "Operation success", {
      summary: summary,
      datasets: datasets,
      totalSize: summary?.dataset_pipelines || response.rowCount,
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "eerre");
    Logger.error("catch :getDatasetIngestionDashboardDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
