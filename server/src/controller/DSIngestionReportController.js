const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getDatasetIngestionReportProperties = (req, res) => {
  try {
    const id = req.params.datasetid;
    const searchQuery = `SELECT datasetid,"DatasetName","Vendor",vend_id,"VendorContactInformation","DateLastChecked","DateofLastSuccessfulProcess","ExpectedDateofNextTransfer","ExpectedTransferFrequency","LoadType", "SourceOrigin", dataflowid, "DataFlowName", datapackageid, "FileName", "DataPackageNamingConvention" from ${schemaName}.dataset_stat_current 
            WHERE datasetid = $1`;
    Logger.info({
      message: "getDatasetIngestionReportProperties",
    });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const records = response.rows[0] || [];
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
    const searchQuery = `SELECT "DatasetName", "Vendor", "TransferDate", "FileName", datasetname, "FileTransferStatus", "DownloadTime", "ProcessTime", "DownloadTransactions", "ProcessTransactions", "NewRecords", "ModifiedRecords", "DownloadDate", "ProcessDate", "LastCompleted", "LastAttempted", "LastLoadedDate", "PackageName", "ClinicalDataType", "DataSetMnemonic", "LoadType", "DownloadEndingOffsetValue", "DownloadStart", "ProcessStart", "SourceOrigin", "DataflowName", fst_prd_file_recvd from ${schemaName}.dataset_transfer_log 
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
    const searchQuery = `SELECT "DatasetName", "Vendor", "TransferDate", "FileName", datasetname, "FileTransferStatus", "DownloadTime", "ProcessTime", "DownloadTransactions", "ProcessTransactions", "NewRecords", "ModifiedRecords", "DownloadDate", "ProcessDate", "LastCompleted", "LastAttempted", "LastLoadedDate", "PackageName", "ClinicalDataType", "DataSetMnemonic", "LoadType", "DownloadEndingOffsetValue", "DownloadStart", "ProcessStart", "VendorContactInformation", "DateLastChecked", "DateofLastSuccessfulProcess", "ExpectedDateofNextTransfer", "ExpectedTransferFrequency", "SourceOrigin", "DataFlowName", "DataPackageNamingConvention", incincremental, postingestionissues, recordswithissues, total_records, incpostingestionissues, increcordswithissues, inctotal_records, inctotalincrementalfilestransferred, incfiles_not_ingested, incfileswithissues, inctotalfilesingested, fst_prd_file_recvd, dataflowid, datapackageid, datasetid from ${schemaName}.dataset_stat_current 
                WHERE datasetid = $1`;
    Logger.info({
      message: "getDatasetIngestionReportMetrics",
    });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
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
