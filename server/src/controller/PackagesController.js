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

exports.addPackage = function (req, res) {
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
    } = req.body;

    if (study_id == null || dataflow_id == null || user_id == null) {
      return apiResponse.ErrorResponse(res, "Study not found");
    }

    const insertValues = [
      dataflow_id,
      compression_type,
      naming_convention,
      sftp_path,
      package_password ? "Yes" : "No",
      "1",
      "N",
    ];
    DB.executeQuery(
      `INSERT INTO ${schemaName}.datapackage(dataflowid, type, name, path, password, active, del_flg) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      insertValues
    ).then(async (response) => {
      const {
        rows: [package],
      } = response;
      if (package_password) {
        console.log(
          "package_password",
          package_password,
          package.datapackageid
        );
        helper.writeVaultData(`${dataflow_id}/${package.datapackageid}`, {
          password: package_password,
        });
      }
      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        "New Package"
      );
      if (!historyVersion) throw new Error("History not updated");
      return apiResponse.successResponseWithData(
        res,
        "Success! Data Package saved.",
        {}
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updatePackage = function (req, res) {
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
      sod_view_type,
      package_id
    } = req.body;

    if (study_id == null || dataflow_id == null || user_id == null) {
      return apiResponse.ErrorResponse(res, "Study not found");
    }

    const insertValues = [
      dataflow_id,
      compression_type,
      sftp_path,
      package_password ? "Yes" : "No",
      sod_view_type,
      naming_convention
    ];
    const updateQuery =`UPDATE ${schemaName}.datapackage
SET dataflowid=$1, "type"=$2, "path"=$3, "password"=$4, sod_view_type=$5, name=$6
WHERE datapackageid='${package_id}' RETURNING*`

    DB.executeQuery(
      // `INSERT INTO ${schemaName}.datapackage(dataflowid, datapackageid, type, name, path, password, active, del_flg) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      updateQuery,
      insertValues
    ).then(async (response) => {
      const package = response.rows[0] || [];
      console.log(response,"resp")
      if (package_password) {
 
        helper.writeVaultData(`${dataflow_id}/${package_id}`, {
          password: package_password,
        });
      }
      const historyVersion = await CommonController.addPackageHistory(
        package,
        user_id,
        "New Package"
      );
      // if (!historyVersion) throw new Error("History not updated");
      return apiResponse.successResponseWithData(
        res,
        "Success! Data Package saved.",
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
    Logger.info({ message: "Package changeStatus" });
    const query = `UPDATE ${schemaName}.datapackage
    SET active = ${active}
    WHERE datapackageid = '${package_id}' RETURNING *`;

    DB.executeQuery(query).then(async (response) => {
      console.log(response,"statuschange")
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
        "Success! Data Package updated.",
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

    Logger.info({ message: "deletePackage" });

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
        "Success! Data Package deleted.",
        {}
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};
