const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.searchLocationList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT src_loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm from cdascdi1d.cdascdi.source_location 
            WHERE LOWER(loc_typ) LIKE $1 OR 
            LOWER(loc_alias_nm) LIKE $2
            `;
    Logger.info({
      message: "locationList",
    });

    DB.executeQuery(searchQuery, [`%${searchParam}%`, `%${searchParam}%`]).then((response) => {
      const locations = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        records: locations,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :locationList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getLocationList = function (req, res) {
  try {
    let type = req.query.type || null;
    let select = `src_loc_id,src_loc_id as value,loc_alias_nm as label, loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm`;
    let searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.source_location`;
    let dbQuery = DB.executeQuery(searchQuery);
    if(type) {
        switch(type) {
            case 'rdbms_only':
                searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.source_location where loc_typ NOT IN('SFTP','FTPS')`;
                dbQuery = DB.executeQuery(searchQuery);
            break;
            case 'ftp_only':
                searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.source_location where loc_typ IN('SFTP','FTPS')`;
                dbQuery = DB.executeQuery(searchQuery);
            break;
            default:
                searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.source_location where loc_typ = $1`;
                dbQuery = DB.executeQuery(searchQuery, [type]);
        }
    }
    Logger.info({
      message: "locationList",
    });

    dbQuery.then((response) => {
      const locations = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", {
        records: locations,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :locationList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getLocationById = function (req, res) {
  try {
    const id = req.params.location_id;
    const searchQuery = `SELECT src_loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm from cdascdi1d.cdascdi.source_location 
            WHERE src_loc_id = $1`;
    Logger.info({
      message: "locationList",
    });

    DB.executeQuery(searchQuery, [id]).then((response) => {
      const locations = response.rows[0] || null;
      return apiResponse.successResponseWithData(res, "Operation success", locations);
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err)
    Logger.error("catch :locationList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.saveLocationData = function (req, res) {
  try {
    const values = req.body;
    const body = [
      values.locationType || null,
      values.ipServer || null,
      values.port || null,
      values.userName || null,
      values.password || null,
      values.connURL || null,
      values.dataStructure || null,
      values.active == true ? 1 : 0,
      values.externalSytemName || null,
      values.locationName || null,
      null,
      new Date(),
      new Date()
    ];
    const searchQuery = `INSERT into cdascdi1d.cdascdi.source_location (loc_typ, ip_servr, port, usr_nm, pswd, cnn_url, data_strc, active, extrnl_sys_nm, loc_alias_nm, serv_ownr, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
    Logger.info({
      message: "storeLocation",
    });
    DB.executeQuery(searchQuery, body).then((response) => {
      const location = response || null;
      console.log(location, "location");
      return apiResponse.successResponseWithData(res, "Operation success", location);
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err)
    Logger.error("catch :storeLocation");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};