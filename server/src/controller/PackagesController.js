const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const CommonController = require("./CommonController");
const constants = require("../config/constants");
const helper = require("../helpers/customFunctions");
const { DB_SCHEMA_NAME: schemaName } = constants;
const { getCurrentTime } = require("../helpers/customFunctions");

exports.searchList = async (req, res) => {
  try {
    const searchParam = req.params.query?.toLowerCase() || "";
    const { dataflowId } = req.params;
    let searchQuery = `SELECT datapackageid, dataflowid, name, active, type, sod_view_type, path, password, updt_tm, insrt_tm from ${schemaName}.datapackage WHERE dataflowid='${dataflowId}' and (del_flg is distinct from 'Y') ORDER BY insrt_tm DESC;`;
    if (searchParam) {
      searchQuery = `SELECT datapackageid, dataflowid, name, active, type, sod_view_type, path, password, updt_tm, insrt_tm from ${schemaName}.datapackage 
      WHERE LOWER(name) LIKE '%${searchParam}%' and dataflowid='${dataflowId}' ORDER BY insrt_tm DESC;`;
    }
    const datasetQuery = `SELECT datasetid, mnemonic, active, type, insrt_tm from ${schemaName}.dataset where datapackageid = $1 ORDER BY insrt_tm DESC`;
    Logger.info({ message: "packagesList" });

    DB.executeQuery(searchQuery).then(async (response) => {
      const packages = response.rows || [];
      //const dataset = await DB.executeQuery(datasetQuery, package.datapackageid)
      const datapacs = await packages?.map(async (package) => {
        const responses = await DB.executeQuery(datasetQuery, [
          package.datapackageid,
        ]);
        const pacs = { ...package, datasets: responses.rows };
        return pacs;
      });
      Promise.all(datapacs)
        .then(function (results) {
          return apiResponse.successResponseWithData(res, "Operation success", {
            data: results,
            data_count: results.length,
          });
        })
        .catch(function (err) {
          return apiResponse.ErrorResponse(res, err);
        });
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getPassword = async function (req, res) {
  try {
    const id = req.params.datapackageid;
    const flowid = req.params.dataflowid;
    Logger.info({ message: "getPasswordOfPackage" });
    const response = await helper.readVaultData(`${flowid}/${id}`);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      response
    );
  } catch (err) {
    Logger.error("catch :getPasswordOfPackage");
    const errMsg = err.message || COMMON_ERR;
    Logger.error(errMsg);
    return apiResponse.ErrorResponse(res, errMsg);
  }
};

exports.addPackage = async function (req, res) {
  let package = {};
  const audit_log = [];
  try {
    Logger.info({ message: "addPackage" });
    const {
      compression_type,
      naming_convention,
      package_password,
      sftp_path,
      study_id,
      dataflow_id,
      user_id,
      sod_view_type = "",
      package_id,
      versionFreezed,
    } = req.body;

    // const versionFreezed = true;

    if (study_id == null || dataflow_id == null || user_id == null) {
      return apiResponse.ErrorResponse(res, "Study not found");
    }

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataflow_id}' order by version DESC limit 1`
    );

    if (package_id) {
      const query_response =
        await DB.executeQuery(`SELECT * FROM ${schemaName}.datapackage
      WHERE datapackageid = '${package_id}' LIMIT 1`);

      package =
        query_response && query_response.rowCount > 0 && query_response.rows[0];
      const pp = package_password ? "Yes" : "No";
      if (package) {
        const updateResult = await DB.executeQuery(
          `UPDATE ${schemaName}.datapackage
           SET dataflowid=$1, "type"=$2, "path"=$3, "password"=$4, sod_view_type=$5, name=$6
           WHERE datapackageid='${package_id}' RETURNING*`,
          [
            dataflow_id,
            compression_type,
            sftp_path,
            pp,
            sod_view_type,
            naming_convention,
          ]
        );
      }
      if (package.type !== compression_type)
        audit_log.push({
          attribute: "type",
          old_val: package.type,
          new_val: compression_type,
        });

      if (package.path !== sftp_path)
        audit_log.push({
          attribute: "path",
          old_val: package.path,
          new_val: sftp_path,
        });

      if (package.password !== pp)
        audit_log.push({
          attribute: "password",
          old_val: package.password,
          new_val: pp,
        });

      if (package.sod_view_type !== sod_view_type)
        audit_log.push({
          attribute: "sod_view_type",
          old_val: package.sod_view_type,
          new_val: sod_view_type,
        });

      if (package.name !== naming_convention)
        audit_log.push({
          attribute: "name",
          old_val: package.name,
          new_val: naming_convention,
        });
    } else {
      const query_response = await DB.executeQuery(
        `INSERT INTO ${schemaName}.datapackage(dataflowid, type, name, path, password, active, del_flg, insrt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          dataflow_id,
          compression_type,
          naming_convention,
          sftp_path,
          package_password ? "Yes" : "No",
          "0",
          "N",
          getCurrentTime(),
        ]
      );
      package =
        query_response && query_response.rowCount > 0 && query_response.rows[0];

      audit_log.push({ attribute: "New Package", old_val: "", new_val: "" });
    }

    if (package_password) {
      helper.writeVaultData(`${dataflow_id}/${package.datapackageid}`, {
        password: package_password,
      });
    }

    // const versionFreezed = false;
    const historyVersion = await CommonController.addPackageHistory(
      package,
      user_id,
      audit_log,
      versionFreezed
    );
    if (!historyVersion) throw new Error("History not updated");

    // console.log("audit_log", audit_log, oldVersion.version, historyVersion);
    if (oldVersion.version === historyVersion) {
      var resData = {
        version: historyVersion,
        versionBumped: false,
      };
    } else {
      var resData = {
        version: historyVersion,
        versionBumped: true,
      };
    }

    return apiResponse.successResponseWithData(
      res,
      package_id
        ? "Success! Data Package updated."
        : "Success! Data Package saved.",
      resData
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { active, package_id, user_id, versionFreezed } = req.body;

    Logger.info({ message: "Package changeStatus" });

    if (active == 1) {
      const {
        rows: [dataSetCount],
      } = await DB.executeQuery(
        `SELECT count(1) from ${schemaName}.dataset WHERE datapackageid = '${package_id}'`
      );

      if (dataSetCount.count == 0) {
        return apiResponse.ErrorResponse(
          res,
          "Please add at-least one dataset in order to make active"
        );
      }
    }

    const query = `UPDATE ${schemaName}.datapackage
    SET active = ${active}
    WHERE datapackageid = '${package_id}' RETURNING *`;

    // const versionFreezed = true;

    DB.executeQuery(query).then(async (response) => {
      const package = response.rows[0] || [];

      const {
        rows: [oldVersion],
      } = await DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${package.dataflowid}' order by version DESC limit 1`
      );

      const oldActive = Number(active) == 1 ? "0" : "1";
      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        [{ attribute: "active", old_val: oldActive, new_val: active }],
        versionFreezed
      );

      if (!historyVersion) throw new Error("History not updated");

      if (oldVersion?.version === historyVersion) {
        var resData = {
          version: historyVersion,
          versionBumped: false,
        };
      } else {
        var resData = {
          version: historyVersion,
          versionBumped: true,
        };
      }

      return apiResponse.successResponseWithData(
        res,
        "Success! Data Package updated.",
        resData
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { active, package_id, user_id, versionFreezed } = req.body;
    const query = `UPDATE ${schemaName}.datapackage
    SET del_flg = 'Y'
    WHERE datapackageid = '${package_id}' RETURNING *`;

    // const versionFreezed = false;
    Logger.info({ message: "deletePackage" });

    const {
      rows: [dfId],
    } = await DB.executeQuery(
      `SELECT dataflowid from ${schemaName}.datapackage WHERE datapackageid = '${package_id}'`
    );

    const {
      rows: [dataPackageCount],
    } = await DB.executeQuery(
      `SELECT count(1) from ${schemaName}.datapackage WHERE dataflowid = '${dfId.dataflowid}'`
    );

    if (dataPackageCount.count < 2) {
      return apiResponse.ErrorResponse(
        res,
        "Please inactivate the dataflow in order to delete the package"
      );
    }

    const dataSetQuery = `UPDATE ${schemaName}.dataset SET del_flg = 'Y' WHERE datapackageid = '${package_id}' RETURNING datasetid`;
    const columnQuery = `UPDATE ${schemaName}.columndefinition SET del_flg = 1 WHERE datasetid = $1`;

    DB.executeQuery(query).then(async (response) => {
      const package = response.rows[0] || [];

      const {
        rows: [oldVersion],
      } = await DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${package.dataflowid}' order by version DESC limit 1`
      );

      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        [{ attribute: "del_flg", old_val: "N", new_val: "Y" }],
        versionFreezed
      );
      if (!historyVersion) throw new Error("History not updated");

      const updateDataset = await DB.executeQuery(dataSetQuery);
      // console.log("update dataSet", updateDataset.rows);

      for (const id in updateDataset.rows) {
        const updatedColumn = await DB.executeQuery(columnQuery, [
          updateDataset.rows[id].datasetid,
        ]);
      }

      if (oldVersion.version === historyVersion) {
        var resData = {
          version: historyVersion,
          versionBumped: false,
        };
      } else {
        var resData = {
          version: historyVersion,
          versionBumped: true,
        };
      }

      return apiResponse.successResponseWithData(
        res,
        "Success! Data Package deleted.",
        resData
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.changeDatasetsStatus = async (req, res) => {
  try {
    const { active, packageId, userId, versionFreezed } = req.body;
    if (!packageId || !userId || typeof active === "undefined") {
      return apiResponse.ErrorResponse(res, "Please provide required payload");
    }

    Logger.info({ message: "change Datasets Status" });

    const {
      rows: [dfId],
    } = await DB.executeQuery(
      `SELECT dataflowid from ${schemaName}.datapackage WHERE datapackageid = '${packageId}'`
    );
    if (active == 0) {
      const {
        rows: [dataPackageCount],
      } = await DB.executeQuery(
        `SELECT count(1) from ${schemaName}.datapackage WHERE dataflowid = '${dfId.dataflowid}'`
      );

      if (dataPackageCount.count < 2) {
        return apiResponse.ErrorResponse(
          res,
          "If data flow is active, there must be at least one active Data Set"
        );
      }
    }
    let val = 0;
    if (active == 0) {
      val = 1;
    }

    const { rows: oldData } = await DB.executeQuery(
      `SELECT datasetid,active from ${schemaName}.dataset WHERE datapackageid = '${packageId}' and active='${val}'`
    );

    const query = `UPDATE ${schemaName}.dataset
    SET active = ${active}
    WHERE datapackageid = '${packageId}' RETURNING *`;

    // const versionFreezed = true;
    DB.executeQuery(query).then(async (response) => {
      const datasets = response.rows[0] || [];

      const oldVer = await DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version  WHERE dataflowid = '${dfId.dataflowid}' order by version DESC limit 1`
      );

      const historyVersion = oldVer.rows[0]?.version || 0;
      var version = Number(historyVersion);
      const oldVersion = Number(historyVersion);
      let newVersion = null;
      const curDate = helper.getCurrentTime();

      if (!versionFreezed) {
        version = Number(historyVersion) + 1;

        const {
          rows: [data],
        } = await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5) RETURNING version`,
          [dfId.dataflowid, version, null, userId, curDate]
        );

        newVersion = data.version;
        await DB.executeQuery(
          `INSERT INTO ${schemaName}.cdr_ta_queue
            (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid)
            VALUES($1, 'CONFIG', $2, 'QUEUE', $5, $5, '', $3, '', 1, '', 0, $4)`,
          [dfId.dataflowid, userId, version, packageId, curDate]
        );
      }

      for (let key of oldData) {
        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid, datasetid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            dfId.dataflowid,
            packageId,
            key.datasetid,
            version,
            "active",
            key.active,
            active,
            userId,
            curDate,
          ]
        );
      }

      let resData = {};

      if (oldVersion < newVersion) {
        resData.version = newVersion;
        resData.versionBumped = true;
      } else {
        resData.version = oldVersion;
        resData.versionBumped = false;
      }

      return apiResponse.successResponseWithData(
        res,
        "Success! Datasets status updated.",
        resData
      );
    });
  } catch (err) {
    Logger.error("catch :change Datasets Status");
    return apiResponse.ErrorResponse(res, err);
  }
};
