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
    const query = `SELECT distinct s.prot_id, prot_nbr as protocolnumber, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM ${schemaName}.study s INNER JOIN ${schemaName}.sponsor s2 ON s2.spnsr_id = s.spnsr_id INNER JOIN ${schemaName}.study_user s3 ON s.prot_id = s3.prot_id  WHERE s3.usr_id = $1 ORDER BY sponsorname Limit 10`;
    // const q2 = `select dataflowid, COUNT(DISTINCT datapackageid) FROM ${schemaName}.datapackage d GROUP BY d.dataflowid`
    // const q3 = `select datapackageid, COUNT(DISTINCT datasetid) FROM ${schemaName}.dataset d GROUP BY datapackageid`

    Logger.info({
      message: `getUserStudyList ${query}`,
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
    const searchQuery = `SELECT s.prot_id, s.prot_nbr as protocolnumber, s3.usr_id, spnsr_nm as sponsorname, phase, prot_stat as protocolstatus, proj_cd as projectcode FROM ${schemaName}.study s INNER JOIN ${schemaName}.sponsor s2 ON s2.spnsr_id = s.spnsr_id 
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

exports.getDatasetIngestionDashboardDetail = function (req, res) {
  try {
    const prot_id = req.params.protocolNumber;
    let where = "";
    const testFlag = req.query.testFlag || null;
    const active = req.query.active || null;
    if (testFlag == 1 || testFlag == 0) {
      where += ` and ds.testflag in (${testFlag}) `;
    }
    if (active == 1 || active == 0) {
      where += ` and ds.active in (${active}) `;
    }
    Logger.info({
      message: "getDatasetIngestionDashboardDetail",
      prot_id,
    });
    const searchQuery = `with protocol as (SELECT prot_id, dataflowid
      FROM ${constants.DB_SCHEMA_NAME}.dataflow 
     WHERE active = 1 --ONLY active dataflows
  GROUP BY prot_id, dataflowid
  ) 
,cteTrnx AS -- get the latest process executionid 
(
SELECT *, 
case when downloadtrnx > 0 OR previous_downloadtrnx > 0 THEN  ((downloadtrnx - previous_downloadtrnx) / ((downloadtrnx + previous_downloadtrnx) / 2)) * 100
when downloadtrnx = 0 and previous_downloadtrnx = 0 then 0
end as pct_cng  FROM
(
select prot_id, dataflowid, datapackageid, datasetid, executionid, externalid, downloadtrnx, latest, LEAD(downloadtrnx,1) OVER (
ORDER BY latest ) previous_downloadtrnx, childstatus, errmsg from
(SELECT
prot.prot_id,
prot.dataflowid,
ts.datapackageid,
ts.datasetid,
ts.executionid,
ts.externalid,
COALESCE(ts.downloadtrnx,0) as downloadtrnx,
cps.STATUS AS childstatus,
cps.ERRMSG as errmsg,
ROW_NUMBER () OVER (PARTITION BY ts.dataflowid,	ts.datapackageid,ts.datasetid
ORDER BY ts.executionid DESC) AS latest
FROM protocol prot
LEFT JOIN ${constants.DB_SCHEMA_NAME}.transaction_summary ts
ON prot.dataflowid = TS.dataflowid
LEFT JOIN ${constants.DB_SCHEMA_NAME}.child_processes_summary cps
ON ts.externalid = cps.externalid )  ts1_latest
where latest<=2 
) x WHERE latest = 1 
) 
,checkSum as ( select case when current_timestamp > to_timestamp(cast(lastmodifiedtime as numeric)/1000) then date_part('day',current_timestamp - to_timestamp(cast(lastmodifiedtime as numeric)/1000)) else -1
					end as no_of_staledays, lastmodifiedtime as file_timestamp, dc2.executionid from ${constants.DB_SCHEMA_NAME}.datapackage_checksum dc2 inner join cteTrnx on cteTrnx.dataflowid = dc2.dataflowid and cteTrnx.datapackageid = dc2.datapackageid and cteTrnx.executionid = dc2.executionid limit 1)
,cteFile AS -- get the latest file name
(
SELECT * FROM
  (
  SELECT
    dp.dataflowid,
    dp.md5,
    dp.executionid,
    dp.datapackageid,
    dp.packagename,
    dpds.datasetid,
    dpds.datasetname,
    ds.datasetname ,
    COALESCE (dpds.datasetname, ds.datasetname) as filename,
    dp.stagetime filestagedate ,
    ROW_NUMBER () OVER (PARTITION BY dp.dataflowid, dp.executionid, dp.datapackageid, dpds.datasetid 
    ORDER BY dp.stagetime DESC) AS latest
  FROM
    ${constants.DB_SCHEMA_NAME}.datapackage_checksum dp
  LEFT OUTER JOIN ${constants.DB_SCHEMA_NAME}.datapackage_dataset_mapping DPDS ON
    dp.md5 = dpds."MD5" 
  LEFT OUTER JOIN ${constants.DB_SCHEMA_NAME}.dataset_checksum ds ON
    dp.md5 = ds.md5  
  ) x 
WHERE latest = 1 
)
--select the data for a selected study		
select 
cteTrnx.externalid ,
cteTrnx.executionid,
cteTrnx.prot_id ,
cteTrnx.dataflowid ,
cteTrnx.datapackageid ,
cteTrnx.datasetid ,
cteTrnx.downloadtrnx,
cteTrnx.previous_downloadtrnx,
ds.type AS dataset_type ,
ds.mnemonic datasetname,
df.type datastructure ,
dp.type pacakagetype,
dp.path packagepath,
dp.name AS packagenamingconvention ,
ds.datakindid AS ClinicalDataTypeId ,
vn.vend_nm_stnd as clinicalDataTypeName,
df.vend_id as vendorsourceid,
vn1.vend_nm_stnd as vendorsource,
ds.TYPE FileType,
ds.PATH FilePath,
ds.name AS filenamingconvention ,
ds.rowdecreaseallowed ,
ds.testflag AS testdataflow ,
ds.staledays AS overridestalealert ,
df.connectiontype ,
df.connectiondriver,	
ts.mnemonicfile,
ts.processtype,
ts.downloadstatus,
ts.downloadstarttime,
ts.downloadendtime,
ts.processstatus,
ts.processstarttime,
ts.processendtime,
ts.processtrnx,
ts.lastsucceeded,
ts.lastattempted,
ts.failurecat,
ts.refreshtimestamp,
ds.offsetcolumn,
ds.offset_val, 
cteTrnx.childstatus,
cteTrnx.ERRMSG,
CASE WHEN ts.downloadstatus = 'SUCCESSFUL' AND ts.processstatus = 'SUCCESSFUL' THEN 'LOADED WITHOUT ISSUES'
WHEN ts.downloadstatus  = 'SUCCESSFUL' AND ts.processstatus  = 'PROCESSED WITH ERRORS' THEN 'LOADED WITH INGESTION ISSUES'
WHEN ts.downloadstatus  = 'FAILED' OR ts.processstatus   = 'FAILED' THEN 'FAILED'
WHEN ts.downloadstatus  = 'IN PROGRESS' OR ts.processstatus  = 'IN PROGRESS' THEN 'IN PROGRESS'
WHEN ts.downloadstatus  = 'ABORTED' OR ts.processstatus  = 'ABORTED' THEN 'FAILED'
END AS datastatus,    -- NEEDS COMPLETE CASE STATEMENT
cteTrnx.pct_cng,
case when cteTrnx.pct_cng > ds.rowdecreaseallowed then cteTrnx.pct_cng end as EXCEEDS_PCT_CNG, -- needs comparison logic to replace 'Y' for KPI
case when dc.no_of_staledays > ds.staledays then 'yes' else 'no' end  as IS_STALE, --needs comparison logic to replace 'Y' for KPI,
dc.file_timestamp,
dc.no_of_staledays,
cteTrnx.childstatus,
cteTrnx.errmsg ,
ctefile.filestagedate AS lastFileTransferred ,
CASE WHEN dp.NOPACKAGECONFIG = 0 THEN cteFile.packagename END AS packagename ,
CASE WHEN df.connectiontype NOT IN ('SFTP','FTPS') THEN ds.name ELSE cteFile.filename END AS filename
FROM protocol p
INNER JOIN
${constants.DB_SCHEMA_NAME}.dataflow df
ON  df.dataflowid = p.dataflowid
INNER JOIN ${constants.DB_SCHEMA_NAME}.datapackage dp
ON df.dataflowid = dp.dataflowid
INNER JOIN ${constants.DB_SCHEMA_NAME}.dataset ds
ON dp.datapackageid = ds.datapackageid 
INNER JOIN ${constants.DB_SCHEMA_NAME}.vendor vn
ON vn.vend_id = ds.datakindid 
INNER JOIN ${constants.DB_SCHEMA_NAME}.vendor vn1
ON vn1.vend_id = df.vend_id 
INNER JOIN cteTrnx 
ON 	cteTrnx.dataflowid = df.dataflowid
AND cteTrnx.datapackageid = dp.datapackageid
AND cteTrnx.datasetid = ds.datasetid
INNER JOIN ${constants.DB_SCHEMA_NAME}.transaction_summary ts 
ON cteTrnx.executionid = ts.executionid
AND cteTrnx.externalid = ts.externalid
AND cteTrnx.dataflowid = ts.dataflowid
AND cteTrnx.datapackageid = ts.datapackageid
AND ctetrnx.datasetid = ts.datasetid
left join checkSum dc 
on cteTrnx.executionid = dc.executionid
LEFT JOIN cteFile 
	ON cteTrnx.dataflowid = cteFile.dataflowid
	AND cteTrnx.executionid = cteFile.executionid
	AND cteTrnx.datapackageid = cteFile.datapackageid
	AND cteTrnx.datasetid = cteFile.datasetid
where p.prot_id = $1 ${where}`;
    DB.executeQuery(searchQuery, [prot_id]).then((response) => {
      const datasets = response.rows || [];
      const failedStatus = ["FAILED", "ABORTED"];
      let failed_loads = 0;
      let quarantined_files = 0;
      let files_exceeding = 0;
      let fileswith_issues = 0;
      let stale_datasets = 0;
      datasets.forEach((dataset) => {
        if (
          failedStatus.indexOf(dataset.processstatus) !== -1 ||
          failedStatus.indexOf(dataset.downloadstatus) !== -1
        ) {
          failed_loads += 1;
        }
        if (dataset.pct_cng > dataset.rowdecreaseallowed) {
          files_exceeding += 1;
        }
        if (
          dataset.downloadstatus == "SUCCESSFUL" &&
          dataset.processstatus == "PROCESSED WITH ERRORS"
        ) {
          fileswith_issues += 1;
        }
        if (dataset.is_stale == 'yes') {
          stale_datasets += 1;
        }
      });
      return apiResponse.successResponseWithData(res, "Operation success", {
        summary: {
          failed_loads,
          quarantined_files,
          files_exceeding,
          fileswith_issues,
          stale_datasets,
        },
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
