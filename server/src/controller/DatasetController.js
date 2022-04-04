const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;
const columnsMock = require("../../public/mock/listColumnsAPI.json");
const tablesMock = require("../../public/mock/listTablesAPIResponse.json");
const previewSQLMock = require("../../public/mock/responseBodyPreviewSQL.json");
const CommonController = require("./CommonController");

async function checkMnemonicExists(name, studyId, testFlag, dsId = null) {
  let searchQuery = `select distinct d3.mnemonic from ${schemaName}.study s left join ${schemaName}.dataflow d on s.prot_id = d.prot_id left join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid left join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where s.prot_id=$1 and d.testflag=$2`;
  let dep = [studyId, testFlag];
  if (dsId) {
    searchQuery = `select d3.mnemonic from ${schemaName}.study s left join ${schemaName}.dataflow d on s.prot_id = d.prot_id left join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid left join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where s.prot_id=$1 and d.testflag=$2 and d3.datasetid != $3`;
    dep = [studyId, testFlag, dsId];
  }
  const { rows } = await DB.executeQuery(searchQuery, dep);
  const result = await rows.map((e) => e.mnemonic).includes(name);
  return result;
}

async function saveSQLDataset(req, res, values, datasetId, dpId, userId, dfId) {
  try {
    Logger.info({ message: "create SQL Dataset" });
    const body = [
      datasetId,
      values.datasetName,
      values.active === true ? 1 : 0,
      values.clinicalDataType[0] ? values.clinicalDataType[0] : null,
      values.isCustomSQL,
      values.sQLQuery || null,
      values.dataType == "Incremental" ? "Y" : "N" || null,
      values.tableName || null,
      values.offsetColumn || null,
      values.filterCondition || null,
      helper.getCurrentTime(),
      helper.getCurrentTime(),
      dpId,
    ];

    const conf_Data = {
      datasetId: datasetId,
      datapackageid: dpId,
      mnemonic: values.datasetName,
      active: values.active === true ? 1 : 0,
      datakindid: values.clinicalDataType[0]
        ? values.clinicalDataType[0]
        : null,
      customsql_yn: values.isCustomSQL,
      customsql: values.sQLQuery || null,
      incremental: values.dataType == "Incremental" ? "Y" : "N" || null,
      tbl_nm: values.tableName || null,
      offsetcolumn: values.offsetColumn || null,
      offset_val: values.filterCondition || null,
    };

    const jsonData = JSON.stringify(conf_Data);

    const insertQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, active, datakindid, customsql_yn, customsql, incremental, tbl_nm, offsetcolumn, offset_val, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning *`;
    const data = await DB.executeQuery(insertQuery, body);

    const historyVersion = await CommonController.addDatasetHistory(
      dfId,
      userId,
      dpId,
      datasetId,
      jsonData,
      "New Entry"
    );
    if (!historyVersion) throw new Error("History not updated");

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      data.rows[0]
    );
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
    const { dpId, studyId, dfId, testFlag, userId } = req.body;
    const isExist = await checkMnemonicExists(
      values.datasetName,
      studyId,
      testFlag
    );

    if (isExist) {
      return apiResponse.ErrorResponse(
        res,
        `Mnemonic ${values.datasetName} is not unique.`
      );
    }

    const datasetId = helper.generateUniqueID();
    if (values.locationType.toLowerCase() === "jdbc") {
      return saveSQLDataset(req, res, values, datasetId, dpId, userId, dfId);
    }

    let passwordStatus = "No";

    if (values.filePwd) {
      passwordStatus = "Yes";
      await helper.writeVaultData(`${dfId}/${dpId}/${datasetId}`, {
        password: filePwd,
      });
    }

    Logger.info({ message: "create Dataset" });
    const insertQuery = `INSERT into ${schemaName}.dataset (datasetid, mnemonic, type, charset, delimiter, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path,file_pwd, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm, datapackageid, incremental) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, Now(), Now(), $18, $19) returning *`;

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
      dpId,
      values.loadType == "Incremental" ? "Y" : "N",
    ];

    const conf_Data = {
      datasetId: datasetId,
      datapackageid: dpId,
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

    DB.executeQuery(insertQuery, body).then(async (response) => {
      const historyVersion = await CommonController.addDatasetHistory(
        dfId,
        userId,
        dpId,
        datasetId,
        jsonData,
        "New Entry"
      );
      if (!historyVersion) throw new Error("History not updated");
      return apiResponse.successResponseWithData(
        res,
        "Created Successfully",
        response.rows[0]
      );
    });
  } catch (err) {
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

async function updateSQLDataset(
  req,
  res,
  values,
  dfId,
  userId,
  dpId,
  datasetid
) {
  try {
    Logger.info({ message: "update SQL Dataset" });
    const body = [
      values.datasetName,
      values.active === true ? 1 : 0,
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.isCustomSQL || null,
      values.sQLQuery || null,
      values.tableName || null,
      values.filterCondition || null,
      values.dataType == "Incremental" ? "Y" : "N" || null,
      values.offsetColumn || null,
      new Date(),
      values.datasetid,
    ];
    const selectQuery = `select datasetid, datapackageid, mnemonic, active, datakindid, customsql_yn, customsql, tbl_nm, 
                          offset_val, offsetcolumn, incremental from ${schemaName}.dataset where datasetid = $1`;

    const insertQuery = `UPDATE into ${schemaName}.dataset set mnemonic = $1, active = $2, datakindid = $3, customsql_yn = $4, customsql =$5, tbl_nm = $6, offset_val = $7, offsetcolumn = $8, incremental = $9, updt_tm = $10 where datasetid = $11`;

    const requestData = {
      datasetid: datasetid,
      datapackageid: dpId,
      mnemonic: values.datasetName,
      active: true ? 1 : 0,
      datakindid: values.clinicalDataType ? values.clinicalDataType[0] : null,
      customsql_yn: values.isCustomSQL || null,
      customsql: values.sQLQuery || null,
      tbl_nm: values.tableName || null,
      offset_val: values.filterCondition || null,
      offsetcolumn: values.offsetColumn || null,
      incremental: values.dataType == "Incremental" ? "Y" : "N" || null,
    };

    const jsonData = JSON.stringify(requestData);

    const { rows: tempData } = await DB.executeQuery(selectQuery, [datasetid]);
    const oldData = tempData[0];

    for (const key in requestData) {
      if (`${requestData[key]}` != oldData[key]) {
        if (oldData[key] != null) {
          const historyVersion = await CommonController.addDatasetHistory(
            dfId,
            userId,
            dpId,
            datasetid,
            jsonData,
            key,
            oldData[key],
            `${requestData[key]}`
          );
          if (!historyVersion) throw new Error("History not updated");
        }
      }
    }

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
    const { dfId, studyId, dpId, testFlag, datasetid, userId } = req.body;
    const isExist = await checkMnemonicExists(
      values.datasetName,
      studyId,
      testFlag,
      datasetid
    );
    const selectQuery = `select datasetid, datapackageid, mnemonic, type, charset, delimiter , escapecode, quote,
                         headerrownumber, footerrownumber, active, naming_convention, path, 
                         datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, 
                         incremental from ${schemaName}.dataset where datasetid = $1`;

    const updateQuery = `UPDATE ${schemaName}.dataset set mnemonic = $1, type = $2, charset = $3, delimiter = $4, escapecode = $5, quote = $6, headerrownumber = $7, footerrownumber = $8, active = $9, naming_convention = $10, path = $11, datakindid = $12, data_freq = $13, ovrd_stale_alert = $14, rowdecreaseallowed = $15, updt_tm = $16, incremental = $17, file_pwd = $18 where datasetid = $19`;
    if (isExist) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }

    if (values.locationType.toLowerCase() === "jdbc") {
      return updateSQLDataset(req, res, values, dfId, userId, dpId, datasetid);
    }

    var requestData = {
      datasetid: datasetid,
      datapackageid: dpId,
      mnemonic: values.datasetName,
      type: values.fileType || null,
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

    const jsonData = JSON.stringify(requestData);

    const { rows: tempData } = await DB.executeQuery(selectQuery, [datasetid]);
    const oldData = tempData[0];

    for (const key in requestData) {
      if (`${requestData[key]}` != oldData[key]) {
        if (oldData[key] != null) {
          const historyVersion = await CommonController.addDatasetHistory(
            dfId,
            userId,
            dpId,
            datasetid,
            jsonData,
            key,
            oldData[key],
            `${requestData[key]}`
          );
          if (!historyVersion) throw new Error("History not updated");
        }
      }
    }

    let passwordStatus = "No";

    if (values.filePwd) {
      passwordStatus = "Yes";
      await helper.writeVaultData(`${dfId}/${dpId}/${datasetid}`, {
        password: values.filePwd,
      });
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
      values.active === true ? 1 : 0,
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
    Logger.info({ message: "getVLCData" });
    const q1 = `SELECT dv.df_vers_id as "versionNo", ext_ruleid as "ruleId", qc_type as "type", ruleexpr AS "ruleExp", ruleseq as "ruleSeq", "action", errorcode as "emCode", errormessage as "errMsg",
    CASE WHEN active_yn='Y' AND curr_rec_yn ='Y' THEN 'Active' ELSE 'Inactive' END as "status" FROM ${schemaName}.dataset_qc_rules dqr inner join ${schemaName}.dataflow_version dv on dqr.dataflowid = dv.dataflowid`;
    const { rows } = await DB.executeQuery(q1);
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
    const { dfId, dpId, dsId } = req.body;
    const query = `SELECT * from ${schemaName}.dataset WHERE datasetid = $1`;
    Logger.info({ message: "getDatasetDetail" });
    const datasetDetail = await DB.executeQuery(query, [dsId]);

    if (datasetDetail.rows[0].file_pwd === "Yes") {
      const filePwd = helper.readVaultData(`${dfId}/${dpId}/${dsId}`);
      if (filePwd) {
        datasetDetail.rows[0].file_pwd = filePwd.password;
      }
    }
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
