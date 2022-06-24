const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const CommonController = require("./CommonController");
const constants = require("../config/constants");
const helper = require("../helpers/customFunctions");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.searchList = async (req, res) => {
  try {
    const searchParam = req.params.query?.toLowerCase() || "";
    const { dataflowId } = req.params;
    let searchQuery = `SELECT datapackageid, dataflowid, name, active, type, sod_view_type, path, password, updt_tm from ${schemaName}.datapackage WHERE dataflowid='${dataflowId}' and (del_flg is distinct from 'Y');`;
    if (searchParam) {
      searchQuery = `SELECT datapackageid, dataflowid, name, active, type, sod_view_type, path, password, updt_tm from ${schemaName}.datapackage 
      WHERE LOWER(name) LIKE '%${searchParam}%' and dataflowid='${dataflowId}';`;
    }
    const datasetQuery = `SELECT datasetid, mnemonic, active, type from ${schemaName}.dataset where datapackageid = $1`;
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
        `INSERT INTO ${schemaName}.datapackage(dataflowid, type, name, path, password, active, del_flg) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          dataflow_id,
          compression_type,
          naming_convention,
          sftp_path,
          package_password ? "Yes" : "No",
          "1",
          "N",
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
      {}
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.changeStatus = function (req, res) {
  try {
    const { active, package_id, user_id, versionFreezed } = req.body;

    Logger.info({ message: "Package changeStatus" });
    const query = `UPDATE ${schemaName}.datapackage
    SET active = ${active}
    WHERE datapackageid = '${package_id}' RETURNING *`;

    // const versionFreezed = false;

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
        "Success! Data Package updated.",
        resData
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deletePackage = function (req, res) {
  try {
    const { active, package_id, user_id, versionFreezed } = req.body;
    const query = `UPDATE ${schemaName}.datapackage
    SET del_flg = 'Y'
    WHERE datapackageid = '${package_id}' RETURNING *`;

    // const versionFreezed = false;
    Logger.info({ message: "deletePackage" });

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
