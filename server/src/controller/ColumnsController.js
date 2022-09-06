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
    const searchQuery = `SELECT "columnid", "variable", "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", "format", "lov", "unique", columnid from ${schemaName}.columndefinition WHERE coalesce (del_flg,0) != 1 AND datasetid = $1 ORDER BY columnid`;
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
    Logger.error(err.message);

    return apiResponse.ErrorResponse(res, err.message);
  }
};

const updateSqlQuery = async (datasetId, del = false) => {
  try {
    const {
      rows: [dataset],
    } = await DB.executeQuery(
      `select * from ${schemaName}.dataset where datasetid=$1`,
      [datasetId]
    );
    const curDate = helper.getCurrentTime();
    if (dataset.customsql_yn === "No") {
      const { rows: CDList } = await DB.executeQuery(
        `select name from ${schemaName}.columndefinition where datasetid=$1 and (del_flg is distinct from '1');`,
        [datasetId]
      );
      let newQuery = dataset.customsql || "where 1=1";
      // const columnNames = CDList?.map((x) => x.name).join(", ") || "";
      const columnNames = CDList?.map((x) => `"${x.name}"`).join(", ") || "";

      const whereCondition = newQuery.split("where")?.pop()?.trim();
      newQuery = `Select ${columnNames} from ${
        dataset.tbl_nm || ""
      } where ${whereCondition}`;
      await DB.executeQuery(
        `update ${schemaName}.dataset set customsql=$2, updt_tm=$3 where datasetid=$1`,
        [datasetId, newQuery, curDate]
      );
    }
    return true;
  } catch (err) {
    return false;
  }
};

exports.saveDatasetColumns = async (req, res) => {
  try {
    const { dsId, dpId, dfId, userId, values, versionFreezed } = req.body;
    if (!dsId) {
      return apiResponse.ErrorResponse(res, "Please pass dataset id");
    }

    // flag for checking if existing data needs to be override
    const isOverride = req.body.isOverride || false;

    const curDate = helper.getCurrentTime();

    // const versionFreezed = false;

    const cdUid = [];

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
    );

    const insertQuery = `INSERT into ${schemaName}.columndefinition (datasetid, "name", "datatype", primarykey, "required", "unique", charactermin, charactermax, "position", "format", lov, "variable", del_flg, insrt_tm)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`;

    Logger.info({ message: "storeDatasetColumns" });

    const datasetColumns = [];

    if (values?.length) {
      // set existing data delete flag in case of override
      if (isOverride) {
        const response = await this.overrideDatasetColumns(req, res);
        if (response !== true) {
          return apiResponse.ErrorResponse(
            res,
            "Error in overriding existing data"
          );
        }
      }

      const configJsonArr = [];
      for (let value of values) {
        const body = [
          dsId,
          value.columnName.toString().trim() || null,
          value.dataType.trim() || null,
          value.primaryKey === "Yes" ? 1 : 0,
          value.required === "Yes" ? 1 : 0,
          value.unique === "Yes" ? 1 : 0,
          value.minLength || 0,
          value.maxLength || 0,
          value.position || 0,
          value.format.toString().trim() || null,
          value.values
            .toString()
            .trim()
            .replace(/(^\~+|\~+$)/, "") || null,
          value.variableLabel.toString().trim() || null,
          0,
          curDate,
        ];

        const {
          rows: [columnObj],
        } = await DB.executeQuery(insertQuery, body);
        datasetColumns.push({
          ...columnObj,
          frontendUniqueRef: value.uniqueId,
        });

        cdUid.push(columnObj.columnid);
        configJsonArr.push({
          datasetid: dsId,
          columnid: columnObj.columnid,
          ...value,
        });
      }

      await updateSqlQuery(dsId);
      const historyVersion = await CommonController.addColumnHistory(
        dsId,
        dfId,
        dpId,
        userId,
        JSON.stringify(configJsonArr),
        null,
        null,
        versionFreezed,
        cdUid
        // CDVersionBump
      );
      if (!historyVersion) throw new Error("History not updated");

      var resData = { ...datasetColumns, version: historyVersion };
      if (oldVersion?.version === historyVersion) {
        resData.versionBumped = false;
      } else {
        resData.versionBumped = true;
      }

      return apiResponse.successResponseWithData(
        res,
        "Column definition created successfully",
        resData
      );
    }

    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    const msg = err.message || "Something went wrong";
    console.log("err", msg);
    Logger.error("catch :storeDatasetColumns");
    Logger.error(msg);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Column name should be unique for a dataset",
        "Operation failed"
      );
    }
    return apiResponse.ErrorResponse(res, msg);
  }
};

exports.updateColumns = async (req, res) => {
  try {
    const { dsId, dpId, dfId, userId, values, versionFreezed } = req.body;
    const curDate = helper.getCurrentTime();

    Logger.info({ message: "update set columns" });
    // const versionFreezed = false;

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
    );

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
              value.columnName.toString().trim() || null,
              value.dataType.trim() || null,
              value.primaryKey === "Yes" ? 1 : 0,
              value.required === "Yes" ? 1 : 0,
              value.minLength || 0,
              value.maxLength || 0,
              value.position || 0,
              value.format.toString().trim() || null,
              value.values.trim().replace(/(^\~+|\~+$)/, "") || null,
              value.unique === "Yes" ? 1 : 0,
              value.variableLabel.toString().trim() || null,
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
      await updateSqlQuery(dsId);
      // let versionBumped = false;
      let newVersion = null;
      if (Object.keys(diffValuesObj).length) {
        const historyVersion = await CommonController.addColumnHistory(
          dsId,
          dfId,
          dpId,
          userId,
          JSON.stringify(configJson),
          oldDataObj,
          diffValuesObj,
          versionFreezed
          // CDVersionBump
        );
        if (!historyVersion) throw new Error("History not updated");
        // versionBumped = true;
        newVersion = historyVersion;
      }

      const datasetColumns = values;
      var resData = { columns: datasetColumns };
      if (oldVersion?.version < newVersion) {
        resData.version = newVersion;
        resData.versionBumped = true;
      } else {
        resData.version = oldVersion?.version || 0;
        resData.versionBumped = false;
      }

      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        // {
        //   columns: datasetColumns,
        //   versionBumped,
        // }
        resData
      );
    }
    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    Logger.error("catch :update set columns");
    Logger.error(err.message);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Column name should be unique for a dataset",
        "Operation failed"
      );
    }
    console.log(err);
    return apiResponse.ErrorResponse(res, err.message);
  }
};

exports.deleteColumns = async (req, res) => {
  try {
    const { columnId, dsId, dfId, dpId, userId, versionFreezed } = req.body;
    const curDate = helper.getCurrentTime();

    Logger.info({ message: "deleteColumns" });

    // const versionFreezed = false;
    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
    );

    const updateQuery = `update ${schemaName}.columndefinition set del_flg = 1 where columnid = $1 returning *;`;

    DB.executeQuery(updateQuery, [columnId]).then(async (response) => {
      const columnObj = response?.rows?.length ? response.rows[0] : null;
      await updateSqlQuery(dsId, true);
      const historyVersion = await CommonController.addColumnHistory(
        dsId,
        dfId,
        dpId,
        userId,
        JSON.stringify(columnObj),
        { [columnId]: { del_flg: 0 } },
        { [columnId]: { del_flg: 1 } },
        versionFreezed
        // CDVersionBump
      );
      if (!historyVersion) throw new Error("History not updated");

      var resData = { version: historyVersion };
      if (oldVersion?.version === historyVersion) {
        resData.versionBumped = false;
      } else {
        resData.versionBumped = true;
      }

      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        resData
      );
    });
  } catch (err) {
    Logger.error("catch: deleteColumns");
    Logger.error(err.message);
    return apiResponse.ErrorResponse(res, err.message);
  }
};

exports.overrideDatasetColumns = async (req, res) => {
  try {
    const { dsId, dpId, dfId, userId, versionFreezed } = req.body;
    if (!dsId) {
      return false;
    }
    Logger.info({ message: "overrideDatasetColumns" });

    const updateQuery = `update ${schemaName}.columndefinition set del_flg = 1 where datasetid = $1 returning *;`;

    const response = await DB.executeQuery(updateQuery, [dsId]);
    const columnObj = response?.rows?.length ? response.rows[0] : null;
    await updateSqlQuery(dsId, true);
    const historyVersion = await CommonController.addColumnHistory(
      dsId,
      dfId,
      dpId,
      userId,
      JSON.stringify(columnObj),
      { [dsId]: { del_flg: 0 } },
      { [dsId]: { del_flg: 1 } },
      versionFreezed
    );
    if (!historyVersion) throw new Error("History not updated");
    return true;
  } catch (err) {
    Logger.error("catch: overrideDatasetColumns");
    Logger.error(err.message);
    return apiResponse.ErrorResponse(res, err.message);
  }
};
