const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");

async function checkNameExists(name, datasetid = null) {
  const mnemonic = name.toLowerCase();
  let searchQuery = `SELECT mnemonic from ${constants.DB_SCHEMA_NAME}.dataset where LOWER(mnemonic) = $1`;
  let dep = [mnemonic];
  if (datasetid) {
    searchQuery = `SELECT mnemonic from ${constants.DB_SCHEMA_NAME}.dataset where LOWER(mnemonic) = $1 and datasetid != $2`;
    dep = [mnemonic, datasetid];
  }
  const res = await DB.executeQuery(searchQuery, dep);
  return res.rowCount;
}

async function getLastVersion(datasetid) {
  const searchQuery = `SELECT version from ${constants.DB_SCHEMA_NAME}.dataset_history where datasetid = $1 order by updt_tm desc limit 1`;
  const res = await DB.executeQuery(searchQuery, [datasetid]);
  return res.rows[0].version;
}

async function saveSQLDataset(req, res, values, datasetId) {
  try {
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
    const searchQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.dataset (datasetid, mnemonic, active, datakindid, custm_sql_query, customsql, tbl_nm, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    Logger.info({
      message: "storeDataset",
    });
    DB.executeQuery(searchQuery, body).then(() => {
      const hisBody = [datasetId + 1, ...body, 1];
      const hisQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.dataset_history (dataset_vers_id,datasetid, mnemonic, active, datakindid, custm_sql_query, customsql, tbl_nm, insrt_tm, updt_tm, datapackageid, version) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
      DB.executeQuery(hisQuery, hisBody).then(() => {
        return apiResponse.successResponseWithData(res, "Operation success", {
          ...values,
          datasetId: datasetId,
        });
      });
    });
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
      values.headerRowNumber || null,
      values.footerRowNumber || null,
      values.active == true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      new Date(),
      new Date(),
      values.datapackageid || null,
    ];
    const searchQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.dataset (datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`;
    Logger.info({
      message: "storeDataset",
    });
    DB.executeQuery(searchQuery, body).then(() => {
      const hisBody = [datasetId + 1, ...body, 1];
      const hisQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.dataset_history (dataset_vers_id,datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm, datapackageid, version) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`;
      DB.executeQuery(hisQuery, hisBody).then(() => {
        return apiResponse.successResponseWithData(res, "Operation success", {
          ...values,
          datasetId: datasetId,
        });
      });
    });
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
    const isExist = await checkNameExists(values.datasetName, values.datasetid);
    if (isExist > 0) {
      return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }
    const version_no = await getLastVersion(values.datasetid);
    console.log(version_no, "bbb");
    const body = [
      values.datasetName || null,
      values.fileType || null,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber || null,
      values.footerRowNumber || null,
      values.active == true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      new Date(),
    ];
    const searchQuery = `UPDATE ${constants.DB_SCHEMA_NAME}.dataset set mnemonic = $1, type = $2, charset = $3, delimitier = $4, escapecode = $5, quote = $6, headerrownumber = $7, footerrownumber = $8, active = $9, naming_convention = $10, path = $11, datakindid = $12, data_freq = $13, ovrd_stale_alert = $14, rowdecreaseallowed = $15, updt_tm = $16 where datasetid = $17`;
    Logger.info({
      message: "storeDataset",
    });
    DB.executeQuery(searchQuery, [...body, values.datasetid]).then(() => {
      const hisBody = [
        values.datasetid + (version_no + 1),
        values.datasetid,
        ...body,
        version_no + 1,
        new Date(),
        values.datapackageid,
      ];
      const hisQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.dataset_history (dataset_vers_id, datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, updt_tm, version, insrt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`;
      DB.executeQuery(hisQuery, hisBody).then(() => {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          true
        );
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.saveDatasetColumns = async (req, res) => {
  try {
    const datasetid = req.params.datasetid;
    const values = req.body;
    const inserted = await values.map(async (value) => {
      const columnId = helper.generateUniqueID();
      const body = [
        columnId,
        value.variableLabel.trim() || null,
        datasetid,
        value.columnName.trim() || null,
        value.dataType.trim() || null,
        value.primary == "Yes" ? 1 : 0,
        value.required == "Yes" ? 1 : 0,
        value.unique == "Yes" ? 1 : 0,
        value.minLength.trim() || null,
        value.maxLength.trim() || null,
        value.position.trim() || null,
        value.format.trim() || null,
        value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
        new Date(),
        new Date(),
      ];
      const searchQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.columndefinition (columnid, "VARIABLE", datasetid, name, datatype, primarykey, required, "UNIQUE", charactermin, charactermax, position, "FORMAT", lov, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
      Logger.info({
        message: "storeDatasetColumns",
      });
      const inserted = await DB.executeQuery(searchQuery, body)
        .then(() => {
          const hisBody = [columnId + 1, 1, ...body];
          const hisQuery = `INSERT into ${constants.DB_SCHEMA_NAME}.columndefinition_history (col_def_version_id,version, columnid, "VARIABLE", datasetid, name, datatype, primarykey, required, "UNIQUE", charactermin, charactermax, position, "FORMAT", lov, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`;
          return DB.executeQuery(hisQuery, hisBody)
            .then(() => {
              return "SUCCESS";
            })
            .catch((err) => {
              console.log("innser err", err);
              return err.message;
            });
        })
        .catch((err) => {
          console.log("outer err", err);
          return err.message;
        });
      return inserted;
    });
    Promise.all(inserted).then((response) => {
      if (response[0] == "SUCCESS") {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          values
        );
      } else {
        return apiResponse.ErrorResponse(res, response[0]);
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :storeDatasetColumns");
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
    const q1 = `SELECT VERSION as "versionNo", EXT_RULEID as "ruleId", QC_TYPE as "type", RULEEXPR AS "ruleExp", RULESEQ as "ruleSeq", ACTION as "action", ERRORCODE as "emCode", ERRORMESSAGE as "errMsg" FROM IDP.DATASET_QC_RULES`;
    const { rows } = await dbconnection.execute(q1);
    return apiResponse.successResponseWithData(res, "Operation success", rows);
  } catch (error) {
    Logger.error("catch :getVLCData");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.getDatasetDetail = async (req, res) => {
  try {
    const datasetid = req.params.datasetid;
    const searchQuery = `SELECT datasetid, mnemonic, type, active, headerrownumber, footerrownumber, delimitier, escapecode, quote, datakindid, staledays, rowdecreaseallowed, charset, path, customsql, naming_convention, data_freq, ovrd_stale_alert from ${constants.DB_SCHEMA_NAME}.dataset WHERE datasetid = $1`;
    Logger.info({
      message: "datasetDetail",
    });
    DB.executeQuery(searchQuery, [datasetid]).then((response) => {
      const datasetDetail = response.rows[0] || null;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        datasetDetail
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :datasetDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatasetColumns = async (req, res) => {
  try {
    const datasetid = req.params.datasetid;
    const searchQuery = `SELECT "columnid", "VARIABLE", "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", "FORMAT", "lov", "UNIQUE" from ${constants.DB_SCHEMA_NAME}.columndefinition WHERE datasetid = $1`;
    Logger.info({
      message: "datasetColumns",
    });
    DB.executeQuery(searchQuery, [datasetid]).then((response) => {
      const datasetColumns = response.rows || null;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        datasetColumns
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :datasetColumns");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
