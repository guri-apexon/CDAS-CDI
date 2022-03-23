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

async function checkNameExists(
  name,
  datapackageid,
  testflag,
  datasetid = null
) {
  let searchQuery = `select d3.mnemonic from ${schemaName}.study s right join ${schemaName}.dataflow d on s.prot_id = d.prot_id right join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid right join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where d2.datapackageid=$1 and d.testflag=$2`;
  let dep = [datapackageid, testflag];
  if (datasetid) {
    searchQuery = `select d3.mnemonic from ${schemaName}.study s right join ${schemaName}.dataflow d on s.prot_id = d.prot_id right join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid right join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where d2.datapackageid=$1 and d.testflag=$2 and d3.datasetid !=$3`;
    dep = [datapackageid, testflag, datasetid];
  }
  const res = await DB.executeQuery(searchQuery, dep);
  return res.rows.includes(name);
}

async function saveSQLDataset(req, res, values, datasetId) {
  try {
    Logger.info({ message: "create SQL Dataset" });
    const body = [
      datasetId,
      values.datasetName,
      values.active === true ? 1 : 0,
      values.clinicalDataType[0] ? values.clinicalDataType[0] : null,
      values.customSQLQuery,
      values.sQLQuery || null,
      values.dataType == "Incremental" ? "Y" : "N" || null,
      values.tableName || null,
      values.offsetColumn || null,
      values.filterCondition || null,
      helper.getCurrentTime(),
      helper.getCurrentTime(),
      values.datapackageid,
    ];
    const insertQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, active, datakindid, customsql_yn, customsql, incremental, tbl_nm, offsetcolumn, offset_val, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
    const data = await DB.executeQuery(insertQuery, body);
    return apiResponse.successResponseWithData(res, "Operation success", data);
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
    const { datapackageid, selectedDFId, filePwd } = req.body;
    const isExist = await checkNameExists(
      values.datasetName,
      datapackageid,
      values.dfTestFlag
    );

    if (isExist) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }

    const datasetId = helper.generateUniqueID();
    if (values.locationType.toLowerCase() === "jdbc") {
      return saveSQLDataset(req, res, values, datasetId);
    }

    let passwordStatus;

    if (filePwd) {
      passwordStatus = "Yes";
      await helper.writeVaultData(
        `${selectedDFId}/${datapackageid}/${datasetId}`,
        {
          password: filePwd,
        }
      );
    } else {
      passwordStatus = "No";
    }

    Logger.info({ message: "create Dataset" });
    const insertQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, type, charset, delimiter, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, file_pwd, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm, datapackageid, incremental) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`;

    const body = [
      datasetId,
      values.datasetName,
      values.fileType,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber || 0,
      values.footerRowNumber || 0,
      values.active === true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      passwordStatus,
      values.clinicalDataType[0],
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      helper.getCurrentTime(),
      helper.getCurrentTime(),
      values.datapackageid,
      values.loadType == "Incremental" ? "Y" : "N",
    ];
    const inset = await DB.executeQuery(insertQuery, body);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

async function updateSQLDataset(req, res, values) {
  try {
    Logger.info({ message: "update SQL Dataset" });
    const body = [
      values.datasetName,
      values.active === true ? 1 : 0,
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.customSQLQuery || null,
      values.sQLQuery || null,
      values.tableName || null,
      values.filterCondition || null,
      values.dataType == "Incremental" ? "Y" : "N" || null,
      values.offsetColumn || null,
      new Date(),
      values.datasetid,
    ];
    const insertQuery = `UPDATE into ${schemaName}.dataset set mnemonic = $1, active = $2, datakindid = $3, customsql_yn = $4, customsql =$5, tbl_nm = $6, offset_val = $7, offsetcolumn = $8, incremental = $9, updt_tm = $10 where datasetid = $11`;
    const data = await DB.executeQuery(insertQuery, body);
    return apiResponse.successResponseWithData(res, "Operation success", data);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :update SQL Dataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
}

exports.updateDatasetData = async (req, res) => {
  try {
    const values = req.body;
    Logger.info({ message: "update Dataset" });
    const { selectedDFId, datapackageid, datasetid, filePwd } = req.body;
    const isExist = await checkNameExists(
      values.datasetName,
      datapackageid,
      values.dfTestFlag,
      datasetid
    );
    let passwordStatus;
    const updateQuery = `UPDATE ${schemaName}.dataset set mnemonic = $1, type = $2, charset = $3, delimiter = $4, escapecode = $5, quote = $6, headerrownumber = $7, footerrownumber = $8, active = $9, naming_convention = $10, path = $11, datakindid = $12, data_freq = $13, ovrd_stale_alert = $14, rowdecreaseallowed = $15, updt_tm = $16, incremental = $17, file_pwd = $18 where datasetid = $19`;
    if (isExist) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }

    if (values.locationType.toLowerCase() === "jdbc") {
      return updateSQLDataset(req, res, values);
    }

    if (filePwd) {
      passwordStatus = "Yes";
      await helper.writeVaultData(
        `${selectedDFId}/${datapackageid}/${datasetid}`,
        {
          password: filePwd,
        }
      );
    } else {
      passwordStatus = "No";
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
      values.loadType == "Incremental" ? "Y" : "N",
      passwordStatus,
    ];
    const inset = await DB.executeQuery(updateQuery, [
      ...body,
      values.datasetid,
    ]);
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
    const { selectedDFId, datapackageid } = req.body;
    Logger.info({ message: "getDatasetDetail" });
    const query = `SELECT * from ${schemaName}.dataset WHERE datasetid = $1`;
    const datasetDetail = await DB.executeQuery(query, [datasetid]);
    const ds = datasetDetail.rows[0];
    if (ds.file_pwd === "Yes") {
      ds.password = await helper.readVaultData(
        `${selectedDFId}/${datapackageid}/${datasetid}`
      );
    }
    return apiResponse.successResponseWithData(res, "Operation success", ds);
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
