const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;
const columnsMock = require("../../public/mock/listColumnsAPI.json");
const tablesMock = require("../../public/mock/listTablesAPIResponse.json");
const previewSQLMock = require("../../public/mock/responseBodyPreviewSQL.json");

async function checkNameExists(name, datasetid = null) {
  const mnemonic = name.toLowerCase();
  let searchQuery = `SELECT mnemonic from ${schemaName}.dataset where LOWER(mnemonic) = $1`;
  let dep = [mnemonic];
  if (datasetid) {
    searchQuery = `SELECT mnemonic from ${schemaName}.dataset where LOWER(mnemonic) = $1 and datasetid != $2`;
    dep = [mnemonic, datasetid];
  }
  const res = await DB.executeQuery(searchQuery, dep);
  return res.rowCount;
}

async function getLastVersion(datasetid) {
  const searchQuery = `SELECT version from ${schemaName}.dataset_history where datasetid = $1 order by updt_tm desc limit 1`;
  const res = await DB.executeQuery(searchQuery, [datasetid]);
  return res.rows[0].version;
}

async function saveSQLDataset(req, res, values, datasetId) {
  try {
    Logger.info({ message: "create Dataset" });
    const body = [
      datasetId,
      values.datasetName || null,
      values.active == true ? 1 : 0,
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.customSQLQuery || null,
      values.sQLQuery || null,
      values.tableName || null,
      new Date(),
      new Date(),
      values.datapackageid || null,
    ];
    const insertQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, active, datakindid, custm_sql_query, customsql, tbl_nm, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    await DB.executeQuery(insertQuery, body);
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
}

exports.saveDatasetData = async (req, res) => {
  try {
    const values = req.body;
    Logger.info({ message: "create Dataset" });
    const isExist = await checkNameExists(values.datasetName);
    if (isExist > 0) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }
    const datasetId = helper.generateUniqueID();
    if (values.locationType === "JDBC") {
      return saveSQLDataset(req, res, values, datasetId);
    }
    const body = [
      datasetId,
      values.datasetName || null,
      values.fileType || null,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber || 0,
      values.footerRowNumber || 0,
      values.active == true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      new Date(),
      new Date(),
      values.datapackageid,
    ];
    const searchQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, type, charset, delimiter, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`;

    const inset = await DB.executeQuery(searchQuery, body);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateDatasetData = async (req, res) => {
  try {
    const values = req.body;
    Logger.info({ message: "update Dataset" });
    const isExist = await checkNameExists(values.datasetName, values.datasetid);
    if (isExist > 0) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }
    const body = [
      values.datasetName,
      values.fileType || null,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber || 0,
      values.footerRowNumber || 0,
      values.active == true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.clinicalDataType,
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      new Date(),
    ];
    const searchQuery = `UPDATE ${schemaName}.dataset set mnemonic = $1, type = $2, charset = $3, delimiter = $4, escapecode = $5, quote = $6, headerrownumber = $7, footerrownumber = $8, active = $9, naming_convention = $10, path = $11, datakindid = $12, data_freq = $13, ovrd_stale_alert = $14, rowdecreaseallowed = $15, updt_tm = $16 where datasetid = $17`;

    const inset = await DB.executeQuery(searchQuery, [...body, values.datasetid]).then(() => {
      const hisBody = [
        values.datasetid + (version_no + 1),
        values.datasetid,
        ...body,
        version_no + 1,
        new Date(),
        values.datapackageid,
      ];
    });
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getVLCData = async (req, res) => {
  try {
    Logger.info({
      message: "getVLCData",
    });
    const dbconnection = await oracleDB();
    const q1 = `SELECT VERSION as "versionNo", EXT_RULEID as "ruleId", QC_TYPE as "type", RULEEXPR AS "ruleExp", RULESEQ as "ruleSeq", 
    "ACTION" as "action", ERRORCODE as "emCode", ERRORMESSAGE as "errMsg",
    CASE WHEN active_yn='Y' AND curr_rec_yn ='Y' THEN 'Active' ELSE 'Inactive' END as "status" FROM IDP.DATASET_QC_RULES`;
    const { rows } = await dbconnection.execute(q1);
    const uniqueIdAdded = rows.map((e, i) => {
      e.id = `id${i + 1}`;
      return e;
    });
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      uniqueIdAdded
    );
  } catch (error) {
    Logger.error("catch :getVLCData");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.getDatasetDetail = async (req, res) => {
  try {
    const datasetid = req.params.datasetid;
    const query = `SELECT * from ${schemaName}.dataset WHERE datasetid = $1`;
    Logger.info({ message: "getDatasetDetail" });
    const datasetDetail = await DB.executeQuery(query, [datasetid]);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      datasetDetail.rows[0]
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getDatasetDetail");
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.previewSQL = async (req, res) => {
  try {
    Logger.info({ message: "previewSQL" });

    const queryData = previewSQLMock.queryData;
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      queryData
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :previewSQL");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getTables = async (req, res) => {
  try {
    Logger.info({ message: "getTables" });
    const tableMetadataList = tablesMock.tableMetadataList;
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      tableMetadataList
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getTables");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getColumns = async (req, res) => {
  try {
    Logger.info({ message: "getColumns" });
    const columnInfo = columnsMock.columnInfo;
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      columnInfo
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getColumns");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
