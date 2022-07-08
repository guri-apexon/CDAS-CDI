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

    const searchQuery = `SELECT
              "DatasetName", "Vendor", "TransferDate", "FileName", datasetname, "FileTransferStatus",
              "DownloadTime", "ProcessTime", "DownloadTransactions", "ProcessTransactions", "NewRecords",
              "ModifiedRecords", "DownloadDate", "ProcessDate", "LastCompleted", "LastAttempted", "LastLoadedDate",
              "PackageName", "ClinicalDataType", "DataSetMnemonic", "LoadType", "DownloadEndingOffsetValue",
              "DownloadStart", "ProcessStart", "SourceOrigin",
              dataflowid, "DataflowName", "errmsg", fst_prd_file_recvd
              from cdascfg.dataset_transfer_log
              WHERE datasetid = $1
              AND to_char("LastCompleted",'yyyy-mm-dd')::date between date '${fromDate}' and date '${currentDate}'`;

    Logger.info({ message: "getDatasetIngestionReportTransferLog" });

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
    Logger.error("catch :getDatasetIngestionReportTransferLog");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatasetIngestionReportMetrics = (req, res) => {
  try {
    const id = req.params.datasetid;
    const userId = req.headers["userid"];
    const searchQuery = `SELECT "DatasetName", "Vendor",vend_id, "TransferDate", "FileName", datasetname, "FileTransferStatus", "DownloadTime", "ProcessTime", "DownloadTransactions", "ProcessTransactions", "NewRecords", "ModifiedRecords", "DownloadDate", "ProcessDate", "LastCompleted", "LastAttempted", "LastLoadedDate", "PackageName", "ClinicalDataType", "DataSetMnemonic", "LoadType", "DownloadEndingOffsetValue", "DownloadStart", "ProcessStart", "VendorContactInformation", "DateLastChecked", "DateofLastSuccessfulProcess", "ExpectedDateofNextTransfer", "ExpectedTransferFrequency", "SourceOrigin", "DataFlowName", "DataPackageNamingConvention", incincremental, postingestionissues, recordswithissues, total_records, incpostingestionissues, increcordswithissues, inctotal_records, inctotalincrementalfilestransferred, incfiles_not_ingested, incfileswithissues, inctotalfilesingested, fst_prd_file_recvd, dataflowid, datapackageid, datasetid, "DatasetStatus" from ${schemaName}.dataset_stat_current 
                WHERE datasetid = $1`;
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
            DataFlowName: records.DataFlowName,
            datapackageid: records.datapackageid,
            FileName: records.FileName,
            DataPackageNamingConvention: records.DataPackageNamingConvention,
            DatasetStatus: records.DatasetStatus,
            DatasetName: records.DatasetName,
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
            DataFlowName: records.DataFlowName,
            datapackageid: records.datapackageid,
            FileName: records.FileName,
            DataPackageNamingConvention: records.DataPackageNamingConvention,
            DatasetStatus: records.DatasetStatus,
            DatasetName: records.DatasetName,
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
    const searchQuery = `SELECT incdatasetid as datasetid, incremental, "incIngestionIssueType" as "incrementalIssueType", "incTotalNoOfIssuess" as "incrementalTotalIssues", "cumIngestionIssueType" as "cummulativeIssueType", "cumTotalNoOfIssuess" as "cummulativeTotalIssues", ingestionissuetype from ${schemaName}.dataset_issue_summary 
                WHERE incdatasetid = $1`;
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
    const { datasetid } = req.params;
    const {
      rows: [dfObj],
    } = await DB.executeQuery(`SELECT DF.prot_id from ${schemaName}.dataset DS
    left join ${schemaName}.datapackage DP on (DS.datapackageid = DP.datapackageid)
    left join ${schemaName}.dataflow DF on (DF.dataflowid = DP.dataflowid)
    where datasetid='${datasetid}';`);
    if (!dfObj) {
      return apiResponse.ErrorResponse(res, "Study now found for this dataset");
    }

    const query = `with LATEST_TRANS as (
      select prot_id,datasetid,externalid,dbname_prefix||tenant_mnemonic_nm||'_'||prot_mnemonic_nm as databasename,tablename_prefix,
      datakindmnemonic,datastructure,vendormnemonic,datasetmnemonic,
      allcolumns,"name" ,primarykey from (
      select ts.datasetid ,ts.externalid ,
      case when d.testflag =1 then (select value from config c where component ='hive' and "name" ='test_table_prefix') 
      else null end as tablename_prefix,
      (select value from config c where component ='hive' and "name" ='db_prefix') as dbname_prefix,
      dk."name" as datakindmnemonic,
      d.type as datastructure,
      v.vend_nm_stnd as vendormnemonic,
      ds.mnemonic as datasetmnemonic,
      case when s.prot_mnemonic_nm is not null then lower(s.prot_mnemonic_nm)
      else lower(regexp_replace(s.prot_mnemonic_nm, '[^0-9A-Za-z]', '','g'))
      end as prot_mnemonic_nm,t.tenant_mnemonic_nm ,
      dcs."columns" as allcolumns,s.prot_id,c."name" ,c.primarykey,
      row_number() over(partition by ts.datasetid order by ts.executionid,TS.EXTERNALID desc) as rnk 
      from transaction_summary ts
      inner join dataflow d on (ts.dataflowid=d.dataflowid)
      inner join study s on (d.prot_id=s.prot_id and s.prot_id='${dfObj.prot_id}'
      )
      inner join study_sponsor sp on (s.prot_id=sp.prot_id)
      inner join sponsor s1 on (sp.spnsr_id=s1.spnsr_id)
      inner join tenant t on (s1.tenant_id=t.tenant_id)
      inner join datapackage dp on (ts.datapackageid=dp.datapackageid)
      inner join dataset ds on (ts.datasetid=ds.datasetid and ts.datasetid in ('${datasetid}') 
      )
      inner join datakind dk on (ds.datakindid=dk.datakindid)
      inner join vendor v on (d.vend_id=v.vend_id)
      left join columndefinition c on (ds.datasetid=c.datasetid and primarykey=1 )
      inner join dataset_current_schema dcs on (dcs.dataflowid=ts.dataflowid and ts.executionid=dcs.executionid
      and dcs.mnemonic=ds.mnemonic)
      where upper(processstatus) !='SKIPPED' 
      ) R where RNK=1 
      )
      select distinct datasetid,databasename as databasename,
      case when tablename_prefix is null then
        datakindmnemonic||'_'||datastructure||'_'||vendormnemonic||'_'||datasetmnemonic||'_current' 
        else tablename_prefix||datakindmnemonic||'_'||datastructure||'_'||vendormnemonic||'_'||datasetmnemonic||'_current' 
        end as tablename,originalAttributeName,
      Issue_Type,
      count(distinct rownumbers) as NoOfErrors,
         STRING_AGG (distinct pkColumns, ',') as pkColumns,
         STRING_AGG (distinct rownumbers, ',') as errorrownumbers,
      STRING_AGG (distinct Columnname, ',') as errorcolumnnames,
      allcolumns
      from 
      (
      select distinct lt.*,
      lt."name"  as pkColumns,ta.attributename as originalAttributeName,
      case when ta.attributename='pkvRow' then 'Primary Key Violation'
         when ta.attributename='dupRecRow' then 'Duplicate Row'
         when ta.attributename ='typeMismatchRow' then 'Data Type Mismatch'
         when ta.attributename ='fldLenOutOfRngRow' then 'Field Length Out of Range'
         when ta.attributename ='formatMismatchedRow' then 'Format Mismatch'
         when ta.attributename ='LOVFailedRow' then 'LOV Fail'
         when ta.attributename ='reqFldEmptyRow' then 'Required Field Null'
         when ta.attributename ='decColCnt' then 'Column Count Mismatch'
         when ta.attributename ='uniqueConstViolation' then 'Unique Constraint Violation' 
         when ta.attributename ='excelFormViolation' then 'Excel Formula Violation'
         else ta.attributename end as Issue_Type ,
        case when ta.rowcol not like '%:%' then ta.rowcol
        else replace("substring"(ta.rowcol::text, 1, "position"(ta.rowcol::text, ':'::text)),':','') end as rownumbers,
      case WHEN "position"(ta.rowcol::text, ':'::text) > 0 
        THEN "substring"(ta.rowcol::text,  "position"(ta.rowcol::text, ':'::text) + 1)
        ELSE NULL::text END as Columnname 
        from latest_trans lt
        join transaction_alerts ta on (lt.externalid=ta.externalid)	 
      ) a --where Issue_Type in ('Format Mismatch')
      group by datasetid,databasename,tablename,originalAttributeName,Issue_Type,allcolumns,prot_id;`;
    const { rows: issues } = await DB.executeQuery(query);
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
    const { HIVE_USER: dbUser, HIVE_PASS: dbPass } = process.env;
    if (!dbPass || !dbUser) {
      return apiResponse.ErrorResponse(
        res,
        "Please check your hive db credentials"
      );
    }
    const hostName = "uskhdphive.quintiles.net";
    const port = "10000";
    selectedIssues.forEach(async (issue) => {
      const { databasename, tablename, errorrownumbers, errorcolumnnames } =
        issue;
      if (databasename && tablename && errorrownumbers && errorcolumnnames) {
        const query = `SELECT \`_rowno\`, ${errorcolumnnames} from ${databasename}.${tablename} WHERE \`_rowno\` in (${errorrownumbers});`;
        console.log("dbUser", dbUser, dbPass, query);

        // await jdbc(
        //   dbUser,
        //   dbPass,
        //   `jdbc:hive2://${hostName}:${port}/${databasename};transportMode=https;httpPath=cliservice;ssl=1;AllowSelfSignedCerts=1;AuthMech=3`,
        //   "com.cloudera.hive.jdbc41.HS2Driver",
        //   query,
        //   "query executed successfully.",
        //   res
        // );
      }
    });
    const columns = [
      {
        _rowno: 1,
        date_format_1: "<dd/mm/yy>",
        date_format_10: "<EEE, MMM dd, yy>",
        date_format_11: "<EEE, MONTH dd, yy>",
        date_format_12: "<yyyy-MM-ddTHH:mi:ss'Z'>",
        date_format_13: "<yyyy-MM-ddTHH:mi:ssZ>",
        date_format_14: "<yyyy-MM-ddTHH:mi:ssz>",
        date_format_15: "<yyyy-MM-ddTHH:mi:sszZ>",
        date_format_16: "<hh:mi z>",
        date_format_17: "<hh:mi Z>",
        date_format_18: "<hh:mi zZ>",
        date_format_19: "<hh:mi:ss.S>",
        date_format_2: "<dd>/<mm>/<yyyy>",
        date_format_20: "<EEE, MMM dd, yyyy>",
        date_format_21: "<DAY, MONTH dd, yy>",
        date_format_22: "Today's date is <mm/dd/yyyy> day <DAY>",
        date_format_23: "<% dd-mm_yyyy hh:mi:ss>",
        date_format_3: "<dd-mm-yyyy> <HH:mi:ss>",
        date_format_4: "<dd-mm-yyyy kk:mi:ss>",
        date_format_5: "<DDMMMYYYY>",
        date_format_6: "<DD MONTH YYYY>",
        date_format_7: "<dd_mm_yy>",
        date_format_8: "<KK:mi a, z>",
        date_format_9: "<DD-MM-YYYY_T_HH:mi:ss>",
      },
      {
        _rowno: 2,
        date_format_1: "01/10/20",
        date_format_10: "TUE, APR 26, 20",
        date_format_11: "Tue, APRIL 26, 20",
        date_format_12: "2020-10-10T23:59:59'Z'",
        date_format_13: "2020-10-10T23:59:59Z",
        date_format_14: "2020-10-10T23:59:59IST",
        date_format_15: "2020-10-10T23:59:59IST+05:30",
        date_format_16: "23:59 IST",
        date_format_17: "23:59 Z",
        date_format_18: "23:59 GMT+05:30",
        date_format_19: "23:59:59.001",
        date_format_2: "01/10/2020",
        date_format_20: "Tue, APR 26, 2022",
        date_format_21: "Tuesday, APRIL 26, 22",
        date_format_22: "Today's date is 05/16/2022 day Monday",
        date_format_23: "some 16-05_2022 08:23:50",
        date_format_3: "10-10-2020 00:00:00",
        date_format_4: "10-10-2020 1:01:00",
        date_format_5: "10OCT2020",
        date_format_6: "10 OCTOBER 2020",
        date_format_7: "10_10_20",
        date_format_8: "01:00 am, GMT",
        date_format_9: "10-10-2020_T_23:59:59",
      },
      {
        _rowno: 3,
        date_format_1: "1/10/20",
        date_format_10: "TUE, APR 26, 22",
        date_format_11: "TUE, April 26, 22",
        date_format_12: "",
        date_format_13: "2020-10-10T23:59:59+0000",
        date_format_14: "2020-10-10T23:59:59GMT",
        date_format_15: "2020-10-10T23:59:59GMT+05:30",
        date_format_16: "23:59 EST",
        date_format_17: "23:59 -08:00",
        date_format_18: "23:59 UTC+05:30",
        date_format_19: "23:59:59.01",
        date_format_2: "1/10/2020",
        date_format_20: "WED, Apr 26, 2022",
        date_format_21: "",
        date_format_22: "",
        date_format_23: "1@%^&3424 16-05_2022 08:23:50",
        date_format_3: "10-10-2020 00:00:01",
        date_format_4: "10-10-2020 01:00:00",
        date_format_5: "10OcT2020",
        date_format_6: "10 OcToBeR 2020",
        date_format_7: "11_11_21",
        date_format_8: "01:00 am, IST",
        date_format_9: "10-10-2020_T_00:00:00",
      },
      {
        _rowno: 4,
        date_format_1: "10/10/02",
        date_format_10: "",
        date_format_11: "",
        date_format_12: "",
        date_format_13: "2020-10-10T23:59:59+0530",
        date_format_14: "",
        date_format_15: "2020-10-10T23:59:59UTC+05:30",
        date_format_16: "23:59 UTC",
        date_format_17: "23:59 -0800",
        date_format_18: "",
        date_format_19: "23:59:59.1",
        date_format_2: "10/10/0002",
        date_format_20: "",
        date_format_21: "",
        date_format_22: "",
        date_format_23: "16-05_2022 08:23:50",
        date_format_3: "10-10-2020 01:00:00",
        date_format_4: "10-10-2020 12:59:59",
        date_format_5: "10ocT2020",
        date_format_6: "10 october 2020",
        date_format_7: "30_12_21",
        date_format_8: "01:00 am, EST",
        date_format_9: "",
      },
      {
        _rowno: 5,
        date_format_1: "",
        date_format_10: "",
        date_format_11: "",
        date_format_12: "",
        date_format_13: "2020-10-10T23:59:59+05:30",
        date_format_14: "",
        date_format_15: "",
        date_format_16: "23:59 GMT",
        date_format_17: "",
        date_format_18: "",
        date_format_19: "23:59:59.12",
        date_format_2: "",
        date_format_20: "",
        date_format_21: "",
        date_format_22: "",
        date_format_23: "",
        date_format_3: "10-10-2020 23:59:59",
        date_format_4: "10-10-2020 1:1:1",
        date_format_5: "10oCt2020",
        date_format_6: "10 october 0002",
        date_format_7: "10_10_01",
        date_format_8: "01:00 am, PST",
        date_format_9: "",
      },
      {
        _rowno: 6,
        date_format_1: "",
        date_format_10: "",
        date_format_11: "",
        date_format_12: "",
        date_format_13: "2020-10-10T23:59:59-08:00",
        date_format_14: "",
        date_format_15: "",
        date_format_16: "",
        date_format_17: "",
        date_format_18: "",
        date_format_19: "23:59:59.123",
        date_format_2: "",
        date_format_20: "",
        date_format_21: "",
        date_format_22: "",
        date_format_23: "",
        date_format_3: "10-10-2020 1:1:1",
        date_format_4: "",
        date_format_5: "10oct2020",
        date_format_6: "",
        date_format_7: "",
        date_format_8: "",
        date_format_9: "",
      },
      {
        _rowno: 7,
        date_format_1: "32/10/20",
        date_format_10: "Tuesday, APRIL 26, 2022",
        date_format_11: "Tue, APR 26, 2022",
        date_format_12: "2020-10-10T23:59:59Z",
        date_format_13: "2020-10-10T23:59:59GMT+05:30",
        date_format_14: "2020-10-10T23:59:59'Z'",
        date_format_15: "2020-10-10T23:59:59+0530",
        date_format_16: "23:59 -08:00",
        date_format_17: "23:59 z",
        date_format_18: "23:59 z",
        date_format_19: "23:59:59.1234",
        date_format_2: "32/10/2020",
        date_format_20: "Tuesday, APRIL 26, 2022",
        date_format_21: "Tue, APRIL 26, 20",
        date_format_22: "Today's date is 05/16/2022 day Mon",
        date_format_23: "some 1605_2022 thing 08:23:50",
        date_format_3: "10-10-2020 00",
        date_format_4: "10-10-2020 00:00:01",
        date_format_5: "oct2020",
        date_format_6: "10 october 20",
        date_format_7: "31_13_22",
        date_format_8: "01:00 am, Pacific Standard Time",
        date_format_9: "10-OCT-2020_T_23:59:59",
      },
      {
        _rowno: 8,
        date_format_1: "10/13/20",
        date_format_10: "Tue, APRIL 26, 2022",
        date_format_11: "Tuesday, APRIL 26, 2022",
        date_format_12: "2020-10-10T23:59:59+0000",
        date_format_13: "2020-10-10T23:59:59'Z'",
        date_format_14: "2020-10-10T23:59:59Z",
        date_format_15: "2020-10-10T23:59:59+05:30",
        date_format_16: "23:59 -0800",
        date_format_17: "23:59 IST",
        date_format_18: "23:59 Z",
        date_format_19: "23:59:59.12345",
        date_format_2: "10/13/2020",
        date_format_20: "Tue, APRIL 26, 20",
        date_format_21: "TUE, April 26, 22",
        date_format_22: "Todays date is 05/16/2022 day Monday",
        date_format_23: "some 1605_2022 thing 08:23:51",
        date_format_3: "10-10-2020 24:60:60",
        date_format_4: "10-10-2020 00:00:00",
        date_format_5: "10Oct",
        date_format_6: "oct 2020",
        date_format_7: "32_10_22",
        date_format_8: "01:00 am, Z",
        date_format_9: "10-OCTOBER-2020_T_23:59:59",
      },
      {
        _rowno: 9,
        date_format_1: "10/10/2",
        date_format_10: "Tuesday , APR 26, 2022",
        date_format_11: "Tue, APR 26, 2022",
        date_format_12: "2020-10-10T23:59:59+0530",
        date_format_13: "2020-10-10T23:59:59UTC+05:30",
        date_format_14: "2020-10-10T23:59:59+0000",
        date_format_15: "2020-10-10T23:59:59IST",
        date_format_16: "23:59 GMT+05:30",
        date_format_17: "23:59 EST",
        date_format_18: "23:59 IST",
        date_format_19: "23:59:59.123456",
        date_format_2: "10/10/2",
        date_format_20: "TUE, April 26, 22",
        date_format_21: "TUE, APRil 26, 2022",
        date_format_22: "Today's date is 05/16/20 day Monday",
        date_format_23: "some 1605_2022 thing 08:23:52",
        date_format_3: "10-10-2020 01:5:70",
        date_format_4: "10-10-2020 13:60:60",
        date_format_5: "00Oct0000",
        date_format_6: "10 Oct",
        date_format_7: "11_11_0",
        date_format_8: "01:00 am, z",
        date_format_9: "10-10-2020_'T'_23:59:59",
      },
      {
        _rowno: 10,
        date_format_1: "10/10/202",
        date_format_10: "TUE, APR 26, 22021",
        date_format_11: "Tuesday , APR 26, 2022",
        date_format_12: "2020-10-10T23:59:59+05:30",
        date_format_13: "2020-10-10T23:59:59IST",
        date_format_14: "2020-10-10T23:59:59+0530",
        date_format_15: "2020-10-10T23:59:59GMT",
        date_format_16: "23:59 UTC+05:30",
        date_format_17: "23:59 GMT+05:30",
        date_format_18: "23:59 EST",
        date_format_19: "23:59:59.1234567",
        date_format_2: "10/10/20",
        date_format_20: "Tuesday, APRIL 26, 2022",
        date_format_21: "TUE, APR 26, 20",
        date_format_22: "Today's date is 05/16/2022 day Mon",
        date_format_23: "some 1605_2022 thing 08:23:53",
        date_format_3: "10-10-2020 00",
        date_format_4: "10-10-2020 01",
        date_format_5: "10OCTOBER2020",
        date_format_6: "00 Oct 0000",
        date_format_7: "10_10_123",
        date_format_8: "01:00 am, GMT+05:30",
        date_format_9: "10-10-2_T_23:59:59",
      },
      {
        _rowno: 11,
        date_format_1: "10/10/2020",
        date_format_10: "Tue, APR 26, 2022",
        date_format_11: "TUE, APRIL 26, 22021",
        date_format_12: "2020-10-10T23:59:59GMT+05:30",
        date_format_13: "2020-10-10T23:59:59GMT",
        date_format_14: "2020-10-10T23:59:59+05:30",
        date_format_15: "2020-10-10T23:59:59-08:00",
        date_format_16: "23:59 z",
        date_format_17: "23:59 UTC+05:30",
        date_format_18: "23:59 UTC",
        date_format_19: "23:59:59",
        date_format_2: "10/10/202",
        date_format_20: "Tuesday, APRIL 26, 2022",
        date_format_21: "TUE, APR 26, 22",
        date_format_22: "Todays date is 05/16/2022 day Monday",
        date_format_23: "some 1605_2022 thing 08:23:54",
        date_format_3: "10-10-2020",
        date_format_4: "10-10-2020 01:00",
        date_format_5: "OCTOBER",
        date_format_6: "10 OCT 2020",
        date_format_7: "10_10_1234",
        date_format_8: "00:00 am, UTC",
        date_format_9: "10-10-20_T_23:59:59",
      },
      {
        _rowno: 12,
        date_format_1: "10/10/20202",
        date_format_10: "TUE, Apr 26, 2022",
        date_format_11: "TUE, APRil 26, 2022",
        date_format_12: "2020-10-10T23:59:59UTC+05:30",
        date_format_13: "2020-10-10T23:59:59GMT+05:30",
        date_format_14: "2020-10-10T23:59:59GMT+05:30",
        date_format_15: "2020-10-10T23:59:59Z",
        date_format_16: "23:59 Z",
        date_format_17: "23:59 UTC",
        date_format_18: "23:59 -08:00",
        date_format_19: "23:59:59.1234",
        date_format_2: "10/10/20202",
        date_format_20: "Tuesday, APRIL 26, 2022",
        date_format_21: "Tuesday, APRIL 26, 2022",
        date_format_22: "Today's date is 05/16/20 day Monday",
        date_format_23: "some 1605_2022 thing 08:23:55",
        date_format_3: "10-10-2020 01:00",
        date_format_4: "10-10-2020 00:00:00",
        date_format_5: "10Oct",
        date_format_6: "OCTOBER",
        date_format_7: "10_10_12345",
        date_format_8: "00:00 pm, UTC",
        date_format_9: "10-10-202_T_23:59:59",
      },
      {
        _rowno: 13,
        date_format_1: "10/10/202002",
        date_format_10: "TUE, APR 26, 2022",
        date_format_11: "Tue, APR 26, 2022",
        date_format_12: "2020-10-10T23:59:59IST",
        date_format_13: "2020-10-10T23:59:59'Z'",
        date_format_14: "2020-10-10T23:59:59UTC+05:30",
        date_format_15: "2020-10-10T23:59:59+0000",
        date_format_16: "23:59 -0800",
        date_format_17: "23:59 GMT",
        date_format_18: "23:59 -0800",
        date_format_19: "23:59:59.12345",
        date_format_2: "10/10/202002",
        date_format_20: "Tuesday, APRIL 26, 2022",
        date_format_21: "TUE, APR 26, 20",
        date_format_22: "Today's date is 05/16/2022 day Mon",
        date_format_23: "some 1605_2022 thing 08:23:56",
        date_format_3: "10-10-2020 24:60:60",
        date_format_4: "10-10-2020 01:5:70",
        date_format_5: "00Oct0000",
        date_format_6: "10 Oct",
        date_format_7: "10_10_1234",
        date_format_8: "01:00 am, z",
        date_format_9: "10-10-20202_T_23:59:59",
      },
    ];
    // return apiResponse.successResponseWithData(
    //   res,
    //   "Issues columns retieved successfully",
    //   columns
    // );
  } catch (err) {
    const msg = err.message || COMMON_ERR;
    Logger.error("catch :getIssueColumns");
    Logger.error(msg);
    return apiResponse.ErrorResponse(res, msg);
  }
};
