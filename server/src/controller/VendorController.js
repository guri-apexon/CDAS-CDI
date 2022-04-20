const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.searchVendorList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT vend_id,vend_nm,vend_nm_stnd,description,active,extrnl_sys_nm from ${schemaName}.vendor 
            WHERE (LOWER(vend_nm) LIKE $1 OR 
            LOWER(vend_nm_stnd) LIKE $2) and active = 1
            `;
    Logger.info({
      message: "vendorList",
    });

    DB.executeQuery(searchQuery, [`%${searchParam}%`, `%${searchParam}%`]).then(
      (response) => {
        const vendors = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: vendors,
          totalSize: response.rowCount,
        });
      }
    );
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
    let searchQuery = `SELECT ${select} from ${schemaName}.vendor where active=1 and vend_nm != '' order by vend_nm asc`;
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
    const searchQuery = `SELECT vend_id,vend_nm,vend_nm_stnd,description,active,extrnl_sys_nm from ${schemaName}.vendor 
            WHERE vend_id = $1`;
    Logger.info({
      message: "vendorList",
    });

    DB.executeQuery(searchQuery, [id]).then((response) => {
      const vendors = response.rows[0] || null;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        vendors
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :vendorList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.createVendor = async (req, res) => {
  try {
    const {
      verdorId,
      vendorName,
      vendorNameStd,
      description,
      externalSystemName,
    } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO ${schemaName}.vendor
    (vend_id, vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, insrt_tm, updt_tm)
    VALUES($2, $3, $4, $5, 0, $6, $1, $1)`;

    Logger.info({
      message: "createVendor",
    });
    const inset = await DB.executeQuery(insertQuery, [
      curDate,
      verdorId,
      vendorName,
      vendorNameStd,
      description,
      externalSystemName,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :createVendor");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const {
      verdorId,
      vendorName,
      vendorStatus,
      description,
      externalSystemName,
    } = req.body;
    const curDate = new Date();
    const query = `UPDATE ${schemaName}.vendor
    SET vend_nm=$3, description=$4, active=$5, updt_tm=$1
    WHERE vend_id=$2 AND extrnl_sys_nm=$6`;

    Logger.info({
      message: "updateVendor",
    });

    const up = await DB.executeQuery(query, [
      curDate,
      verdorId,
      vendorName,
      description,
      vendorStatus,
      externalSystemName,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", up);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateVendor");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
