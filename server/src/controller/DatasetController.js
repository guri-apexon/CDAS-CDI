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
const CommonController = require("./CommonController");

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
    const { datapackageid, dfId, filePwd, testFlag } = req.body;
    const isExist = await CommonController.checkMnemonicExists(
      values.datasetName,
      datapackageid,
      testFlag
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
      await helper.writeVaultData(`${dfId}/${datapackageid}/${datasetId}`, {
        password: filePwd,
      });
    } else {
      passwordStatus = "No";
    }

    Logger.info({ message: "create Dataset" });
    const insertQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, type, charset, delimiter, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path,file_pwd, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm, datapackageid, incremental) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`;
    const packageQuery = `select dataflowid from ${schemaName}.datapackage WHERE datapackageid = $1`;

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

    const conf_Data = {
      datasetId: datasetId,
      datapackageid: values.datapackageid,
      mnemonic: values.datasetName,
      type: values.fileType,
      charset: values.encoding || null,
      delimiter: values.delimiter || null,
      escapecode: values.escapeCharacter || null,
      quote: values.quote || null,
      headerrownumber: values.headerRowNumber || 0,
      footerrownumber: values.footerRowNumber || 0,
      active: true ? 1 : 0,
      naming_convention: values.fileNamingConvention || null,
      path: values.folderPath || null,
      datakindid: values.clinicalDataType[0],
      data_freq: values.transferFrequency || null,
      ovrd_stale_alert: values.overrideStaleAlert || null,
      rowdecreaseallowed: values.rowDecreaseAllowed || 0,
      incremental: "Incremental" ? "Y" : "N",
    };

    const jsonData = JSON.stringify(conf_Data);

    const packageData = await DB.executeQuery(packageQuery, [
      values.datapackageid,
    ]);

    // const historyVersion = await CommonController.addHistory(
    //   datasetId,
    //   user_id,
    //   "New Entry"
    // );
    // if (!historyVersion) throw new Error("History not updated");

    DB.executeQuery(insertQuery, body).then(async (response) => {
      const package = response.rows[0] || [];
      const historyVersion = await CommonController.addDatasetHistory(
        values,
        jsonData,
        packageData.rows[0].dataflowid,
        "New Entry"
      );
      if (!historyVersion) throw new Error("History not updated");
      return apiResponse.successResponseWithData(
        res,
        "Created Successfully",
        {}
      );
    });
    // const inset = await DB.executeQuery(insertQuery, body);
    // return apiResponse.successResponseWithData(res, "Operation success", inset);
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
    // console.log(values);

    Logger.info({ message: "update Dataset" });
    const { dfId, datapackageid, testFlag, datasetid, filePwd } = req.body;
    const isExist = await CommonController.checkMnemonicExists(
      values.datasetName,
      datapackageid,
      testFlag,
      datasetid
    );
    const selectQuery = `select  mnemonic, type, charset, delimiter , escapecode, quote,
                         headerrownumber, footerrownumber, active, naming_convention, path, 
                         datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, 
                         incremental from ${schemaName}.dataset where datasetid = $1`;

    const packageQuery = `select dataflowid from ${schemaName}.datapackage WHERE datapackageid = $1`;

    let passwordStatus;
    const updateQuery = `UPDATE ${schemaName}.dataset set mnemonic = $1, type = $2, charset = $3, delimiter = $4, escapecode = $5, quote = $6, headerrownumber = $7, footerrownumber = $8, active = $9, naming_convention = $10, path = $11, datakindid = $12, data_freq = $13, ovrd_stale_alert = $14, rowdecreaseallowed = $15, updt_tm = $16, incremental = $17, file_pwd = $18 where datasetid = $19`;
    if (isExist) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }

    if (values.locationType.toLowerCase() === "jdbc") {
      return updateSQLDataset(req, res, values);
    }

    const requestData = {
      mnemonic: values.datasetName,
      type: values.fileType,
      charset: values.encoding,
      delimiter: values.delimiter,
      escapecode: values.escapeCharacter,
      quote: values.quote,
      headerrownumber: values.headerRowNumber,
      footerrownumber: values.footerRowNumber,
      active: true ? 1 : 0,
      naming_convention: values.fileNamingConvention,
      path: values.folderPath,
      datakindid: values.clinicalDataType[0],
      data_freq: values.transferFrequency,
      ovrd_stale_alert: values.overrideStaleAlert,
      rowdecreaseallowed: values.rowDecreaseAllowed,
      incremental: "Incremental" ? "Y" : "N",
    };

    const jsonObj = requestData;
    jsonObj["datasetid"] = values.datasetid;
    jsonObj["datapackageid"] = values.datapackageid;

    // const confData2 = Object.entries(jsonObj);
    // // const conData = confData2.reverse();
    // const confData = Object.fromEntries(confData2.reverse());
    const jsonData = JSON.stringify(jsonObj);
    // {
    //   datasetid: values.datasetid,
    //   datapackageid: values.datapackageid,
    // };

    // const conf_data = dataSetId.jsonData.push();

    const packageData = await DB.executeQuery(packageQuery, [
      values.datapackageid,
    ]);

    const { rows: tempData } = await DB.executeQuery(selectQuery, [
      values.datasetid,
    ]);
    const oldData = tempData[0];

    const updatedColumn = {};
    // Object.keys(requestData)

    for (const key in requestData) {
      if (`${requestData[key]}` != oldData[key]) {
        if (oldData[key] != null) {
          const historyVersion = await CommonController.addDatasetHistory(
            values,
            jsonData,
            packageData.rows[0].dataflowid,
            key,
            oldData[key],
            `${requestData[key]}`
          );
          if (!historyVersion) throw new Error("History not updated");
        }
      }
    }
    if (filePwd) {
      passwordStatus = "Yes";
      await helper.writeVaultData(`${dfId}/${datapackageid}/${datasetid}`, {
        password: filePwd,
      });
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
      values.clinicalDataType[0],
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
    const { datasetid } = req.body;
    const query = `SELECT * from ${schemaName}.dataset WHERE datasetid = $1`;
    Logger.info({ message: "getDatasetDetail" });
    const datasetDetail = await DB.executeQuery(query, [datasetid]);

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      datasetDetail.rows[0]
    );
  } catch (err) {
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
