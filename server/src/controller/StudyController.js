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
    const testFlag = req.query.testFlag || null;
    const active = req.query.active || null;
    if (testFlag == 1 || testFlag == 0) {
      searchCondition = ` and df.testflag in (${testFlag}) `;
      queryCondition = ` and df.testflag in (${testFlag})`;
    }
    Logger.info({
      message: "getDatasetIngestionDashboardDetail",
      prot_id,
    });
    const countQuery = `select prot_id,
    sum(inqueue) as in_queue,
    sum(datarefreshalerts) as data_refresh_alerts,
    sum(datalatencywarnings) as data_latency_warnings,
    count(failedLoads) as failed_loads,
    sum(quarantinedfiles) as quarantined_files,
    count(EXCEEDS_PCT_CNG) as files_exceeding,
    count(filesWithIngestionIssues) as fileswith_issues,
    count(is_stale) as stale_datasets 
from(
 WITH activedf AS (
         SELECT df.*
           FROM ${schemaName}.dataflow df
          WHERE prot_id = $1 and  COALESCE(df.active, 0) = 1 AND COALESCE(df.del_flg, 0) = 0
        ), ctetrnx AS (
         SELECT x.prot_id,
            x.dataflowid,
            x.datapackageid,
            x.datasetid,
            x.executionid,
            x.externalid,
            x.downloadtrnx,
            x.previous_downloadtrnx,
                CASE
                    WHEN x.previous_downloadtrnx = 0 THEN 0::numeric
                    ELSE round((x.downloadtrnx - x.previous_downloadtrnx)::numeric / x.previous_downloadtrnx::numeric * 100::numeric, 2)
                END AS pct_cng,
            x.latest,
			x.processendtime,
			x.processstarttime,
			x.processstatus,
			x.downloadstatus,
			x.datasetname,
			x.datapackagename,
			x.lastsucceeded,
			x.failurecat,
			x.processtrnx,
			x.lastattempted,
			x.refreshtimestamp,
			x.downloadendtime,
			x.downloadstarttime,
			x.processtype,
			x.mnemonicfile,
			x.datasettype					
           FROM ( SELECT ts1_latest.prot_id,
                    ts1_latest.dataflowid,
                    ts1_latest.datapackageid,
                    ts1_latest.datasetid,
                    ts1_latest.executionid,
                    ts1_latest.externalid,
                    ts1_latest.downloadtrnx,
                    ts1_latest.latest,
                    lead(ts1_latest.downloadtrnx, 1, 0) OVER (PARTITION BY ts1_latest.dataflowid, ts1_latest.datapackageid, ts1_latest.datasetid ORDER BY ts1_latest.latest) AS previous_downloadtrnx,
					ts1_latest.processendtime,
					ts1_latest.processstarttime,
					ts1_latest.processstatus,
					ts1_latest.downloadstatus,
					ts1_latest.datasetname,
					ts1_latest.datapackagename,
					ts1_latest.lastsucceeded,
					ts1_latest.failurecat,
					ts1_latest.processtrnx,
					ts1_latest.lastattempted,
					ts1_latest.refreshtimestamp,
					ts1_latest.downloadendtime,
					ts1_latest.downloadstarttime,
					ts1_latest.processtype,
					ts1_latest.mnemonicfile,
					ts1_latest.datasettype					
                   FROM ( SELECT prot.prot_id,
                            prot.dataflowid,
                            ts_1.datapackageid,
                            ts_1.datasetid,
                            ts_1.executionid,
                            ts_1.externalid,
							ts_1.processendtime,
							ts_1.processstarttime,
							ts_1.processstatus,
							ts_1.downloadstatus,
							ts_1.datasetname,
							ts_1.datapackagename,
							ts_1.lastsucceeded,
							ts_1.failurecat,
							ts_1.processtrnx,
							ts_1.lastattempted,
							ts_1.refreshtimestamp,
							ts_1.downloadendtime,
							ts_1.downloadstarttime,
							ts_1.processtype,
							ts_1.mnemonicfile,
							ts_1.datasettype,                            
                            COALESCE(ts_1.downloadtrnx, 0) AS downloadtrnx,
                            row_number() OVER (PARTITION BY ts_1.dataflowid, ts_1.datapackageid, ts_1.datasetid ORDER BY ts_1.externalid DESC) AS latest
                           FROM activedf prot
                             LEFT JOIN ${schemaName}.transaction_summary ts_1 ON prot.dataflowid::text = ts_1.dataflowid::text) ts1_latest
                  WHERE ts1_latest.latest <= 2) x
          WHERE x.latest = 1
        ) , cps as (
				  SELECT c.externalid,
				         c.name,
				         c.status,
				         c.refreshtimestamp,
				         c.errmsg
				   FROM ( SELECT cp.externalid,
				                 cp.name,
				                 cp.status,
				                 cp.refreshtimestamp,
				                 cp.errmsg,
				                 row_number() OVER (PARTITION BY cp.externalid ORDER BY (COALESCE(cp.errmsg, ''::character varying)) DESC, cp.refreshtimestamp DESC) AS rnk
				          FROM ${schemaName}.child_processes_summary cp
				               join ctetrnx on cp.externalid = ctetrnx.externalid) c
				          WHERE c.rnk = 1        
        ) ,checksum AS (
         SELECT src.dataflowid,
            src.datapackageid,
            src.executionid,
            src.lastmodifiedtime,
            src.latest,
            src.no_of_staledays,
            src.lastmodifiedtime AS file_timestamp
           FROM ( SELECT dc2.dataflowid,
                    dc2.datapackageid,
                    dc2.executionid,
                    dc2.lastmodifiedtime,
                    row_number() OVER (PARTITION BY dc2.dataflowid, dc2.datapackageid, dc2.executionid ORDER BY dc2.lastmodifiedtime DESC) AS latest,
                        CASE
                            WHEN CURRENT_TIMESTAMP > to_timestamp((dc2.lastmodifiedtime::numeric / 1000::numeric)::double precision) THEN date_part('day'::text, CURRENT_TIMESTAMP - to_timestamp((dc2.lastmodifiedtime::numeric / 1000::numeric)::double precision))
                            ELSE '-1'::integer::double precision
                        END AS no_of_staledays
                   FROM ${schemaName}.datapackage_checksum dc2
                     JOIN ctetrnx ctetrnx_1 ON ctetrnx_1.dataflowid::text = dc2.dataflowid::text AND ctetrnx_1.datapackageid::text = dc2.datapackageid::text AND ctetrnx_1.executionid::text = dc2.executionid::text
                  ORDER BY dc2.lastmodifiedtime DESC) src
          WHERE src.latest = 1
        ) , columndef AS (
         SELECT count(c.columnid) AS columncount,
            c.datasetid
           FROM ${schemaName}.columndefinition c
             JOIN ctetrnx ctetrnx_1 ON ctetrnx_1.datasetid::text = c.datasetid::text
          GROUP BY c.datasetid
        )
 SELECT DISTINCT ctetrnx.externalid,
    ctetrnx.executionid,
    df.prot_id,
    df.dataflowid,
    dp.datapackageid,
    ds.datasetid,
    ctetrnx.downloadtrnx,
    ctetrnx.previous_downloadtrnx,
    COALESCE(ctetrnx.datasettype, ds.type) AS dataset_type,
    ds.mnemonic AS datasetname,
    df.type AS datastructure,
    dp.type AS pacakagetype,
    dp.path AS packagepath,
    ctetrnx.datapackagename AS packagenamingconvention,
    ds.datakindid AS clinicaldatatypeid,
    dk.name AS clinicaldatatypename,
    df.vend_id AS vendorsourceid,
    vn.vend_nm AS vendorsource,
    ds.type AS filetype,
    ds.path AS filepath,
    ctetrnx.datasetname AS filenamingconvention,
    ds.rowdecreaseallowed,
    df.testflag AS testdataflow,
    ds.staledays AS overridestalealert,
    ctetrnx.mnemonicfile,
    ctetrnx.processtype,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN 'QUARANTINED'::character varying
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text THEN ctetrnx.downloadstatus
            ELSE 'FAILED'::character varying
        END AS downloadstatus,
    ctetrnx.downloadstarttime,
    ctetrnx.downloadendtime,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN NULL::character varying
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text THEN NULL::character varying
            WHEN ctetrnx.processstatus::text = ANY (ARRAY['SUCCESSFUL'::character varying, 'IN PROGRESS'::character varying, 'PROCESSED WITH ERRORS'::character varying]::text[]) THEN ctetrnx.processstatus
            ELSE 'FAILED'::character varying
        END AS processstatus,
    ctetrnx.processstarttime,
    ctetrnx.processendtime,
    ctetrnx.processtrnx,
    ctetrnx.lastsucceeded,
    ctetrnx.lastattempted,
    ctetrnx.failurecat,
    ctetrnx.refreshtimestamp,
    ds.offsetcolumn,
    ds.offset_val,
    COALESCE(ds.active, 0) AS activedataset,
    cps.status AS childstatus,
    cps.errmsg,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'SUCCESSFUL'::text THEN 'SUCCESSFUL'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 'PROCESSED WITH ERRORS'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'IN PROGRESS'::text THEN 'IN PROGRESS'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN 'QUARANTINED'::text
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text AND ctetrnx.processstatus::text = ''::text THEN 'FAILED'::text
            ELSE 'FAILED'::text
        END AS datasetstatus,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN ds.datasetid::text
            ELSE NULL::text
        END AS fileswithingestionissues,
        CASE
            WHEN dc.no_of_staledays > ds.staledays::double precision THEN 'STALE'::text
            WHEN ds.active = 0 THEN 'INACTIVE'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'SUCCESSFUL'::text THEN 'UP-TO-DATE'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 'UP-TO-DATE'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'IN PROGRESS'::text THEN 'PROCESSING'::text
            WHEN ctetrnx.downloadstatus::text = 'IN PROGRESS'::text AND ctetrnx.processstatus::text = ''::text THEN 'PROCESSING'::text
            WHEN ctetrnx.downloadstatus::text = 'QUEUED'::text AND ctetrnx.processstatus::text = ''::text THEN 'QUEUED'::text
            WHEN ctetrnx.downloadstatus::text = 'QUEUED'::text AND ctetrnx.processstatus::text = 'SUCCESSFUL'::text THEN 'UP-TO-DATE'::text
            WHEN ctetrnx.downloadstatus::text = 'IN PROGRESS'::text OR ctetrnx.processstatus::text = 'IN PROGRESS'::text THEN 'PROCESSING'::text
            WHEN ctetrnx.downloadstatus::text = 'SKIPPED'::text OR ctetrnx.processstatus::text = 'SKIPPED'::text THEN 'SKIPPED'::text
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text OR ctetrnx.processstatus::text = 'FAILED'::text THEN 'FAILED'::text
            ELSE NULL::text
        END AS jobstatus,
    ctetrnx.pct_cng,
        CASE
            WHEN ctetrnx.pct_cng < 0::numeric AND ctetrnx.pct_cng < (- ds.rowdecreaseallowed::numeric) THEN ctetrnx.pct_cng
            ELSE NULL::integer::numeric
        END AS exceeds_pct_cng,
        CASE
            WHEN dc.no_of_staledays > ds.staledays::double precision THEN 1
            ELSE NULL::integer
        END AS is_stale,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN 1
            ELSE 0
        END AS quarantinedfiles,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text OR ctetrnx.processstatus::text = 'FAILED'::text THEN 'FAILED'::text
            ELSE NULL::text
        END AS failedloads,
    dc.file_timestamp,
    dc.no_of_staledays,
    ctetrnx.lastsucceeded AS lastfiletransferred,
    ctetrnx.datapackagename AS packagename,
        CASE
            WHEN sl.loc_typ::text <> ALL (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text]) THEN ds.name
            ELSE ctetrnx.datasetname
        END AS filename,
        CASE
            WHEN ds.incremental = 'true'::bpchar OR ds.incremental = 'Y'::bpchar OR columndef.columncount > 0 THEN 'Incremental'::text
            ELSE 'Full'::text
        END AS loadtype,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'QUEUED'::text AND (ctetrnx.processstatus::text = ''::text OR ctetrnx.processstatus IS NULL) THEN 1
            ELSE 0
        END AS inqueue,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text OR ctetrnx.processstatus::text = 'FAILED'::text THEN 1
            ELSE 0
        END AS datarefreshalerts,
        CASE
            WHEN (date_part('epoch'::text, ctetrnx.processendtime - ctetrnx.processstarttime) / 3600::double precision) > 3::double precision THEN 1
            ELSE 0
        END AS datalatencywarnings
   FROM activedf df
     INNER JOIN ${schemaName}.vendor vn ON df.vend_id::text = vn.vend_id::text
     INNER JOIN ${schemaName}.source_location sl ON df.src_loc_id::text = sl.src_loc_id::text
     INNER JOIN ${schemaName}.datapackage dp ON df.dataflowid::text = dp.dataflowid::text
     INNER JOIN ${schemaName}.dataset ds ON dp.datapackageid::text = ds.datapackageid::text
     INNER JOIN ${schemaName}.datakind dk ON dk.datakindid::text = ds.datakindid::text
     INNER JOIN columndef ON columndef.datasetid::text = ds.datasetid::text
     LEFT JOIN ctetrnx ON ctetrnx.dataflowid::text = df.dataflowid::text AND ctetrnx.datapackageid::text = dp.datapackageid::text AND ctetrnx.datasetid::text = ds.datasetid::text
     LEFT JOIN checksum dc ON ctetrnx.executionid::text = dc.executionid::text AND ctetrnx.dataflowid::text = dc.dataflowid::text AND ctetrnx.datapackageid::text = dc.datapackageid::text
     LEFT JOIN cps ON ctetrnx.externalid = cps.externalid
     WHERE (ctetrnx.processtype::text = 'SYNC'::text OR ds.active = 1) ${queryCondition}
  ) A group by prot_id;`;
    const summaryCount = await DB.executeQuery(countQuery, [prot_id]);

    const searchQuery = `select quarantinedfiles as quarantined_files, lastattempted, datarefreshalerts as data_refresh_alerts, 
    datalatencywarnings as data_latency_warnings, exceeds_pct_cng, prot_id,dfname as dataflow_name,downloadstatus,
    downloadendtime,processstatus,processendtime,datasetid,datasetname,vendorsource,jobstatus,filename,datasetstatus,
    exceeds_pct_cng,lastfiletransferred,packagename,mnemonicfile,
    clinicaldatatypename,loadtype,downloadtrnx,processtrnx,offset_val,errmsg, prot_nbr from (
WITH activedf AS (
         SELECT df.*
           FROM ${schemaName}.dataflow df
          WHERE prot_id = $1 and  COALESCE(df.active, 0) = 1 AND COALESCE(df.del_flg, 0) = 0
        ), ctetrnx AS (
         SELECT x.prot_id,
            x.dataflowid,
            x.datapackageid,
            x.datasetid,
            x.executionid,
            x.externalid,
            x.downloadtrnx,
            x.previous_downloadtrnx,
                CASE
                    WHEN x.previous_downloadtrnx = 0 THEN 0::numeric
                    ELSE round((x.downloadtrnx - x.previous_downloadtrnx)::numeric / x.previous_downloadtrnx::numeric * 100::numeric, 2)
                END AS pct_cng,
            x.latest,
                    x.processendtime,
                    x.processstarttime,
                    x.processstatus,
                    x.downloadstatus,
                    x.datasetname,
                    x.datapackagename,
                    x.lastsucceeded,
                    x.failurecat,
                    x.processtrnx,
                    x.lastattempted,
                    x.refreshtimestamp,
                    x.downloadendtime,
                    x.downloadstarttime,
                    x.processtype,
                    x.mnemonicfile,
                    x.datasettype                          
           FROM ( SELECT ts1_latest.prot_id,
                    ts1_latest.dataflowid,
                    ts1_latest.datapackageid,
                    ts1_latest.datasetid,
                    ts1_latest.executionid,
                    ts1_latest.externalid,
                    ts1_latest.downloadtrnx,
                    ts1_latest.latest,
                    lead(ts1_latest.downloadtrnx, 1, 0) OVER (PARTITION BY ts1_latest.dataflowid, ts1_latest.datapackageid, ts1_latest.datasetid ORDER BY ts1_latest.latest) AS previous_downloadtrnx,
                                 ts1_latest.processendtime,
                                 ts1_latest.processstarttime,
                                 ts1_latest.processstatus,
                                 ts1_latest.downloadstatus,
                                 ts1_latest.datasetname,
                                 ts1_latest.datapackagename,
                                 ts1_latest.lastsucceeded,
                                 ts1_latest.failurecat,
                                 ts1_latest.processtrnx,
                                 ts1_latest.lastattempted,
                                 ts1_latest.refreshtimestamp,
                                 ts1_latest.downloadendtime,
                                 ts1_latest.downloadstarttime,
                                 ts1_latest.processtype,
                                 ts1_latest.mnemonicfile,
                                 ts1_latest.datasettype                              
                   FROM ( SELECT prot.prot_id,
                            prot.dataflowid,
                            ts_1.datapackageid,
                            ts_1.datasetid,
                            ts_1.executionid,
                            ts_1.externalid,
                                              ts_1.processendtime,
                                              ts_1.processstarttime,
                                              ts_1.processstatus,
                                              ts_1.downloadstatus,
                                              ts_1.datasetname,
                                              ts_1.datapackagename,
                                              ts_1.lastsucceeded,
                                              ts_1.failurecat,
                                              ts_1.processtrnx,
                                              ts_1.lastattempted,
                                              ts_1.refreshtimestamp,
                                              ts_1.downloadendtime,
                                              ts_1.downloadstarttime,
                                              ts_1.processtype,
                                              ts_1.mnemonicfile,
                                              ts_1.datasettype,                            
                            COALESCE(ts_1.downloadtrnx, 0) AS downloadtrnx,
                            row_number() OVER (PARTITION BY ts_1.dataflowid, ts_1.datapackageid, ts_1.datasetid ORDER BY ts_1.externalid DESC) AS latest
                           FROM activedf prot
                             LEFT JOIN ${schemaName}.transaction_summary ts_1 ON prot.dataflowid::text = ts_1.dataflowid::text) ts1_latest
                  WHERE ts1_latest.latest <= 2) x
          WHERE x.latest = 1
        ) , cps as (
                            SELECT c.externalid,
                                   c.name,
                                   c.status,
                                   c.refreshtimestamp,
                                   c.errmsg
                             FROM ( SELECT cp.externalid,
                                           cp.name,
                                           cp.status,
                                           cp.refreshtimestamp,
                                           cp.errmsg,
                                           row_number() OVER (PARTITION BY cp.externalid ORDER BY (COALESCE(cp.errmsg, ''::character varying)) DESC, cp.refreshtimestamp DESC) AS rnk
                                    FROM ${schemaName}.child_processes_summary cp
                                         join ctetrnx on cp.externalid = ctetrnx.externalid) c
                                    WHERE c.rnk = 1        
        ) ,checksum AS (
         SELECT src.dataflowid,
            src.datapackageid,
            src.executionid,
            src.lastmodifiedtime,
            src.latest,
            src.no_of_staledays,
            src.lastmodifiedtime AS file_timestamp
           FROM ( SELECT dc2.dataflowid,
                    dc2.datapackageid,
                    dc2.executionid,
                    dc2.lastmodifiedtime,
                    row_number() OVER (PARTITION BY dc2.dataflowid, dc2.datapackageid, dc2.executionid ORDER BY dc2.lastmodifiedtime DESC) AS latest,
                        CASE
                            WHEN CURRENT_TIMESTAMP > to_timestamp((dc2.lastmodifiedtime::numeric / 1000::numeric)::double precision) THEN date_part('day'::text, CURRENT_TIMESTAMP - to_timestamp((dc2.lastmodifiedtime::numeric / 1000::numeric)::double precision))
                            ELSE '-1'::integer::double precision
                        END AS no_of_staledays
                   FROM ${schemaName}.datapackage_checksum dc2
                     JOIN ctetrnx ctetrnx_1 ON ctetrnx_1.dataflowid::text = dc2.dataflowid::text AND ctetrnx_1.datapackageid::text = dc2.datapackageid::text AND ctetrnx_1.executionid::text = dc2.executionid::text
                  ORDER BY dc2.lastmodifiedtime DESC) src
          WHERE src.latest = 1
        ) , columndef AS (
         SELECT count(c.columnid) AS columncount,
            c.datasetid
           FROM ${schemaName}.columndefinition c
             JOIN ctetrnx ctetrnx_1 ON ctetrnx_1.datasetid::text = c.datasetid::text
          GROUP BY c.datasetid
        )
SELECT DISTINCT ctetrnx.externalid,
    ctetrnx.executionid,
    df.prot_id,
    df.dataflowid,
    df.name as dfname,
    dp.datapackageid,
    ds.datasetid,
    ctetrnx.downloadtrnx,
    ctetrnx.previous_downloadtrnx,
    COALESCE(ctetrnx.datasettype, ds.type) AS dataset_type,
    ds.mnemonic AS datasetname,
    df.type AS datastructure,
    dp.type AS pacakagetype,
    dp.path AS packagepath,
    ctetrnx.datapackagename AS packagenamingconvention,
    ds.datakindid AS clinicaldatatypeid,
    dk.name AS clinicaldatatypename,
    df.vend_id AS vendorsourceid,
    vn.vend_nm AS vendorsource,
    ds.type AS filetype,
    ds.path AS filepath,
    ctetrnx.datasetname AS filenamingconvention,
    ds.rowdecreaseallowed,
    df.testflag AS testdataflow,
    ds.staledays AS overridestalealert,
    ctetrnx.mnemonicfile,
    ctetrnx.processtype,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN 'QUARANTINED'::character varying
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text THEN ctetrnx.downloadstatus
            ELSE 'FAILED'::character varying
        END AS downloadstatus,
    ctetrnx.downloadstarttime,
    ctetrnx.downloadendtime,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN NULL::character varying
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text THEN NULL::character varying
            WHEN ctetrnx.processstatus::text = ANY (ARRAY['SUCCESSFUL'::character varying, 'IN PROGRESS'::character varying, 'PROCESSED WITH ERRORS'::character varying]::text[]) THEN ctetrnx.processstatus
            ELSE 'FAILED'::character varying
        END AS processstatus,
    ctetrnx.processstarttime,
    ctetrnx.processendtime,
    ctetrnx.processtrnx,
    ctetrnx.lastsucceeded,
    ctetrnx.lastattempted,
    ctetrnx.failurecat,
    ctetrnx.refreshtimestamp,
    ds.offsetcolumn,
    ds.offset_val,
    COALESCE(ds.active, 0) AS activedataset,
    cps.status AS childstatus,
    cps.errmsg,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'SUCCESSFUL'::text THEN 'SUCCESSFUL'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 'PROCESSED WITH ERRORS'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'IN PROGRESS'::text THEN 'IN PROGRESS'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN 'QUARANTINED'::text
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text AND ctetrnx.processstatus::text = ''::text THEN 'FAILED'::text
            ELSE 'FAILED'::text
        END AS datasetstatus,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN ds.datasetid::text
            ELSE NULL::text
        END AS fileswithingestionissues,
        CASE
            WHEN dc.no_of_staledays > ds.staledays::double precision THEN 'STALE'::text
            WHEN ds.active = 0 THEN 'INACTIVE'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'SUCCESSFUL'::text THEN 'UP-TO-DATE'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 'UP-TO-DATE'::text
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'IN PROGRESS'::text THEN 'PROCESSING'::text
            WHEN ctetrnx.downloadstatus::text = 'IN PROGRESS'::text AND ctetrnx.processstatus::text = ''::text THEN 'PROCESSING'::text
            WHEN ctetrnx.downloadstatus::text = 'QUEUED'::text AND ctetrnx.processstatus::text = ''::text THEN 'QUEUED'::text
            WHEN ctetrnx.downloadstatus::text = 'QUEUED'::text AND ctetrnx.processstatus::text = 'SUCCESSFUL'::text THEN 'UP-TO-DATE'::text
            WHEN ctetrnx.downloadstatus::text = 'IN PROGRESS'::text OR ctetrnx.processstatus::text = 'IN PROGRESS'::text THEN 'PROCESSING'::text
            WHEN ctetrnx.downloadstatus::text = 'SKIPPED'::text OR ctetrnx.processstatus::text = 'SKIPPED'::text THEN 'SKIPPED'::text
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text OR ctetrnx.processstatus::text = 'FAILED'::text THEN 'FAILED'::text
            ELSE NULL::text
        END AS jobstatus,
    ctetrnx.pct_cng,
        CASE
            WHEN ctetrnx.pct_cng < 0::numeric AND ctetrnx.pct_cng < (- ds.rowdecreaseallowed::numeric) THEN ctetrnx.pct_cng
            ELSE NULL::integer::numeric
        END AS exceeds_pct_cng,
        CASE
            WHEN dc.no_of_staledays > ds.staledays::double precision THEN 1
            ELSE NULL::integer
        END AS is_stale,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'SUCCESSFUL'::text AND ctetrnx.processstatus::text = 'FAILED'::text AND (ctetrnx.failurecat::text = 'QC FAILURE'::text OR ctetrnx.failurecat::text = 'QUARANTINED'::text) THEN 1
            ELSE 0
        END AS quarantinedfiles,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text OR ctetrnx.processstatus::text = 'FAILED'::text THEN 'FAILED'::text
            ELSE NULL::text
        END AS failedloads,
    dc.file_timestamp,
    dc.no_of_staledays,
    ctetrnx.lastsucceeded AS lastfiletransferred,
    ctetrnx.datapackagename AS packagename,
        CASE
            WHEN sl.loc_typ::text <> ALL (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text]) THEN ds.name
            ELSE ctetrnx.datasetname
        END AS filename,
        CASE
            WHEN ds.incremental = 'true'::bpchar OR ds.incremental = 'Y'::bpchar OR columndef.columncount > 0 THEN 'Incremental'::text
            ELSE 'Full'::text
        END AS loadtype,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'QUEUED'::text AND (ctetrnx.processstatus::text = ''::text OR ctetrnx.processstatus IS NULL) THEN 1
            ELSE 0
        END AS inqueue,
        CASE
            WHEN ctetrnx.downloadstatus::text = 'FAILED'::text OR ctetrnx.processstatus::text = 'FAILED'::text THEN 1
            ELSE 0
        END AS datarefreshalerts,
        CASE
            WHEN (date_part('epoch'::text, ctetrnx.processendtime - ctetrnx.processstarttime) / 3600::double precision) > 3::double precision THEN 1
            ELSE 0
        END AS datalatencywarnings,
             s.prot_nbr
   FROM activedf df
   inner join ${schemaName}.STUDY S on (df.prot_id=s.prot_id and s.prot_id=$1)
     INNER JOIN ${schemaName}.vendor vn ON df.vend_id::text = vn.vend_id::text
     INNER JOIN ${schemaName}.source_location sl ON df.src_loc_id::text = sl.src_loc_id::text
     INNER JOIN ${schemaName}.datapackage dp ON df.dataflowid::text = dp.dataflowid::text
     INNER JOIN ${schemaName}.dataset ds ON dp.datapackageid::text = ds.datapackageid::text
     INNER JOIN ${schemaName}.datakind dk ON dk.datakindid::text = ds.datakindid::text
     INNER JOIN columndef ON columndef.datasetid::text = ds.datasetid::text
     LEFT JOIN ctetrnx ON ctetrnx.dataflowid::text = df.dataflowid::text AND ctetrnx.datapackageid::text = dp.datapackageid::text AND ctetrnx.datasetid::text = ds.datasetid::text
     LEFT JOIN checksum dc ON ctetrnx.executionid::text = dc.executionid::text AND ctetrnx.dataflowid::text = dc.dataflowid::text AND ctetrnx.datapackageid::text = dc.datapackageid::text
     LEFT JOIN cps ON ctetrnx.externalid = cps.externalid
     WHERE (ctetrnx.processtype::text = 'SYNC'::text OR ds.active = 1) ${searchCondition}) s`;
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
