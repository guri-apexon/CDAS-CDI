const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getColumnsSet = async (req, res) => {
  try {
    const { datasetid } = req.body;
    Logger.info({ message: "getColumnsSet" });
    const searchQuery = `SELECT "columnid", variable, "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", format, "lov", "unique" from ${schemaName}.columndefinition WHERE datasetid = $1`;
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
    Logger.error("catch :getColumnsSet");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.saveDatasetColumns = async (req, res) => {
  try {
    const datasetid = req.params.datasetid;
    const values = req.body;
    const insertQuery = `INSERT into ${schemaName}.columndefinition (columnid, "VARIABLE", datasetid, name, position, datatype, primarykey, required, "UNIQUE", charactermin, charactermax, "FORMAT", lov, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
    Logger.info({ message: "storeDatasetColumns" });
    const curDate = helper.getCurrentTime();

    const inserted = await values.map(async (value) => {
      const columnId = helper.generateUniqueID();
      const body = [
        columnId,
        value.variableLabel.trim() || null,
        datasetid,
        value.columnName.trim() || null,
        value.position.trim() || null,
        value.dataType.trim() || null,
        value.primary == "Yes" ? 1 : 0,
        value.required == "Yes" ? 1 : 0,
        value.unique == "Yes" ? 1 : 0,
        value.minLength.trim() || null,
        value.maxLength.trim() || null,
        value.format.trim() || null,
        value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
        curDate,
        curDate,
      ];
      const insrted = await DB.executeQuery(insertQuery, body);
      return insrted;
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
    Logger.error("catch :storeDatasetColumns");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateColumns = async (req, res) => {
  try {
    const datasetid = req.params.datasetid;
    const values = req.body;
    Logger.info({ message: "update set columns" });
    const updateQuery = `UPDATE ${schemaName}.columndefinition "VARIABLE"=$2, datasetid=$3, name=$4, datatype=$5, primarykey=$6, required=$7, "UNIQUE"=$8, charactermin=$9, charactermax=$10, position=$11, "FORMAT"=$12, lov=$13, updt_tm=$14 WHERE columnid=$1`;
    const inserted = await values.map(async (value) => {
      const body = [
        value.columnId.trim(),
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
      ];
      const insrted = await DB.executeQuery(updateQuery, body);
      return insrted;
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
    Logger.error("catch :update set columns");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deleteColumns = async (req, res) => {
  try {
    const columnId = req.params.columnId;
    Logger.info({ message: "deleteColumns" });
    const updateQuery = `UPDATE ${schemaName}.columndefinition del_flg=1 WHERE columnid=$1`;

    DB.executeQuery(updateQuery, [columnId]).then((response) => {
      const datasetColumns = response.rows || null;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        datasetColumns
      );
    });
  } catch (err) {
    Logger.error("catch: deleteColumns");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
