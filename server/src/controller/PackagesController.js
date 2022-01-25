const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const CommonController = require("./CommonController");
const constants = require('../config/constants');

exports.searchList = async (req, res) => {
  try {
    const searchParam = req.params.query?.toLowerCase() || "";
    let searchQuery = `SELECT datapackageid, dataflowid, name, active, type from ${constants.DB_SCHEMA_NAME}.datapackage 
            WHERE del_flg = 'N' order by updt_tm desc`;
    if(searchParam) { 
      searchQuery = `SELECT datapackageid, dataflowid, name, active, type from ${constants.DB_SCHEMA_NAME}.datapackage 
      WHERE LOWER(name) LIKE '%${searchParam}%' AND del_flg = 'N'  order by updt_tm desc`;
    }
    const datasetQuery = `SELECT datasetid, mnemonic, active, type from ${constants.DB_SCHEMA_NAME}.dataset where datapackageid = $1`;
    Logger.info({
      message: "packagesList",
    });

    DB.executeQuery(searchQuery).then( async (response) => {
      const packages = response.rows || [];
      //const dataset = await DB.executeQuery(datasetQuery, package.datapackageid)
      const datapacs = await packages?.map(async (package) => {
          const responses =  await DB.executeQuery(datasetQuery, [package.datapackageid]);
          const pacs =  {...package, datasets: responses.rows};
          return pacs;
        });
      Promise.all(datapacs).then(function(results) {
        return apiResponse.successResponseWithData(res, "Operation success", {
          data: results,
          data_count: results.length,
        });
      }).catch(function (err) {
        return apiResponse.ErrorResponse(res, err);
      });
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};
exports.addPackage = function (req, res) {
  try {
    const packageID = CommonController.createUniqueID();
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
    if (study_id == null || dataflow_id == null || user_id == null) {
      return apiResponse.ErrorResponse(res, "Study not found");
    }
    const query = `INSERT INTO ${constants.DB_SCHEMA_NAME}.datapackage(datapackageid, type, name, path, password, active, insrt_tm, updt_tm, del_flg, prot_id, dataflowid) VALUES('${packageID}', '${compression_type}', '${naming_convention}', '${sftp_path}','${package_password}',  '1','${currentTime}','${currentTime}', 'N','${study_id}','${dataflow_id}')`;
    
    DB.executeQuery(query).then( (response) => {
      const packages = response.rows || [];
      const ver = "1";
      const vers_id = packageID + ver;
      const historyQuery = `INSERT INTO ${constants.DB_SCHEMA_NAME}.datapackage_history (datapackage_vers_id, datapackageid, version, dataflowid, type, name, path, password, active, insrt_tm, updt_tm, del_flg, prot_id, usr_id) VALUES('${vers_id}', '${packageID}', '${ver}', '${dataflow_id}', '${compression_type}', '${naming_convention}', '${sftp_path}','${package_password}',  '1','${currentTime}','${currentTime}', 'N','${study_id}','${user_id}')`;
      DB.executeQuery(historyQuery).then( (response) => {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          {}
        );
      });
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.changeStatus = function (req, res) {
  try {
    const { active, package_id, user_id } = req.body;
    const query = `UPDATE ${constants.DB_SCHEMA_NAME}.datapackage
    SET active = ${active}
    WHERE datapackageid = '${package_id}' RETURNING *`;

    DB.executeQuery(query).then( async (response) => {
      const package = response.rows[0] || [];
      const oldActive = Number(active) == 1 ? "0" : "1";
      const historyVersion = await CommonController.addPackageHistory(package, user_id, 'active', oldActive, active );
      if(!historyVersion) throw new Error('History not updated');
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
    const query = `UPDATE ${constants.DB_SCHEMA_NAME}.datapackage
    SET del_flg = 'Y'
    WHERE datapackageid = '${package_id}' RETURNING *`;
    DB.executeQuery(query).then( async (response) => {
      const package = response.rows[0] || [];
      const historyVersion = await CommonController.addPackageHistory(package, user_id, 'del_flg', 'N', 'Y' );
      if(!historyVersion) throw new Error('History not updated');
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
