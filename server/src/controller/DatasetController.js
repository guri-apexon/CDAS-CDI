const DB = require("../config/db");
const jdbc = require("../config/JDBC");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;
const CommonController = require("./CommonController");
const {
  datasetLevelInsert,
} = require("../createDataflow/externalDataflowFunctions");
const datasetHelper = require("../helpers/datasetHelper");
const dataflowHelper = require("../helpers/dataflowHelper");

async function checkMnemonicExists(name, studyId, testFlag, dsId = null) {
  let searchQuery = `select distinct d3.mnemonic from ${schemaName}.study s left join ${schemaName}.dataflow d on s.prot_id = d.prot_id left join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid left join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where s.prot_id=$1 and d.testflag=$2`;
  let dep = [studyId, testFlag];
  if (dsId) {
    searchQuery = `select d3.mnemonic from ${schemaName}.study s left join ${schemaName}.dataflow d on s.prot_id = d.prot_id left join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid left join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where s.prot_id=$1 and d.testflag=$2 and d3.datasetid!=$3`;
    dep = [studyId, testFlag, dsId];
  }
  const { rows } = await DB.executeQuery(searchQuery, dep);
  const result = await rows.map((e) => e.mnemonic).includes(name);
  return result;
}

async function saveSQLDataset(
  res,
  values,
  dpId,
  userId,
  dfId,
  versionFreezed,
  existingVersion
) {
  try {
    Logger.info({ message: "create SQL Dataset" });
    const curDate = helper.getCurrentTime();
    let sqlQuery = "";
    if (values.isCustomSQL === "No") {
      if (values.filterCondition) {
        sqlQuery = `Select from ${values.tableName} ${values.filterCondition}`;
      } else {
        sqlQuery = `Select from ${values.tableName} where 1=1`;
      }
    } else {
      sqlQuery = values.sQLQuery;
    }

    const body = [
      values.datasetName,
      values.active === true ? 1 : 0,
      values.clinicalDataType[0] ? values.clinicalDataType[0] : null,
      values.isCustomSQL,
      sqlQuery,
      values.dataType === "Incremental" ? "Y" : "N" || null,
      values.tableName || null,
      values.offsetColumn || null,
      values.filterCondition || null,
      curDate,
      dpId,
    ];

    const {
      rows: [datasetObj],
    } = await DB.executeQuery(
      `INSERT into ${schemaName}.dataset (mnemonic, active, datakindid, customsql_yn, customsql, incremental, tbl_nm, offsetcolumn, dataset_fltr, insrt_tm, updt_tm, datapackageid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11) returning *`,
      body
    );

    const conf_Data = {
      datasetid: datasetObj.datasetid,
      datapackageid: dpId,
      mnemonic: values.datasetName,
      active: values.active === true ? 1 : 0,
      datakindid: values.clinicalDataType[0]
        ? values.clinicalDataType[0]
        : null,
      customsql_yn: values.isCustomSQL,
      customsql: values.sQLQuery || null,
      incremental: values.dataType === "Incremental" ? "Y" : "N" || null,
      tbl_nm: values.tableName || null,
      offsetcolumn: values.offsetColumn || null,
      dataset_fltr: values.filterCondition || null,
    };

    const jsonData = JSON.stringify(conf_Data);

    const attributeName = "New Dataset";

    const historyVersion = await CommonController.addDatasetHistory(
      dfId,
      userId,
      dpId,
      datasetObj.datasetid,
      jsonData,
      attributeName,
      null,
      null,
      versionFreezed
    );
    if (!historyVersion) throw new Error("History not updated");

    var resData = {
      ...datasetObj,
      version: historyVersion,
    };
    if (existingVersion === historyVersion) {
      resData.versionBumped = false;
    } else {
      resData.versionBumped = true;
    }

    return apiResponse.successResponseWithData(
      res,
      "Dataset was saved successfully",
      // datasetObj
      resData
    );
  } catch (err) {
    // console.log(" Catch::::", err);
    //throw error in json response with status 500.
    Logger.error("catch: create SQL Dataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(
      res,
      err.message || "Something went wrong"
    );
  }
}

exports.saveDatasetData = async (req, res) => {
  try {
    const values = req.body;
    const {
      dpId,
      studyId,
      dfId,
      testFlag,
      userId,
      clinicalDataType,
      versionFreezed,
    } = req.body;

    // const isExist = await checkMnemonicExists(
    //   values.datasetName,
    //   studyId,
    //   testFlag
    // );

    const dataflow = await dataflowHelper.findById(dfId);
    if (dataflow) {
      const isExist = await datasetHelper.findByMnemonic(
        dataflow.prot_id,
        dataflow.testflag,
        dataflow.vend_id,
        clinicalDataType[0],
        values.datasetName
      );

      if (isExist) {
        return apiResponse.ErrorResponse(
          res,
          `Mnemonic ${values.datasetName} is not unique.`
        );
      }
    }

    // const versionFreezed = true;

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
    );

    // console.log("oldVersion", oldVersion);

    if (values.locationType.toLowerCase() === "jdbc") {
      return saveSQLDataset(
        res,
        values,
        dpId,
        userId,
        dfId,
        versionFreezed,
        oldVersion.version
      );
    }

    const curDate = helper.getCurrentTime();
    // const versionFreezed = false;

    Logger.info({ message: "create Dataset" });

    const body = [
      values.datasetName,
      values.fileType,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber > 0 ? 1 : 0,
      values.footerRowNumber > 0 ? 1 : 0,
      values.headerRowNumber || 0,
      values.footerRowNumber || 0,
      values.active === true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.filePwd ? "Yes" : "No",
      values.clinicalDataType[0],
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      curDate,
      dpId,
      values.loadType == "Incremental" ? "Y" : "N",
    ];

    DB.executeQuery(
      `INSERT into ${schemaName}.dataset (mnemonic, type, charset, delimiter, escapecode, quote, headerrow, footerrow, headerrownumber, footerrownumber, active, name, path, file_pwd, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, datapackageid, incremental) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) returning *`,
      body
    ).then(async (response) => {
      const { rows: datasetObj } = response;
      if (values.filePwd) {
        try {
          await helper.writeVaultData(
            `${dfId}/${dpId}/${datasetObj.datasetid}`,
            {
              password: values.filePwd,
            }
          );
        } catch (error) {
          Logger.error(error);
          return apiResponse.ErrorResponse(
            res,
            "Something went wrong with vault"
          );
        }
      }
      const conf_Data = {
        datasetid: datasetObj.datasetid,
        datapackageid: dpId,
        mnemonic: values.datasetName,
        type: values.fileType,
        charset: values.encoding || null,
        delimiter: values.delimiter || null,
        escapecode: values.escapeCharacter || null,
        quote: values.quote || null,
        headerrow: values.headerRowNumber > 0 ? 1 : 0,
        footerrow: values.footerRowNumber > 0 ? 1 : 0,
        headerrownumber: values.headerRowNumber || 0,
        footerrownumber: values.footerRowNumber || 0,
        active: true ? 1 : 0,
        naming_convention: values.fileNamingConvention || null,
        path: values.folderPath || null,
        password: datasetObj.file_pwd,
        datakindid: values.clinicalDataType[0],
        data_freq: values.transferFrequency || null,
        ovrd_stale_alert: values.overrideStaleAlert || null,
        rowdecreaseallowed: values.rowDecreaseAllowed || 0,
        incremental: "Incremental" ? "Y" : "N",
      };

      const jsonData = JSON.stringify(conf_Data);
      const attributeName = "New Dataset";

      const historyVersion = await CommonController.addDatasetHistory(
        dfId,
        userId,
        dpId,
        datasetObj.datasetid,
        jsonData,
        attributeName,
        null,
        null,
        versionFreezed
      );
      if (!historyVersion) throw new Error("History not updated");

      var resData = {
        ...response.rows[0],
        filePwd: values.filePwd,
        version: historyVersion,
      };
      if (oldVersion.version === historyVersion) {
        resData.versionBumped = false;
      } else {
        resData.versionBumped = true;
      }

      return apiResponse.successResponseWithData(
        res,
        "Dataset was saved successfully",
        resData
      );
    });
  } catch (err) {
    console.log(err);
    Logger.error("catch :storeDataset");
    return apiResponse.ErrorResponse(
      res,
      err.message || "Something went wrong"
    );
  }
};

async function updateSQLDataset(res, values, versionFreezed, existingVersion) {
  try {
    Logger.info({ message: "update SQL Dataset" });
    const curDate = helper.getCurrentTime();
    const {
      datasetName,
      active,
      clinicalDataType,
      isCustomSQL,
      tableName,
      filterCondition,
      dataType,
      offsetColumn,
      sQLQuery,
      dfId,
      userId,
      dpId,
      datasetid,
    } = values;

    let updatedSqlQuery = "";
    if (isCustomSQL === "No") {
      const splitted = sQLQuery.split("from");
      if (filterCondition) {
        if (!filterCondition?.toLowerCase()?.includes("where ")) {
          return apiResponse.ErrorResponse(
            res,
            "Please correct your filter condition"
          );
        }
        updatedSqlQuery = `${splitted[0].trim()} from ${tableName} ${filterCondition}`;
      } else {
        updatedSqlQuery = `${splitted[0].trim()} from ${tableName} where 1=1`;
      }
    } else {
      updatedSqlQuery = sQLQuery;
    }

    const { rows: tempData } = await DB.executeQuery(
      `select mnemonic, active, datakindid, customsql_yn, customsql, tbl_nm, dataset_fltr, offsetcolumn, incremental from ${schemaName}.dataset where datasetid = $1`,
      [datasetid]
    );
    const oldData = tempData[0];

    const body = [
      datasetName,
      helper.stringToBoolean(active) ? 1 : 0,
      clinicalDataType ? clinicalDataType[0] : null,
      isCustomSQL || null,
      updatedSqlQuery || null,
      tableName || null,
      filterCondition || null,
      dataType === "Incremental" ? "Y" : "N" || null,
      offsetColumn || null,
      curDate,
      datasetid,
    ];

    const requestData = {
      mnemonic: datasetName,
      active: helper.stringToBoolean(active) ? 1 : 0,
      datakindid: clinicalDataType ? clinicalDataType[0] : null,
      customsql_yn: isCustomSQL || null,
      customsql: updatedSqlQuery || null,
      tbl_nm: tableName || null,
      dataset_fltr: filterCondition || null,
      offsetcolumn: offsetColumn,
      incremental: dataType === "Incremental" ? "Y" : "N" || null,
    };

    const updateDS = await DB.executeQuery(
      `UPDATE ${schemaName}.dataset set mnemonic = $1, active = $2, datakindid = $3, customsql_yn = $4, customsql =$5, tbl_nm = $6, dataset_fltr = $7, offsetcolumn = $9, incremental = $8, updt_tm=$10 where datasetid = $11 returning *`,
      body
    );

    if (!updateDS?.rowCount) {
      return apiResponse.ErrorResponse(res, "Something went wrong on update");
    }

    const diffObj = helper.getdiffKeys(requestData, oldData);

    var idObj = {
      dataflowid: dfId,
      datasetid: datasetid,
      datapackageid: dpId,
    };

    const updateConfg = Object.assign(idObj, diffObj);
    let newVersion = null;
    if (Object.keys(diffObj).length != 0) {
      const historyVersion = await CommonController.addDatasetHistory(
        dfId,
        userId,
        dpId,
        datasetid,
        JSON.stringify(updateConfg),
        null,
        oldData,
        diffObj,
        versionFreezed
      );
      if (!historyVersion) throw new Error("History not updated");
      newVersion = historyVersion;
    }

    var resData = {
      ...updateDS.rows[0],
    };
    if (existingVersion < newVersion) {
      resData.version = newVersion;
      resData.versionBumped = true;
    } else {
      resData.version = existingVersion;
      resData.versionBumped = false;
    }

    return apiResponse.successResponseWithData(
      res,
      "Dataset was updated successfully",
      // updateDS.rows[0]
      resData
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error(err);
    return apiResponse.ErrorResponse(
      res,
      err?.message || "Something went wrong"
    );
  }
}

exports.updateDatasetData = async (req, res) => {
  try {
    const values = req.body;
    const curDate = helper.getCurrentTime();
    Logger.info({ message: "update Dataset" });
    const {
      dfId,
      studyId,
      dpId,
      testFlag,
      datasetid,
      userId,
      datasetName,
      versionFreezed,
      clinicalDataType,
      loadType,
    } = req.body;

    // const versionFreezed = false;
    const dataflow = await dataflowHelper.findById(dfId);
    const dataset = await datasetHelper.findById(datasetid);
    const searchQuery = `SELECT "columnid", "variable", "name", "datatype", "primarykey", "required", "charactermin", "charactermax", "position", "format", "lov", "unique", insrt_tm from ${schemaName}.columndefinition WHERE coalesce (del_flg,0) != 1 AND datasetid = $1 ORDER BY insrt_tm`;
    const row = await DB.executeQuery(searchQuery, [datasetid]);
    const test = row.rows;

    // check for primaryKey
    if (testFlag === 0 && loadType === "Incremental") {
      let saveflagyes = false;
      for (let i = 0; i < test.length; i++) {
        if (test[i].primarykey === 1) saveflagyes = true;
      }
      if (!saveflagyes)
        return apiResponse.ErrorResponse(
          res,
          `Cannot switch to Incremental if a primaryKey has not been defined as primaryKey is mandatory for incremental.`
        );
    }

    if (
      dataflow.data_in_cdr === "Y" &&
      dataset.incremental === "Y" &&
      testFlag === 0 &&
      loadType === "Cumulative"
    ) {
      return apiResponse.ErrorResponse(
        res,
        `Cannot switch to Cumulative if the dataflow has been synced once.`
      );
    }
    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
    );

    // const isExist = await checkMnemonicExists(
    //   datasetName,
    //   studyId,
    //   testFlag,
    //   datasetid
    // );
    const isExist = await datasetHelper.findByMnemonic(
      "",
      "",
      "",
      clinicalDataType[0],
      datasetName,
      datasetid
    );
    const selectQuery = `select datasetid, datapackageid, mnemonic, type, charset, delimiter , escapecode, quote,
    headerrow, footerrow, headerrownumber, footerrownumber, active, name, path, file_pwd, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, 
    incremental from ${schemaName}.dataset where datasetid = $1`;

    if (isExist) {
      return apiResponse.ErrorResponse(
        res,
        `Mnemonic ${datasetName} is not unique.`
      );
    }
    if (!helper.isSftp(values.locationType)) {
      return updateSQLDataset(res, values, versionFreezed, oldVersion.version);
    }
    // For SFTP Datasets update
    const incremental = values.loadType === "Incremental" ? "Y" : "N";

    const { rows: tempData } = await DB.executeQuery(selectQuery, [datasetid]);
    const oldData = tempData[0];

    let passwordStatus = "No";

    if (values.filePwd) {
      passwordStatus = "Yes";
      await helper.writeVaultData(`${dfId}/${dpId}/${datasetid}`, {
        password: values.filePwd,
      });
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
      headerrow: values.headerRowNumber > 0 ? 1 : 0,
      footerrow: values.footerRowNumber > 0 ? 1 : 0,
      headerrownumber: values.headerRowNumber || 0,
      footerrownumber: values.footerRowNumber || 0,
      active: helper.stringToBoolean(values.active) ? 1 : 0,
      name: values.fileNamingConvention || null,
      path: values.folderPath || null,
      file_pwd: passwordStatus,
      datakindid: values.clinicalDataType[0],
      data_freq: values.transferFrequency || null,
      ovrd_stale_alert: values.overrideStaleAlert || null,
      rowdecreaseallowed: values.rowDecreaseAllowed || 0,
      incremental,
    };

    const body = [
      values.datasetName,
      values.fileType || null,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber || 0,
      values.footerRowNumber || 0,
      helper.stringToBoolean(values.active) ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.clinicalDataType[0],
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || 0,
      curDate,
      incremental,
      passwordStatus,
      values.headerRowNumber > 0 ? 1 : 0,
      values.footerRowNumber > 0 ? 1 : 0,
    ];

    const updateQuery = `UPDATE ${schemaName}.dataset set mnemonic = $1, type = $2, charset = $3, delimiter = $4, escapecode = $5, quote = $6, headerrow = $19, footerrow = $20, headerrownumber = $7, footerrownumber = $8, active = $9, name = $10, path = $11, datakindid = $12, data_freq = $13, ovrd_stale_alert = $14, rowdecreaseallowed = $15, updt_tm = $16, incremental = $17, file_pwd = $18 where datasetid = $21 returning *`;

    const updateDS = await DB.executeQuery(updateQuery, [
      ...body,
      values.datasetid,
    ]);

    const diffObj = helper.getdiffKeys(requestData, oldData);

    var idObj = {
      dataflowid: dfId,
      datasetid: datasetid,
      datapackageid: dpId,
    };

    const updateConfg = Object.assign(idObj, diffObj);

    let newVersion = null;
    if (Object.keys(diffObj).length != 0) {
      const historyVersion = await CommonController.addDatasetHistory(
        dfId,
        userId,
        dpId,
        datasetid,
        JSON.stringify(updateConfg),
        null,
        oldData,
        diffObj,
        versionFreezed
      );
      if (!historyVersion) throw new Error("History not updated");
      newVersion = historyVersion;
    }

    var resData = {
      ...updateDS.rows[0],
    };
    if (oldVersion.version < newVersion) {
      resData.version = newVersion;
      resData.versionBumped = true;
    } else {
      resData.version = oldVersion.version;
      resData.versionBumped = false;
    }

    return apiResponse.successResponseWithData(
      res,
      "Dataset was updated successfully",
      resData
    );
  } catch (err) {
    Logger.error(err);
    return apiResponse.ErrorResponse(
      res,
      err.message || "Something went wrong"
    );
  }
};

exports.getVLCData = async (req, res) => {
  try {
    Logger.info({ message: "getVLCData" });
    const { datasetid } = req.body;
    const q1 = `SELECT ext_ruleid as "ruleId", qc_type as "type", ruleexpr AS "ruleExp", ruleseq as "ruleSeq", "action", errorcode as "emCode", errormessage as "errMsg",
    CASE WHEN active_yn='Y' AND curr_rec_yn ='Y' THEN 'Active' ELSE 'Inactive' END as "status" FROM ${schemaName}.dataset_qc_rules dqr where dqr.datasetid = $1`;
    const { rows } = await DB.executeQuery(q1, [datasetid]);
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
    let filePwd;
    try {
      filePwd = await helper.readVaultData(`${dfId}/${dpId}/${dsId}`);
    } catch {
      Logger.error("catch :vault error");
    }
    const datasetDetail = await DB.executeQuery(query, [dsId]);

    if (datasetDetail.rows[0].file_pwd === "Yes") {
      if (filePwd) {
        return apiResponse.successResponseWithData(res, "Operation success", {
          ...datasetDetail.rows[0],
          file_pwd: filePwd.password,
        });
      }
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        datasetDetail.rows[0]
      );
    } else if (datasetDetail.rows[0].file_pwd === "No") {
      return apiResponse.successResponseWithData(res, "Operation success", {
        ...datasetDetail.rows[0],
        file_pwd: "",
      });
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

exports.previewSql = async (req, res) => {
  const validateCustomSQL = (customSqlQuery) => {
    return customSqlQuery?.includes("*") ? false : true;
  };

  try {
    let {
      locationType,
      customQuery,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      customSql,
      driverName,
    } = req.body;

    const isValidSQL = validateCustomSQL(customSql);

    if (customQuery === "Yes") {
      if (isValidSQL) {
        let q = customSql;
        let recordsCount = 10;
        switch (locationType?.toLowerCase()) {
          case "oracle":
            q = `${q} FETCH FIRST ${recordsCount} ROWS ONLY`;
            break;
          case "sql server":
          case "sqlserver":
            q = `${q} SET ROWCOUNT ${recordsCount}`;
            break;
          default:
            q = `${q} LIMIT ${recordsCount};`;
            break;
        }
        await jdbc(
          connectionUserName,
          connectionPassword,
          connectionUrl,
          driverName,
          q,
          "query executed successfully.",
          res
        );
      } else {
        return apiResponse.ErrorResponse(
          res,
          "customQuery: An asterisk (*) cannot be used to specify that a query should return all columns, columns must be named. Please revise the query."
        );
      }
    } else {
      return apiResponse.ErrorResponse(
        res,
        "Please select custom query yes to proceed"
      );
    }
  } catch (error) {
    Logger.error(error);
    return apiResponse.ErrorResponse(
      res,
      error.message || "Catch: Something went wrong"
    );
  }
};
