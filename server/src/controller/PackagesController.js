const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const crypto = require("crypto");
const moment = require("moment");

exports.searchList = function (req, res) {
  try {
    const searchParam = req.params.query?.toLowerCase() || '';
    const searchQuery = `SELECT datapackageid, name, active, type from cdascdi1d.cdascdi.datapackage 
            WHERE LOWER(name) LIKE '%${searchParam}%' AND del_flg = 'N'`;
    Logger.info({
      message: "packagesList",
    });

    DB.executeQuery(searchQuery).then((response) => {
      const packages = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        data: packages,
        data_count: packages.length,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :List");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
exports.addPackage = function (req, res) {
  try {
    const packageID = crypto.randomBytes(3*4).toString('base64');
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const { compression_type, naming_convention, package_password, sftp_path } = req.body;
    const query = `INSERT INTO cdascdi1d.cdascdi.datapackage(datapackageid, type, name, path, password, active, insrt_tm, updt_tm, del_flg) VALUES('${packageID}', '${compression_type}', '${naming_convention}', '${sftp_path}','${package_password}',  '1','${currentTime}','${currentTime}', 'N')`;
    Logger.info({
      message: "AddPackage",
    });

    DB.executeQuery(query).then((response) => {
      const packages = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :addPackage");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.changeStatus = function (req, res) {
  try {
    const { active, package_id } = req.body;
    const query = `UPDATE cdascdi1d.cdascdi.datapackage
    SET active = ${active}
    WHERE datapackageid = '${package_id}'`;
    Logger.info({
      message: "ActivePackage",
    });

    DB.executeQuery(query).then((response) => {
      const packages = response.rows || [];
      return apiResponse.successResponseWithData(res, "Updated successfully", {
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :packageActive");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
exports.deletePackage = function (req, res) {
  try {
    const packageId = req.params.ID;
    const query = `UPDATE cdascdi1d.cdascdi.datapackage
    SET del_flg = 'Y'
    WHERE datapackageid = '${packageId}'`;
    console.log('query', query);
    Logger.info({
      message: "DeletePackage",
    });

    DB.executeQuery(query).then((response) => {
      const packages = response.rows || [];
      return apiResponse.successResponseWithData(res, "Deleted successfully", {
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :locationList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};