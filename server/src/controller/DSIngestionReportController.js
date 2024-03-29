const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
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
    const searchQuery = `SELECT datasetid,"DatasetName","Vendor",vend_id,"VendorContactInformation","DateLastChecked","DateofLastSuccessfulProcess","ExpectedDateofNextTransfer","ExpectedTransferFrequency","LoadType", "SourceOrigin", dataflowid, "DataFlowName", datapackageid, "FileName", "DataPackageNamingConvention" from ${schemaName}.dataset_stat_current 
            WHERE datasetid = $1`;
    Logger.info({
      message: "getDatasetIngestionReportProperties",
    });

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
    const searchQuery = `SELECT "DatasetName", "Vendor", "TransferDate", "FileName", datasetname, "FileTransferStatus", "DownloadTime", "ProcessTime", "DownloadTransactions", "ProcessTransactions", "NewRecords", "ModifiedRecords", "DownloadDate", "ProcessDate", "LastCompleted", "LastAttempted", "LastLoadedDate", "PackageName", "ClinicalDataType", "DataSetMnemonic", "LoadType", "DownloadEndingOffsetValue", "DownloadStart", "ProcessStart", "SourceOrigin", dataflowid, "DataflowName", fst_prd_file_recvd from ${schemaName}.dataset_transfer_log 
              WHERE datasetid = $1`;
    Logger.info({
      message: "getDatasetIngestionReportTransferLog",
    });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const records = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records,
          totaSize: response.rowCount,
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
    const searchQuery = `SELECT "DatasetName", "Vendor", "TransferDate", "FileName", datasetname, "FileTransferStatus", "DownloadTime", "ProcessTime", "DownloadTransactions", "ProcessTransactions", "NewRecords", "ModifiedRecords", "DownloadDate", "ProcessDate", "LastCompleted", "LastAttempted", "LastLoadedDate", "PackageName", "ClinicalDataType", "DataSetMnemonic", "LoadType", "DownloadEndingOffsetValue", "DownloadStart", "ProcessStart", "VendorContactInformation", "DateLastChecked", "DateofLastSuccessfulProcess", "ExpectedDateofNextTransfer", "ExpectedTransferFrequency", "SourceOrigin", "DataFlowName", "DataPackageNamingConvention", incincremental, postingestionissues, recordswithissues, total_records, incpostingestionissues, increcordswithissues, inctotal_records, inctotalincrementalfilestransferred, incfiles_not_ingested, incfileswithissues, inctotalfilesingested, fst_prd_file_recvd, dataflowid, datapackageid, datasetid from ${schemaName}.dataset_stat_current 
                WHERE datasetid = $1`;
    Logger.info({
      message: "getDatasetIngestionReportMetrics",
    });

    DB.executeQuery(searchQuery, [id])
      .then(async (response) => {
        const records = response.rows[0] || [];
        let metrics = {};
        if (records && records.LoadType === "Incremental") {
          metrics = {
            loadType: records.LoadType,
            totalIncrementalFileTransferred:
              records.inctotalincrementalfilestransferred,
            postIngestionIssues: records.postingestionissues,
            recordsWithIssues: records.recordswithissues,
            totalRecords: records.total_records,
            filesNotIngested: records.incfiles_not_ingested,
            filesWithIssues: records.incfileswithissues,
            totalFileIngested: records.inctotalfilesingested,
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
    const searchQuery = `SELECT incdatasetid as datasetid, incremental, "incIngestionIssueType" as "incrementalIssueType", "incTotalNoOfIssuess" as "incrementalTotalIssues", "cumIngestionIssueType" as "cummulativeIssueType", "cumTotalNoOfIssuess" as "cummulativeTotalIssues" from ${schemaName}.dataset_issue_summary 
                WHERE incdatasetid = $1`;
    Logger.info({
      message: "getDatasetIssueTypes",
    });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const records = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records,
          totaSize: response.rowCount,
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
    const searchQuery = `SELECT dataflowid, executionid, "VERSION", datapackageid, datasetid, mnemonicfile, datapackagename, datasetname, datasettype, processtype, "user", downloadstatus, downloadstarttime, downloadendtime, processstatus, processstarttime, processendtime, downloadtrnx, processtrnx, filerpath, lastsucceeded, lastattempted, failurecat, refreshtimestamp, stage, fst_prd_file_recvd, deleted_records, modified_records, new_records from ${schemaName}.transaction_summary
              WHERE datasetid = $1 and lastattempted BETWEEN NOW() - INTERVAL '${dayFilter} days' AND NOW()`;
    Logger.info({
      message: "getFileTransferHistory",
    });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const records = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records,
          totaSize: response.rowCount,
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
