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
    const searchQuery = `SELECT "columnid", "VARIABLE", "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", "FORMAT", "lov", "UNIQUE" from ${schemaName}.columndefinition WHERE datasetid = $1`;
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
    const insertQuery = `INSERT into ${schemaName}.columndefinition (columnid, "VARIABLE", datasetid, name, datatype, primarykey, required, "UNIQUE", charactermin, charactermax, position, "FORMAT", lov, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
    const inserted = await values.map(async (value) => {
      const columnId = helper.generateUniqueID();
      Logger.info({
        message: "storeDatasetColumns",
      });
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
      const inserted = await DB.executeQuery(insertQuery, body);
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
    Logger.error("catch :storeDatasetColumns");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
