const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const jdbc = require("../config/JDBC");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const moment = require("moment");
const { COMMON_ERR } = require("../config/messageConstants");
const { forEach } = require("lodash");
const { DRIVER_NAMES } = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

const createTemporaryLog = async (
  dataflowId,
  user,
  data,
  query_type,
  status
) => {
  const insertTempQuery = `INSERT INTO ${schemaName}.temp_json_log(temp_json_log_id, dataflowid, trans_typ, trans_stat, no_of_retry_attempted, del_flg, created_by, created_on, updated_by, updated_on, json_data) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
  const tempId = helper.createUniqueID();
  let result;
  const currentTime = new Date();
  const values = [
    tempId,
    dataflowId,
    query_type,
    status,
    1,
    "N",
    user,
    currentTime,
    user,
    currentTime,
    data,
  ];
  await DB.executeQuery(insertTempQuery, values)
    .then(async (response) => {
      result = true;
    })
    .catch((err) => {
      result = false;
      console.log(err);
    });
  return result;
};

exports.getDatasetIngestionReportProperties = (req, res) => {
  try {
    const id = req.params.datasetid;
    const userId = req.headers["userid"];
    const searchQuery = `SELECT datasetid,"DatasetName","Vendor",vend_id,"VendorContactInformation","DateLastChecked","DateofLastSuccessfulProcess","ExpectedDateofNextTransfer","ExpectedTransferFrequency","LoadType", "SourceOrigin", dataflowid, "DataFlowName", datapackageid, "FileName", "DataPackageNamingConvention", "DatasetStatus" from ${schemaName}.dataset_stat_current 
            WHERE datasetid = $1`;
    Logger.info({ message: "getDatasetIngestionReportProperties" });

    DB.executeQuery(searchQuery, [id])
      .then(async (response) => {
        const records = response.rows[0] || [];
        await createTemporaryLog(
          records.dataflowid,
          userId,
          records,
          "SELECT",
          "SUCCESS"
        );
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          records
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getDatasetIngestionReportProperties");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatasetIngestionReportTransferLog = (req, res) => {
  try {
    const id = req.params.datasetid;
    const userId = req.headers["userid"];
    const dayFilter = req.query.dayFilter ?? 10;
    const currentDate =
      req.query.currentDate !== undefined
        ? moment(req.query.currentDate).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD");

    var fromDate = moment(currentDate);
    fromDate = fromDate.subtract(dayFilter - 1, "days");
    fromDate = fromDate.format("YYYY-MM-DD");

    const searchQuery = `select * from fn_get_dataset_transfer_log('${id}', '${fromDate}', '${currentDate}')`;
    Logger.info({ message: "getDatasetIngestionReportTransferLog" });

    DB.executeQuery(searchQuery)
      .then((response) => {
        const records = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getDatasetIngestionReportTransferLog");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatasetIngestionReportMetrics = (req, res) => {
  try {
    const id = req.params.datasetid;
    const userId = req.headers["userid"];
    const searchQuery = `WITH transaction_summary_tmp_table as (
      select * from (
      SELECT 	ds.incremental, 
            ts.externalid,
            ts.datasetid,
            ts.executionid,
            ts.dataflowid,
            ts.datapackageid,
            ts.downloadtrnx,
            ts.processtrnx,
            ts.new_records,
            ts.modified_records,
            ts.downloadstatus,
            ts.processstatus,
            ts.downloadstarttime,
            ts.downloadendtime,
            ts.processstarttime,
            ts.processendtime,
            ts.lastsucceeded,
            ts.lastattempted,
            ts.datapackagename,
            ts.datasetname,
            ts.fst_prd_file_recvd,
            ts.failurecat,
            row_number() OVER (PARTITION BY ts.dataflowid, ts.datapackageid, ts.datasetid ORDER BY ts.externalid DESC) AS rnk
            from transaction_summary ts,
              dataset ds
            where
              ds.datasetid = ts.datasetid
              and ts.datasetid = $1
            )foo 
            where (incremental = 'N' and rnk =1) or incremental = 'Y'
            ),
      trns_sum AS (
                 select * from transaction_summary_tmp_table where rnk = 1
                )
              ,vendor_contct AS (
               SELECT vendor_contact.vend_id,
                  string_agg(vendor_contact.emailid::text, ','::text) AS vendor_email
                 FROM vendor_contact
                GROUP BY vendor_contact.vend_id
              ), transalrt AS (
               SELECT ta.externalid,
                  count(1) AS postingestionissues,
                  count(DISTINCT
                      CASE
                          WHEN "position"(ta.rowcol::text, ':'::text) > 0 THEN "substring"(ta.rowcol::text, 1, "position"(ta.rowcol::text, ':'::text) - 1)
                          ELSE NULL::text
                      END) AS recordswithissues
                 FROM transaction_alerts ta
                   JOIN trns_sum t ON ta.externalid = t.externalid
             where t.datasetid = $1
                GROUP BY ta.externalid
              )         
              , inc_transalrt AS (
               SELECT t.datasetid,
                  count(1) AS postingestionissues,
                  count(DISTINCT t.rowcol) AS recordswithissues
                 FROM ( SELECT t_1.datasetid,
                          ta.rowcol,
                              CASE
                                  WHEN ("position"(ta.rowcol::text, ':'::text) - 1) < 0 THEN ta.rowcol
                                  WHEN ("position"(ta.rowcol::text, ':'::text) - 1) > 0 THEN "substring"(ta.rowcol::text, 1, "position"(ta.rowcol::text, ':'::text) - 1)::character varying
                                  ELSE NULL::character varying
                              END AS len
                         FROM transaction_alerts ta
                           JOIN transaction_summary_tmp_table t_1 ON ta.externalid = t_1.externalid
                            where t_1.datasetid = $1) t
                GROUP BY t.datasetid
              ) ,
              inc_fileissues AS (
               SELECT ts_1.datasetid,
            sum(ts_1.processtrnx) AS processtrnx,
                  count(
                      CASE
                          WHEN ts_1.downloadstatus::text = 'FAILED'::text THEN ts_1.externalid
                          ELSE NULL::integer
                      END) AS filesnotingested,
                  count(
                      CASE
                          WHEN ts_1.downloadstatus::text = 'SUCCESSFUL'::text THEN ts_1.externalid
                          ELSE NULL::integer
                      END) AS totalfilesingested,
                  count(
                      CASE
                          WHEN ts_1.downloadstatus::text = 'SUCCESSFUL'::text AND ts_1.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 1
                          ELSE NULL::integer
                      END) AS fileswithissues,
                  count(
                      CASE
                          WHEN ts_1.downloadstatus::text = 'FAILED'::text THEN ts_1.externalid
                          ELSE NULL::integer
                      END) + count(
                      CASE
                          WHEN ts_1.downloadstatus::text = 'SUCCESSFUL'::text THEN ts_1.externalid
                          ELSE NULL::integer
                      END) AS totalincrementalfilestransferred
                 FROM transaction_summary_tmp_table ts_1
                 where ts_1.datasetid = $1
                GROUP BY ts_1.datasetid
              ), checksum AS (
               SELECT src.dataflowid,
                  src.datapackageid,
                  src.executionid,
                  src.lastmodifiedtime,
                  src.latest,
                  src.no_of_staledays
                 FROM ( SELECT COALESCE(dc2.dataflowid, trns_sum_1.dataflowid) AS dataflowid,
                          COALESCE(dc2.datapackageid, trns_sum_1.datapackageid) AS datapackageid,
                          COALESCE(dc2.executionid, trns_sum_1.executionid) AS executionid,
                          dc2.lastmodifiedtime,
                          row_number() OVER (PARTITION BY (COALESCE(dc2.dataflowid, trns_sum_1.dataflowid)), (COALESCE(dc2.datapackageid, trns_sum_1.datapackageid)), (COALESCE(dc2.executionid, trns_sum_1.executionid)) ORDER BY dc2.lastmodifiedtime DESC) AS latest,
                              CASE
                                  WHEN CURRENT_TIMESTAMP > to_timestamp((dc2.lastmodifiedtime::numeric / 1000::numeric)::double precision) THEN date_part('day'::text, CURRENT_TIMESTAMP - to_timestamp((dc2.lastmodifiedtime::numeric / 1000::numeric)::double precision))
                                  ELSE '-1'::integer::double precision
                              END AS no_of_staledays
                         --FROM datapackage_checksum dc2
                           --RIGHT JOIN trns_sum trns_sum_1 ON trns_sum_1.dataflowid::text = dc2.dataflowid::text AND trns_sum_1.datapackageid::text = dc2.datapackageid::text AND trns_sum_1.executionid::text = dc2.executionid::text
                         FROM trns_sum trns_sum_1 
                           LEFT JOIN datapackage_checksum dc2 ON trns_sum_1.dataflowid::text = dc2.dataflowid::text AND trns_sum_1.datapackageid::text = dc2.datapackageid::text AND trns_sum_1.executionid::text = dc2.executionid::text
                  ORDER BY dc2.lastmodifiedtime DESC) src
                WHERE src.latest = 1
              )
       SELECT d.mnemonic AS "DatasetName",
          v.vend_nm AS "Vendor",
          ts.lastsucceeded AS "TransferDate",
          CASE
              WHEN length(btrim(ts.datapackagename::text)) > 0 AND ("position"(ts.datapackagename::text, '.'::text) - 1) > 0 THEN (("substring"(ts.datapackagename::text, 1, "position"(ts.datapackagename::text, '.'::text) - 1) || '/'::text) || ts.datasetname::text)::character varying
              ELSE ts.datasetname
          END AS "FileName",
          ts.datasetname,
          CASE
              WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'SUCCESSFUL'::text THEN 'SUCCESSFUL'::text
              WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 'PROCESSED WITH ERRORS'::text
              WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'IN PROGRESS'::text THEN 'IN PROGRESS'::text
              WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'FAILED'::text AND (ts.failurecat::text = 'QC FAILURE'::text OR ts.failurecat::text = 'QUARANTINED'::text) THEN 'QUARANTINED'::text
              WHEN ts.downloadstatus::text = 'FAILED'::text AND ts.processstatus::text = ''::text THEN 'FAILED'::text
              ELSE 'FAILED'::text
          END AS "FileTransferStatus",
          date_part('epoch'::text, ts.downloadendtime - ts.downloadstarttime) AS "DownloadTime",
          date_part('epoch'::text, ts.processendtime - ts.processstarttime) AS "ProcessTime",
          ts.downloadtrnx AS "DownloadTransactions",
          ts.processtrnx AS "ProcessTransactions",
          ts.new_records AS "NewRecords",
          ts.modified_records AS "ModifiedRecords",
          ts.downloadendtime AS "DownloadDate",
          ts.processendtime AS "ProcessDate",
          ts.lastsucceeded AS "LastCompleted",
          ts.lastattempted AS "LastAttempted",
          ts.lastsucceeded AS "LastLoadedDate",
          ts.datapackagename AS "PackageName",
          d3.name AS "ClinicalDataType",
          d.mnemonic AS "DataSetMnemonic",
          CASE
              WHEN d.incremental = 'Y'::bpchar THEN 'Incremental'::text
              ELSE 'Full'::text
          END AS "LoadType",
          d.offset_val AS "DownloadEndingOffsetValue",
          ts.downloadstarttime AS "DownloadStart",
          ts.processstarttime AS "ProcessStart",
          vc.vendor_email AS "VendorContactInformation",
          ts.lastattempted AS "DateLastChecked",
          ts.lastsucceeded AS "DateofLastSuccessfulProcess",
          NULL::text AS "ExpectedDateofNextTransfer",
          CASE
              WHEN (sl.loc_typ::text = ANY (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text])) AND btrim(d.data_freq::text) = '1'::text THEN 'Daily'::text
              WHEN (sl.loc_typ::text = ANY (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text])) AND btrim(d.data_freq::text) = '7'::text THEN 'Weekly'::text
              WHEN (sl.loc_typ::text = ANY (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text])) AND btrim(d.data_freq::text) = '30'::text THEN 'Monthly'::text
              WHEN (sl.loc_typ::text = ANY (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text])) AND btrim(d.data_freq::text) IS NOT NULL THEN d.data_freq::text || ' Days'::text
              WHEN (sl.loc_typ::text = ANY (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text])) AND btrim(d.data_freq::text) IS NULL THEN NULL::text
              WHEN sl.loc_typ::text <> ALL (ARRAY['SFTP'::character varying::text, 'FTPS'::character varying::text]) THEN 'As Scheduled'::text
              ELSE NULL::text
          END AS "ExpectedTransferFrequency",
          sl.loc_typ AS "SourceOrigin",
          d2.name AS "DataFlowName",
          dp.name AS "DataPackageNamingConvention",
          CASE
              WHEN d.incremental = 'Y'::bpchar THEN 'Incremental'::text
              ELSE 'Full'::text
          END AS incincremental,
          ta1.postingestionissues,
          ta1.recordswithissues,
          ts.processtrnx AS total_records,
          ta2.postingestionissues AS incpostingestionissues,
          ta2.recordswithissues AS increcordswithissues,
          f.processtrnx AS inctotal_records,
          f.totalincrementalfilestransferred AS inctotalincrementalfilestransferred,
          f.filesnotingested AS incfiles_not_ingested,
          f.fileswithissues AS incfileswithissues,
          f.totalfilesingested AS inctotalfilesingested,
          ts.fst_prd_file_recvd,
          ts.dataflowid,
          ts.datapackageid,
          ts.datasetid,
          v.vend_id,
              CASE
                  WHEN dc.no_of_staledays > d.staledays::double precision THEN 'STALE'::text
                  WHEN COALESCE(d.active, 1) = 0 THEN 'INACTIVE'::text
                  WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'SUCCESSFUL'::text THEN 'UP-TO-DATE'::text
                  WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'PROCESSED WITH ERRORS'::text THEN 'UP-TO-DATE'::text
                  WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'IN PROGRESS'::text THEN 'PROCESSING'::text
                  WHEN ts.downloadstatus::text = 'IN PROGRESS'::text AND ts.processstatus::text = ''::text THEN 'PROCESSING'::text
                  WHEN ts.downloadstatus::text = 'QUEUED'::text AND ts.processstatus::text = ''::text THEN 'QUEUED'::text
                  WHEN ts.downloadstatus::text = 'QUEUED'::text AND ts.processstatus::text = 'SUCCESSFUL'::text THEN 'UP-TO-DATE'::text
                  WHEN ts.downloadstatus::text = 'IN PROGRESS'::text OR ts.processstatus::text = 'IN PROGRESS'::text THEN 'PROCESSING'::text
                  WHEN ts.downloadstatus::text = 'SKIPPED'::text OR ts.processstatus::text = 'SKIPPED'::text THEN 'SKIPPED'::text
                  WHEN ts.downloadstatus::text = 'FAILED'::text OR ts.processstatus::text = 'FAILED'::text THEN 'FAILED'::text
                  ELSE 'FAILED'::text
              END AS "DatasetStatus",
              CASE
                  WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'FAILED'::text AND (ts.failurecat::text = 'QC FAILURE'::text OR ts.failurecat::text = 'QUARANTINED'::text) THEN 'QUARANTINED'::character varying
                  WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text THEN ts.downloadstatus
                  ELSE 'FAILED'::character varying
              END AS downloadstatus,
              CASE
                  WHEN ts.downloadstatus::text = 'SUCCESSFUL'::text AND ts.processstatus::text = 'FAILED'::text AND (ts.failurecat::text = 'QC FAILURE'::text OR ts.failurecat::text = 'QUARANTINED'::text) THEN NULL::character varying
                  WHEN ts.downloadstatus::text = 'FAILED'::text THEN NULL::character varying
                  WHEN ts.processstatus::text = ANY (ARRAY['SUCCESSFUL'::character varying, 'IN PROGRESS'::character varying, 'PROCESSED WITH ERRORS'::character varying]::text[]) THEN ts.processstatus
                  ELSE 'FAILED'::character varying
              END AS processstatus,
            ts.failurecat
         FROM transaction_summary_tmp_table ts
           JOIN trns_sum ON ts.externalid = trns_sum.externalid
           JOIN dataset d ON ts.datasetid::text = d.datasetid::text
           LEFT JOIN datakind d3 ON d.datasetid::text = d3.datakindid::text
           LEFT JOIN dataflow d2 ON ts.dataflowid::text = d2.dataflowid::text
           LEFT JOIN source_location sl ON d2.src_loc_id::text = sl.src_loc_id::text
           LEFT JOIN datapackage dp ON d.datapackageid::text = dp.datapackageid::text
           LEFT JOIN vendor v ON d2.vend_id::text = v.vend_id::text
           LEFT JOIN vendor_contct vc ON v.vend_id::text = vc.vend_id::text
           LEFT JOIN transalrt ta1 ON ts.externalid = ta1.externalid
           LEFT JOIN inc_transalrt ta2 ON ts.datasetid::text = ta2.datasetid::text
           LEFT JOIN checksum dc ON trns_sum.executionid::text = dc.executionid::text AND trns_sum.dataflowid::text = dc.dataflowid::text AND dc.datapackageid::text = trns_sum.datapackageid::text
           JOIN inc_fileissues f ON f.datasetid::text = ts.datasetid::text
          ORDER BY ts.lastsucceeded desc`;

    Logger.info({ message: "getDatasetIngestionReportMetrics" });

    DB.executeQuery(searchQuery, [id])
      .then(async (response) => {
        const records = response.rows[0] || [];
        let metrics = {};
        if (records && records.LoadType === "Incremental") {
          metrics = {
            loadType: records.LoadType,
            totalIncrementalFileTransferred:
              records.inctotalincrementalfilestransferred,
            postIngestionIssues: records.incpostingestionissues,
            recordsWithIssues: records.increcordswithissues,
            totalRecords: records.inctotal_records,
            newRecords: records.NewRecords,
            modifiedRecords: records.ModifiedRecords,
            filesNotIngested: records.incfiles_not_ingested,
            filesWithIssues: records.incfileswithissues,
            totalFileIngested: records.inctotalfilesingested,
            vend_id: records.vend_id,
            Vendor: records.Vendor,
            VendorContactInformation: records.VendorContactInformation,
            DateLastChecked: records.DateLastChecked,
            DateofLastSuccessfulProcess: records.DateofLastSuccessfulProcess,
            ExpectedDateofNextTransfer: records.ExpectedDateofNextTransfer,
            ExpectedTransferFrequency: records.ExpectedTransferFrequency,
            SourceOrigin: records.SourceOrigin,
            dataflowid: records.dataflowid,
            datasetid: records.datasetid,
            DataFlowName: records.DataFlowName,
            datapackageid: records.datapackageid,
            FileName: records.FileName,
            DataPackageNamingConvention: records.DataPackageNamingConvention,
            DatasetStatus: records.DatasetStatus,
            DatasetName: records.DatasetName,
            DownloadStart: records.DownloadStart,
            DownloadTransactions: records.DownloadTransactions,
            ProcessTransactions: records.ProcessTransactions,
            ProcessDate: records.ProcessDate,
            LastCompleted: records.LastCompleted,
          };
        } else if (records && records.LoadType === "Full") {
          metrics = {
            loadType: records.LoadType,
            transferDate: records.TransferDate,
            postIngestionIssues: records.postingestionissues,
            recordsWithIssues: records.recordswithissues,
            totalRecords: records.total_records,
            newRecords: records.NewRecords,
            modifiedRecords: records.ModifiedRecords,
            vend_id: records.vend_id,
            Vendor: records.Vendor,
            VendorContactInformation: records.VendorContactInformation,
            DateLastChecked: records.DateLastChecked,
            DateofLastSuccessfulProcess: records.DateofLastSuccessfulProcess,
            ExpectedDateofNextTransfer: records.ExpectedDateofNextTransfer,
            ExpectedTransferFrequency: records.ExpectedTransferFrequency,
            SourceOrigin: records.SourceOrigin,
            dataflowid: records.dataflowid,
            datasetid: records.datasetid,
            DataFlowName: records.DataFlowName,
            datapackageid: records.datapackageid,
            FileName: records.FileName,
            DataPackageNamingConvention: records.DataPackageNamingConvention,
            DatasetStatus: records.DatasetStatus,
            DatasetName: records.DatasetName,
            DownloadStart: records.DownloadStart,
            DownloadTransactions: records.DownloadTransactions,
            ProcessTransactions: records.ProcessTransactions,
            ProcessDate: records.ProcessDate,
            LastCompleted: records.LastCompleted,
          };
        }
        await createTemporaryLog(
          records?.dataflowid,
          userId,
          JSON.stringify(records),
          "SELECT",
          "SUCCESS"
        );
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          metrics
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getDatasetIngestionReportMetrics");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatasetIssueTypes = (req, res) => {
  try {
    const id = req.params.datasetid;
    const searchQuery = `WITH trns_cum AS (
      SELECT trns.externalid,
         trns.datasetid,
         trns.incremental
        FROM ( SELECT ts_1.datasetid,
                 ts_1.externalid,
                 d.incremental,
                 row_number() OVER (PARTITION BY ts_1.dataflowid, ts_1.datapackageid, ts_1.datasetid ORDER BY ts_1.externalid DESC) AS rnk
                FROM ${schemaName}.transaction_summary ts_1,
                ${schemaName}.dataset d
                where d.datasetid = ts_1.datasetid
                and d.incremental = 'N'
                and ts_1.datasetid = $1) trns
       WHERE trns.rnk = 1
     ), cum_types AS (
      SELECT t.datasetid,
         ta.attributename AS ingestionissuetype,
         count(ta.rowcol) AS totalnoofissuess
        FROM trns_cum t
          left JOIN ${schemaName}.transaction_alerts ta ON t.externalid = ta.externalid
             GROUP BY t.datasetid, ta.attributename
     )--select * from cum_types
     , inc_types AS (
      SELECT ts.datasetid,
         ta.attributename AS ingestionissuetype,
         count(ta.rowcol) AS totalnoofissuess
        FROM ${schemaName}.transaction_alerts ta
          JOIN ${schemaName}.transaction_summary ts ON ta.externalid = ts.externalid
          join ${schemaName}.dataset d on ts.datasetid = d.datasetid
          where ts.datasetid = $1
          and d.incremental = 'Y'
       GROUP BY ts.datasetid, ta.attributename
     )
SELECT coalesce (c.datasetid, i.datasetid)datasetid,
 d2.incremental,
     CASE
         WHEN upper(coalesce (i.ingestionissuetype,c.ingestionissuetype)::text) = 'PKVROW'::text THEN 'Primary Key Violation'::character varying
         WHEN upper(coalesce (i.ingestionissuetype,c.ingestionissuetype)::text) = 'TYPEMISMATCHROW'::text THEN 'Data Type Mismatch'::character varying
         WHEN upper(coalesce (i.ingestionissuetype,c.ingestionissuetype)::text) = 'FORMATMISMATCHEDROW'::text THEN 'Format Mismatch'::character varying
         WHEN upper(coalesce (i.ingestionissuetype,c.ingestionissuetype)::text) = 'LOVFAILEDROW'::text THEN 'LOV Fail'::character varying
         WHEN upper(coalesce (i.ingestionissuetype,c.ingestionissuetype)::text) = 'DUPRECROW'::text THEN 'Duplicate Row'::character varying
         WHEN upper(coalesce (i.ingestionissuetype,c.ingestionissuetype)::text) = 'DECCOLCNT'::text THEN 'Column Count Mismatch'::character varying
         ELSE coalesce (i.ingestionissuetype,c.ingestionissuetype)
     END AS ingestionissuetype,
 i.ingestionissuetype AS "incrementalIssueType",
 i.totalnoofissuess AS "incrementalTotalIssues",
 c.ingestionissuetype AS "cummulativeIssueType",
 c.totalnoofissuess AS "cummulativeTotalIssues"
FROM ${schemaName}.dataset d2
  left join inc_types i ON i.datasetid::text = d2.datasetid::text
  LEFT JOIN cum_types c ON c.datasetid::text = d2.datasetid::text
  where d2.datasetid = $1`;

    Logger.info({ message: "getDatasetIssueTypes" });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const records = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getDatasetIssueTypes");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getFileTransferHistory = (req, res) => {
  try {
    const id = req.params.datasetid;
    const dayFilter = req.query.dayFilter ?? "10";
    const page = req.query.page ? req.query.page * 10 : 10;
    const searchQuery = `SELECT count(datasetid) OVER() AS total_transfered, dataflowid, executionid, "VERSION", datapackageid, datasetid, mnemonicfile, datapackagename, datasetname, datasettype, processtype, "user", downloadstatus, downloadstarttime, downloadendtime, processstatus, processstarttime, processendtime, downloadtrnx, processtrnx, filerpath, lastsucceeded, lastattempted, failurecat, refreshtimestamp, stage, fst_prd_file_recvd, deleted_records, modified_records, new_records from ${schemaName}.transaction_summary
              WHERE datasetid = $1 and lastsucceeded BETWEEN NOW() - INTERVAL '${dayFilter} days' AND NOW() order by lastsucceeded desc  `;
    // limit $2
    //  and lastattempted BETWEEN NOW() - INTERVAL '${dayFilter} days' AND NOW()
    Logger.info({ message: "getFileTransferHistory" });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const records = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records,
          totalSize: records.length > 0 ? records[0]?.total_transfered : 0,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getFileTransferHistory");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { datasetid: datasetId } = req.params;
    // const {
    //   rows: [dfObj],
    // } = await DB.executeQuery(`SELECT DF.prot_id from ${schemaName}.dataset DS
    // left join ${schemaName}.datapackage DP on (DS.datapackageid = DP.datapackageid)
    // left join ${schemaName}.dataflow DF on (DF.dataflowid = DP.dataflowid)
    // where datasetid='${datasetId}';`);
    // if (!dfObj) {
    //   return apiResponse.ErrorResponse(res, "Study now found for this dataset");
    // }

    // const query = `with LATEST_TRANS as (
    //   select prot_id,datasetid,externalid,
    //   case when tenant_mnemonic_nm is not null then
    //   dbname_prefix||tenant_mnemonic_nm||'_'||prot_mnemonic_nm
    //   else dbname_prefix||prot_mnemonic_nm end as databasename,
    //   tablename_prefix,
    //   datakindmnemonic,datastructure,vendormnemonic,datasetmnemonic,
    //   allcolumns,"name" ,primarykey from (
    //   select ts.datasetid ,ts.externalid ,
    //   case when d.testflag =1 then (select value from config c where component ='hive' and "name" ='test_table_prefix')
    //   else null end as tablename_prefix,
    //   (select value from config c where component ='hive' and "name" ='db_prefix') as dbname_prefix,
    //   dk."name" as datakindmnemonic,
    //   d.type as datastructure,
    //   v.vend_nm_stnd as vendormnemonic,
    //   ds.mnemonic as datasetmnemonic,
    //   case when s.prot_mnemonic_nm is not null then lower(s.prot_mnemonic_nm)
    //   else lower(regexp_replace(s.prot_mnemonic_nm, '[^0-9A-Za-z]', '','g'))
    //   end as prot_mnemonic_nm,t.tenant_mnemonic_nm ,
    //   dcs."columns" as allcolumns,s.prot_id,c."name" ,c.primarykey,
    //   row_number() over(partition by ts.datasetid order by ts.executionid,TS.EXTERNALID desc) as rnk
    //   from transaction_summary ts
    //   inner join dataflow d on (ts.dataflowid=d.dataflowid)
    //   inner join study s on (d.prot_id=s.prot_id and s.prot_id='${dfObj.prot_id}'
    //   )
    //   inner join study_sponsor sp on (s.prot_id=sp.prot_id)
    //   inner join sponsor s1 on (sp.spnsr_id=s1.spnsr_id)
    //   inner join tenant t on (s1.tenant_id=t.tenant_id)
    //   inner join datapackage dp on (ts.datapackageid=dp.datapackageid)
    //   inner join dataset ds on (ts.datasetid=ds.datasetid and ts.datasetid in ('${datasetId}')
    //   )
    //   inner join datakind dk on (ds.datakindid=dk.datakindid)
    //   inner join vendor v on (d.vend_id=v.vend_id)
    //   left join columndefinition c on (ds.datasetid=c.datasetid and primarykey=1 )
    //   inner join dataset_current_schema dcs on (dcs.dataflowid=ts.dataflowid and ts.executionid=dcs.executionid
    //   and dcs.mnemonic=ds.mnemonic)
    //   where upper(processstatus) !='SKIPPED'
    //   ) R where RNK=1
    //   )
    //   select distinct datasetid,databasename as databasename,
    //   case when tablename_prefix is null then
    //     datakindmnemonic||'_'||datastructure||'_'||vendormnemonic||'_'||datasetmnemonic||'_current'
    //     else tablename_prefix||datakindmnemonic||'_'||datastructure||'_'||vendormnemonic||'_'||datasetmnemonic||'_current'
    //     end as tablename,originalAttributeName,
    //   Issue_Type,
    //   count(distinct rownumbers) as NoOfErrors,
    //      STRING_AGG (distinct pkColumns, ',') as pkColumns,
    //      array_agg (distinct rownumbers::INTEGER) as errorrownumbers,
    //      array_agg (distinct Columnname) as errorcolumnnames,
    //   allcolumns
    //   from
    //   (
    //   select distinct lt.*,
    //   lt."name"  as pkColumns,ta.attributename as originalAttributeName,
    //   case when ta.attributename='pkvRow' then 'Primary Key Violation'
    //      when ta.attributename='dupRecRow' then 'Duplicate Row'
    //      when ta.attributename ='typeMismatchRow' then 'Data Type Mismatch'
    //      when ta.attributename ='fldLenOutOfRngRow' then 'Field Length Out of Range'
    //      when ta.attributename ='formatMismatchedRow' then 'Format Mismatch'
    //      when ta.attributename ='LOVFailedRow' then 'LOV Fail'
    //      when ta.attributename ='reqFldEmptyRow' then 'Required Field Null'
    //      when ta.attributename ='decColCnt' then 'Column Count Mismatch'
    //      when ta.attributename ='uniqueConstViolation' then 'Unique Constraint Violation'
    //      when ta.attributename ='excelFormViolation' then 'Excel Formula Violation'
    //      else ta.attributename end as Issue_Type ,
    //     case when ta.rowcol not like '%:%' then ta.rowcol
    //     else replace("substring"(ta.rowcol::text, 1, "position"(ta.rowcol::text, ':'::text)),':','') end as rownumbers,
    //   case WHEN "position"(ta.rowcol::text, ':'::text) > 0
    //     THEN "substring"(ta.rowcol::text,  "position"(ta.rowcol::text, ':'::text) + 1)
    //     ELSE NULL::text END as Columnname
    //     from latest_trans lt
    //     join transaction_alerts ta on (lt.externalid=ta.externalid)
    //   ) a --where Issue_Type in ('Format Mismatch')
    //   group by datasetid,databasename,tablename,originalAttributeName,Issue_Type,allcolumns,prot_id;`;

    const query = `select datasetid,databasename,tablename,originalattributename,issue_type,nooferrors,pkcolumns, errorrownumbers, errorcolumnnames::json, allcolumns
    from cdascfg.fn_get_file_ingestion_issues('${datasetId}');`;

    const { rows: issues } = await DB.executeQuery(query);
    // const filteredData = issues.map((x) => {
    //   return x.errorcolumnnames;
    // });
    return apiResponse.successResponseWithData(
      res,
      "Issues retieved successfully",
      issues
    );
    Logger.info({ message: "getIngestionIssues" });
  } catch (err) {
    const msg = err.message || COMMON_ERR;
    Logger.error("catch :getIssues");
    Logger.error(msg);
    return apiResponse.ErrorResponse(res, msg);
  }
};

exports.getIssueColumns = async (req, res) => {
  try {
    const { selectedIssues } = req.body;
    if (!selectedIssues || (selectedIssues && !Array.isArray(selectedIssues))) {
      return apiResponse.ErrorResponse(
        res,
        "Please select atleast one issue to proceed"
      );
    }
    const {
      HIVE_USER: dbUser,
      HIVE_PASS: dbPass,
      INGESTION_HIVE_CONNECTION_URL: connectionUrl,
    } = process.env;
    if (!dbPass || !dbUser || !connectionUrl) {
      return apiResponse.ErrorResponse(
        res,
        "Please correct your hive db credentials and connection url"
      );
    }
    let errColumns = [];
    let errRows = [];
    let dbName = null;
    let tableName = null;
    selectedIssues.forEach(async (issue) => {
      const { databasename, tablename, errorrownumbers, errorcolumnnames } =
        issue;
      if (
        databasename &&
        tablename &&
        errorrownumbers &&
        errorcolumnnames &&
        Array.isArray(errorrownumbers) &&
        Array.isArray(errorcolumnnames)
      ) {
        errColumns = errColumns.concat(errorcolumnnames);
        errRows = errRows.concat(errorrownumbers);
        dbName = databasename;
        tableName = tablename;
      }
    });
    errColumns = [...new Set(errColumns)].filter((el) => {
      return el !== null && typeof el !== "undefined";
    });
    errRows = [...new Set(errRows)]
      .filter((el) => {
        return el !== null && typeof el !== "undefined";
      })
      .sort(function (a, b) {
        return a - b;
      });
    if (!errColumns.length || !errRows.length) {
      return apiResponse.ErrorResponse(
        res,
        "Selected issue doesn't have any columns"
      );
    }
    const baseQuery = `SELECT \`_rowno\`, ${errColumns} from ${dbName}.${tableName} WHERE \`_rowno\` in`;
    let concatQuery = "";
    if (errRows.length > 1000) {
      for (let i = 0; i < errRows.length; i += 1000) {
        const chunk = errRows.slice(i, i + 1000);
        concatQuery += `${i > 0 ? "\nunion all\n" : ""}${baseQuery} (${chunk})`;
      }
      concatQuery += `;`;
    } else {
      concatQuery += `${baseQuery} (${errRows});`;
    }
    // console.log("concatQuery", concatQuery);
    await jdbc(
      dbUser,
      dbPass,
      connectionUrl,
      DRIVER_NAMES.HIVE,
      concatQuery,
      "Issue retrieved successfully.",
      res
    );
  } catch (err) {
    const msg = err.message || COMMON_ERR;
    Logger.error("catch :getIssueColumns");
    Logger.error(msg);
    return apiResponse.ErrorResponse(res, msg);
  }
};
