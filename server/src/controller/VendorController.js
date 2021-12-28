const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.searchVendorList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT vend_id,vend_nm,vend_nm_stnd,description,active,extrnl_sys_nm from cdascdi1d.cdascdi.vendor 
            WHERE (LOWER(vend_nm) LIKE $1 OR 
            LOWER(vend_nm_stnd) LIKE $2) and active = 1
            `;
    Logger.info({
      message: "vendorList",
    });

    DB.executeQuery(searchQuery, [`%${searchParam}%`, `%${searchParam}%`]).then((response) => {
      const vendors = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        records: vendors,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :vendorList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getVendorList = function (req, res) {
  try {
    let select = `vend_id,vend_id as value, vend_nm as label, vend_nm,vend_nm_stnd,description,active,extrnl_sys_nm`;
    let searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.vendor where active=1 order by vend_nm asc`;
    let dbQuery = DB.executeQuery(searchQuery);
    Logger.info({
      message: "vendorList",
    });

    dbQuery.then((response) => {
      const vendors = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        records: vendors,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :vendorList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getVendorById = function (req, res) {
  try {
    const id = req.params.vendor_id;
    const searchQuery = `SELECT vend_id,vend_nm,vend_nm_stnd,description,active,extrnl_sys_nm from cdascdi1d.cdascdi.vendor 
            WHERE vend_id = $1`;
    Logger.info({
      message: "vendorList",
    });

    DB.executeQuery(searchQuery, [id]).then((response) => {
      const vendors = response.rows[0] || null;
      return apiResponse.successResponseWithData(res, "Operation success", vendors);
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err)
    Logger.error("catch :vendorList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};