const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const CommonController = require("./CommonController");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;
const curDate = helper.getCurrentTime();

exports.getColumnsSet = async (req, res) => {
  try {
    const { datasetid } = req.body;
    Logger.info({ message: "getColumnsSet" });
    const searchQuery = `SELECT "columnid", "variable", "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", "format", "lov", "unique" from ${schemaName}.columndefinition WHERE coalesce (del_flg,0) != 1 AND datasetid = $1`;
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
    const { dsId, dpId, dfId, isUpdateQuery, nQuery, userId, values } =
      req.body;

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery, curDate]);
    }

    const insertQuery = `INSERT into ${schemaName}.columndefinition (datasetid, columnid, "name", "datatype", primarykey, "required", "unique", charactermin, charactermax, "position", "format", lov, "variable", del_flg, insrt_tm, updt_tm)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15) RETURNING *;`;

    Logger.info({ message: "storeDatasetColumns" });

    const datasetColumns = [];

    if (values && values.length > 0) {
      for (let value of values) {
        const columnId = helper.generateUniqueID();
        const body = [
          dsId,
          columnId,
          value.columnName.trim() || null,
          value.dataType.trim() || null,
          value.primaryKey === "Yes" ? 1 : 0,
          value.required === "Yes" ? 1 : 0,
          value.unique === "Yes" ? 1 : 0,
          value.minLength || 0,
          value.maxLength || 0,
          value.position || 0,
          value.format || null,
          value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
          value.variableLabel.trim() || null,
          0,
          curDate,
        ];

        const inserted = await DB.executeQuery(insertQuery, body);
        datasetColumns.push({
          ...inserted.rows[0],
          frontendUniqueRef: value.uniqueId,
        });

        const jsonObj = { datasetid: dsId, columnId, ...value };
        const config_json = JSON.stringify(jsonObj);
        const attributeName = "New Column Definition ";

        // console.log(dfId, columnId);

        await CommonController.addColumnHistory(
          columnId,
          dsId,
          dfId,
          dpId,
          userId,
          config_json,
          attributeName
        );
      }

      return apiResponse.successResponseWithData(
        res,
        "Column Definition created Successfully",
        datasetColumns
      );
    }

    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    Logger.error("catch :storeDatasetColumns");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Column name should be unique for a dataset",
        "Operation failed"
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateColumns = async (req, res) => {
  try {
    const { dsId, dpId, dfId, isUpdateQuery, nQuery, userId, values } =
      req.body;

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery, curDate]);
    }

    Logger.info({ message: "update set columns" });

    const updateQuery = `UPDATE ${schemaName}.columndefinition
    SET "name"=$1, "datatype"=$2, primarykey=$3, "required"=$4, charactermin=$5, charactermax=$6, "position"=$7, "format"=$8, lov=$9, "unique"=$10, "variable"=$11, updt_tm=$12 WHERE datasetid=$13 AND columnid=$14`;
    const selectQuery = `SELECT "name", "datatype", primarykey, required, charactermin, charactermax, "position", format, lov, "unique", variable FROM ${schemaName}.columndefinition where columnid=$1`;

    if (values && values.length > 0) {
      for (let value of values) {
        const columnid = value.dbColumnId.trim();
        const tempData = await DB.executeQuery(selectQuery, [columnid]);
        const oldData = tempData?.rows[0];

        const body = [
          value.columnName.trim() || null,
          value.dataType.trim() || null,
          value.primaryKey === "Yes" ? 1 : 0,
          value.required === "Yes" ? 1 : 0,
          value.minLength || 0,
          value.maxLength || 0,
          value.position || 0,
          value.format.trim() || null,
          value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
          value.unique === "Yes" ? 1 : 0,
          value.variableLabel.trim() || null,
          curDate,
          dsId,
          columnid,
        ];

        await DB.executeQuery(updateQuery, body);

        const requestData = {
          variable: value.variableLabel.trim() || null,
          name: value.columnName.trim() || null,
          datatype: value.dataType.trim() || null,
          primarykey: value.primaryKey == "Yes" ? 1 : 0,
          required: value.required == "Yes" ? 1 : 0,
          unique: value.unique == "Yes" ? 1 : 0,
          charactermin: value.minLength || 0,
          charactermax: value.maxLength || 0,
          position: value.position || 0,
          format: value.format.trim() || null,
          lov: value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
        };

        const config_json = JSON.stringify(requestData);
        const diffObj = helper.getdiffKeys(requestData, oldData);

        // console.log(diffObj, dfId, columnid);

        if (Object.keys(diffObj).length != 0) {
          const historyVersion = await CommonController.addColumnHistory(
            value.dbColumnId.trim(),
            dsId,
            dfId,
            dpId,
            userId,
            config_json,
            null,
            oldData,
            diffObj
          );
          if (!historyVersion) throw new Error("History not updated");
        }
      }

      const datasetColumns = values;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        datasetColumns
      );
    }
    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    Logger.error("catch :update set columns");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Column name should be unique for a dataset",
        "Operation failed"
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deleteColumns = async (req, res) => {
  try {
    const { columnId, dsId, dfId, dpId, isUpdateQuery, nQuery, userId } =
      req.body;

    Logger.info({ message: "deleteColumns" });
    const updateQuery = `update ${schemaName}.columndefinition set del_flg = 1 where columnid = $1`;

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery, curDate]);
    }

    DB.executeQuery(updateQuery, [columnId]).then(async (response) => {
      const datasetColumns = response.rows || null;

      // console.log(dfId, columnId);
      const attributeName = "del_flg ";

      const historyVersion = await CommonController.addColumnHistory(
        columnId,
        dsId,
        dfId,
        dpId,
        userId,
        null,
        attributeName,
        0,
        1
      );
      if (!historyVersion) throw new Error("History not updated");

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

exports.lovUpdate = async (req, res) => {
  try {
    const { columnId, dsId, dpId, dfId, userId, lov } = req.body;

    Logger.info({ message: "lovUpdate" });
    const selectQuery = `SELECT  "lov" from ${schemaName}.columndefinition WHERE columnid = $1`;
    const updateQuery = `UPDATE ${schemaName}.columndefinition set lov=$2,updt_tm=$3 WHERE columnid=$1`;

    const lovData = await DB.executeQuery(selectQuery, [columnId]);
    const attributeName = "lov ";
    console.log(dfId, columnId);

    DB.executeQuery(updateQuery, [columnId, lov, new Date()]).then(
      async (response) => {
        const datasetColumns = response.rows || null;

        const historyVersion = await CommonController.addColumnHistory(
          columnId,
          dsId,
          dfId,
          dpId,
          userId,
          null,
          attributeName,
          lovData.rows[0].lov,
          lov
        );
        if (!historyVersion) throw new Error("History not updated");

        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          datasetColumns
        );
      }
    );
  } catch (err) {
    Logger.error("catch: lovUpdate");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Column name should be unique for a dataset",
        "Operation failed"
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};
