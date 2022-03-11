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
    const newQuery = `SELECT prot_id, protocolnumber, sponsorname, phase, protocolstatus, projectcode, "ingestionCount", "priorityCount", "staleFilesCount", "dfCount", "vCount", "dpCount", "dsCount"
    FROM  ${schemaName}.study_ingestion_dashboard
    WHERE prot_id in (select prot_id from study_user where usr_id=$1) order by "priorityCount" desc, "ingestionCount" desc, "staleFilesCount" desc, sponsorname asc, protocolnumber asc`;

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
    Logger.info({
      message: "pinStudy",
    });

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

exports.getUserPinnedStudies = function (req, res) {
  try {
    const userId = req.params.userId;
    const query = `select * from ${schemaName}.study_user_pin sup where usr_id = $1 order by pinned_stdy_dt desc `;

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
};

exports.searchStudyList = function (req, res) {
  try {
    // const { search, userId } = req.body();
    const searchParam = req.params.searchQuery.toLowerCase();
    const { userId } = req.body;
    // console.log("req", searchParam);
    Logger.info({
      message: "searchUserStudyList",
      searchParam,
    });
    // console.log("search", searchParam, userId);
    const searchQuery = `SELECT s.prot_id, s.prot_nbr as protocolnumber, s3.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM ${schemaName}.study s 
    INNER JOIN ${schemaName}.study_sponsor ss ON ss.prot_id = s.prot_id 
    INNER JOIN ${schemaName}.sponsor s2 ON s2.spnsr_id = ss.spnsr_id 
    INNER JOIN ${schemaName}.study_user s3 ON s.prot_id=s3.prot_id WHERE (s3.usr_id = $2) AND (LOWER(prot_nbr) LIKE $1 OR LOWER(spnsr_nm) LIKE $1 OR LOWER(proj_cd) LIKE $1) LIMIT 10`;

    DB.executeQuery(searchQuery, [`%${searchParam}%`, userId]).then(
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

exports.getDatasetIngestionDashboardDetail = async function (req, res) {
  try {
    const prot_id = req.params.protocolNumber;
    let where = "";
    let datasetwhere = "";
    const testFlag = req.query.testFlag || null;
    const active = req.query.active || null;
    if (testFlag == 1 || testFlag == 0) {
      where += ` and testdataflow in (${testFlag}) `;
    }
    if (active == 1 || active == 0) {
      datasetwhere += ` and activedataset in (${active}) `;
    }
    Logger.info({
      message: "getDatasetIngestionDashboardDetail",
      prot_id,
    });
    const countQuery = `select prot_id ,count(failedLoads) as failed_loads,sum(quarantinedFiles) as quarantined_files,
    count(EXCEEDS_PCT_CNG) as files_exceeding,
    count(filesWithIngestionIssues) as fileswith_issues,count(is_stale) as stale_datasets
    from ${schemaName}.study_monitor_summary
    where prot_id = $1 ${where}
    group by prot_id;`;
    const summaryCount = await DB.executeQuery(countQuery, [prot_id]);

    const searchQuery = `select prot_id,datasetid,datasetname,vendorsource,jobstatus,filename,datasetstatus,exceeds_pct_cng,lastfiletransferred,packagename,mnemonicfile,clinicaldatatypename,loadtype,downloadtrnx,processtrnx,offset_val,errmsg  from ${schemaName}.study_monitor_summary where prot_id = $1 ${where} ${datasetwhere}`;
    DB.executeQuery(searchQuery, [prot_id]).then((response) => {
      const datasets = response.rows || [];
      const summary = summaryCount.rows ? summaryCount.rows[0] : {};
      return apiResponse.successResponseWithData(res, "Operation success", {
        summary: summary,
        datasets: datasets,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "eerre");
    Logger.error("catch :getDatasetIngestionDashboardDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
