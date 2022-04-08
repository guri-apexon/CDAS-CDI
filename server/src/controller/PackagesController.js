const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const CommonController = require("./CommonController");
const constants = require("../config/constants");
const helper = require("../helpers/customFunctions");
const { DB_SCHEMA_NAME: schemaName } = constants;

//const getVersion = `select version from ${schemaName}.dataflow_version where dataflowid =$1 order by  version desc limit 1`;

exports.searchList = async (req, res) => {
  try {
    const searchParam = req.params.query?.toLowerCase() || "";
    const { dataflowId } = req.params;
    let searchQuery = `SELECT datapackageid, dataflowid, name, active, type from ${schemaName}.datapackage WHERE dataflowid='${dataflowId}';`;
    if (searchParam) {
      searchQuery = `SELECT datapackageid, dataflowid, name, active, type from ${schemaName}.datapackage 
      WHERE LOWER(name) LIKE '%${searchParam}%' and dataflowid='${dataflowId}';`;
    }
    const datasetQuery = `SELECT datasetid, mnemonic, active, type from ${schemaName}.dataset where datapackageid = $1`;
    Logger.info({
      message: "packagesList",
    });

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

exports.addPackage = function (req, res) {
  try {
    const packageID = helper.createUniqueID();
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const {
      compression_type,
      naming_convention,
      package_password,
      sftp_path,
      study_id,
      dataflow_id,
      user_id,
    } = req.body;
    let passwordStatus;
    if (study_id == null || dataflow_id == null || user_id == null) {
      return apiResponse.ErrorResponse(res, "Study not found");
    }

    if (package_password) {
      passwordStatus = "Yes";
      helper.writeVaultData(`${dataflow_id}/${packageID}`, {
        password: package_password,
      });
    } else {
      passwordStatus = "No";
    }

    const insertValues = [
      packageID,
      dataflow_id,
      compression_type,
      naming_convention,
      sftp_path,
      passwordStatus,
      "1",
      "N",
    ];
    const query = `INSERT INTO ${schemaName}.datapackage(datapackageid, dataflowid, type, name, path, password, active, del_flg) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

    DB.executeQuery(query, insertValues).then(async (response) => {
      const package = response.rows[0] || [];
      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        "New Package"
      );
      if (!historyVersion) throw new Error("History not updated");
      return apiResponse.successResponseWithData(
        res,
        "Datapackage created successfully",
        {}
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.changeStatus = function (req, res) {
  try {
    const { active, package_id, user_id } = req.body;
    const query = `UPDATE ${schemaName}.datapackage
    SET active = ${active}
    WHERE datapackageid = '${package_id}' RETURNING *`;

    DB.executeQuery(query).then(async (response) => {
      const package = response.rows[0] || [];
      const oldActive = Number(active) == 1 ? "0" : "1";
      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        "active",
        oldActive,
        active
      );

      if (!historyVersion) throw new Error("History not updated");
      return apiResponse.successResponseWithData(
        res,
        "Updated successfully",
        {}
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deletePackage = function (req, res) {
  try {
    const { active, package_id, user_id } = req.body;
    const query = `UPDATE ${schemaName}.datapackage
    SET del_flg = 'Y'
    WHERE datapackageid = '${package_id}' RETURNING *`;

    const dataSetQuery = `UPDATE ${schemaName}.dataset SET del_flg = 'Y' WHERE datapackageid = '${package_id}' RETURNING datasetid`;
    const columnQuery = `UPDATE ${schemaName}.columndefinition SET del_flg = 1 WHERE datasetid = $1`;

    DB.executeQuery(query).then(async (response) => {
      const package = response.rows[0] || [];
      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        "del_flg",
        "N",
        "Y"
      );
      if (!historyVersion) throw new Error("History not updated");

      const updateDataset = await DB.executeQuery(dataSetQuery);
      // console.log("update dataSet", updateDataset.rows);

      for (const id in updateDataset.rows) {
        const updatedColumn = await DB.executeQuery(columnQuery, [
          updateDataset.rows[id].datasetid,
        ]);
      }

      return apiResponse.successResponseWithData(
        res,
        "Deleted successfully",
        {}
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};
