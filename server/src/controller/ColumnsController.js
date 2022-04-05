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
    const searchQuery = `SELECT "columnid", variable, "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", format, "lov", "unique" from ${schemaName}.columndefinition WHERE coalesce (del_flg,0) != 1 AND datasetid = $1`;
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
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=Now() where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery]);
    }

    const insertQuery = `INSERT into ${schemaName}.columndefinition (datasetid, columnid, "name", "datatype", primarykey, required, "unique", charactermin, charactermax, "position", format, lov, variable, del_flg, insrt_tm, updt_tm)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, Now(), Now());`;

    Logger.info({ message: "storeDatasetColumns" });

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
        ];

        await DB.executeQuery(insertQuery, body);

        const jsonObj = { datasetid: dsId, columnId, ...value };
        const config_json = JSON.stringify(jsonObj);
        await CommonController.addColumnHistory(
          columnId,
          dsId,
          dfId,
          dpId,
          userId,
          config_json,
          "New Entry "
        );
      }

      const datasetColumns = values;

      return apiResponse.successResponseWithData(
        res,
        "Column Defination created Successfully",
        datasetColumns
      );
    }

    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    Logger.error("catch :storeDatasetColumns");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateColumns = async (req, res) => {
  try {
    const { dsId, dpId, dfId, isUpdateQuery, nQuery, userId, values } =
      req.body;

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=Now() where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery]);
    }

    Logger.info({ message: "update set columns" });
    const updateQuery = `UPDATE ${schemaName}.columndefinition SET "variable"=$2, datasetid=$3, name=$4, datatype=$5, primarykey=$6, required=$7, "unique"=$8, charactermin=$9, charactermax=$10, "position"=$11, "format"=$12, lov=$13, updt_tm=$14 WHERE columnid=$1`;
    const selectQuery = `select datasetid,columnid, variable, name, datatype, primarykey, required, unique, charactermin, charactermax, position, format, lov from ${schemaName}.columndefinition where columnid=$1`;

    if (values && values.length > 0) {
      for (let value of values) {
        const body = [
          value.dbColumnId,
          value.variableLabel.trim() || null,
          dsId,
          value.columnName.trim() || null,
          value.dataType.trim(),
          value.primaryKey === "Yes" ? 1 : 0,
          value.required === "Yes" ? 1 : 0,
          value.unique === "Yes" ? 1 : 0,
          value.minLength,
          value.maxLength,
          value.position || 0,
          value.format.trim() || null,
          value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
          curDate,
        ];

        await DB.executeQuery(updateQuery, body);

        const requestData = {
          datasetid: dsId,
          columnid: value.columnId.trim(),
          variable: value.variableLabel.trim() || null,
          name: value.columnName.trim() || null,
          datatype: value.dataType.trim() || null,
          primarykey: value.primaryKey == "Yes" ? 1 : 0,
          required: value.required == "Yes" ? 1 : 0,
          unique: value.unique == "Yes" ? 1 : 0,
          charactermin: value.minLength.trim() || null,
          charactermax: value.maxLength.trim() || null,
          position: value.position.trim() || null,
          format: value.format.trim() || null,
          lov: value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
        };

        const config_json = JSON.stringify(requestData);

        const { rows: tempData } = await DB.executeQuery(selectQuery, [
          value.columnId.trim(),
        ]);
        const oldData = tempData[0];

        for (const key in requestData) {
          if (`${requestData[key]}` != oldData[key]) {
            if (oldData[key] != null) {
              const historyVersion = await CommonController.addColumnHistory(
                value.columnId.trim(),
                dsId,
                dfId,
                dpId,
                userId,
                config_json,
                key,
                oldData[key],
                `${requestData[key]}`
              );
              if (!historyVersion) throw new Error("History not updated");
            }
          }
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
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=Now() where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery]);
    }

    DB.executeQuery(updateQuery, [columnId]).then(async (response) => {
      const datasetColumns = response.rows || null;

      const historyVersion = await CommonController.addColumnHistory(
        columnId,
        dsId,
        dfId,
        dpId,
        userId,
        null,
        "del_flg ",
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
          "lov",
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
    return apiResponse.ErrorResponse(res, err);
  }
};
