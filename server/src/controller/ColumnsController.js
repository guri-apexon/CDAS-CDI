const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const CommonController = require("./CommonController");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getColumnsSet = async (req, res) => {
  try {
    const { datasetid } = req.body;
    Logger.info({ message: "getColumnsSet" });
    const searchQuery = `SELECT "columnid", "variable", "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", "format", "lov", "unique", insrt_tm from ${schemaName}.columndefinition WHERE coalesce (del_flg,0) != 1 AND datasetid = $1 ORDER BY insrt_tm`;
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
    const curDate = helper.getCurrentTime();

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery, curDate]);
    }

    const insertQuery = `INSERT into ${schemaName}.columndefinition (datasetid, columnid, "name", "datatype", primarykey, "required", "unique", charactermin, charactermax, "position", "format", lov, "variable", del_flg, insrt_tm)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`;

    Logger.info({ message: "storeDatasetColumns" });

    const datasetColumns = [];

    if (values?.length) {
      const configJsonArr = [];
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

        configJsonArr.push({ datasetid: dsId, columnId, ...value });
      }
      const historyVersion = await CommonController.addColumnHistory(
        dsId,
        dfId,
        dpId,
        userId,
        JSON.stringify(configJsonArr)
      );
      if (!historyVersion) throw new Error("History not updated");

      return apiResponse.successResponseWithData(
        res,
        "Column Definition created Successfully",
        datasetColumns
      );
    }

    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    console.log("err", err);
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
    const curDate = helper.getCurrentTime();

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery, curDate]);
    }

    Logger.info({ message: "update set columns" });

    if (values?.length) {
      const updateQuery = `UPDATE ${schemaName}.columndefinition
      SET "name"=$1, "datatype"=$2, primarykey=$3, "required"=$4, charactermin=$5, charactermax=$6, "position"=$7, "format"=$8, lov=$9, "unique"=$10, "variable"=$11, updt_tm=$12 WHERE datasetid=$13 AND columnid=$14`;
      const selectQuery = `SELECT "name", "datatype", primarykey, required, charactermin, charactermax, "position", format, lov, "unique", variable FROM ${schemaName}.columndefinition where columnid=$1`;
      const diffValuesObj = {};
      const oldDataObj = {};
      const configJson = [];
      for (let value of values) {
        const columnid = value.dbColumnId.trim();
        if (columnid) {
          const {
            rows: [oldData],
          } = await DB.executeQuery(selectQuery, [columnid]);

          if (oldData) {
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
            const diffObj = helper.getdiffKeys(requestData, oldData);
            if (diffObj && Object.keys(diffObj).length) {
              diffValuesObj[columnid] = diffObj;
              oldDataObj[columnid] = oldData;
              configJson.push(requestData);
            }
          }
        }
      }

      if (Object.keys(diffValuesObj).length) {
        const historyVersion = await CommonController.addColumnHistory(
          dsId,
          dfId,
          dpId,
          userId,
          JSON.stringify(configJson),
          oldDataObj,
          diffValuesObj
        );
        if (!historyVersion) throw new Error("History not updated");
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
    const curDate = helper.getCurrentTime();

    Logger.info({ message: "deleteColumns" });
    const updateQuery = `update ${schemaName}.columndefinition set del_flg = 1 where columnid = $1 returning *;`;

    if (isUpdateQuery) {
      const update = `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`;
      await DB.executeQuery(update, [dsId, nQuery, curDate]);
    }

    DB.executeQuery(updateQuery, [columnId]).then(async (response) => {
      const datasetColumns = response.rows || null;
      const configJson = datasetColumns ? datasetColumns[0] : null;

      const historyVersion = await CommonController.addColumnHistory(
        dsId,
        dfId,
        dpId,
        userId,
        JSON.stringify(configJson),
        { [columnId]: { del_flg: 0 } },
        { [columnId]: { del_flg: 1 } }
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
