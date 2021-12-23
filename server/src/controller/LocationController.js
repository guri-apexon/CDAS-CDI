const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.searchLocationList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm from cdascdi1d.cdascdi.location 
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
    let select = `loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm`;
    let searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.location`;
    let dbQuery = DB.executeQuery(searchQuery);
    if(type) {
        switch(type) {
            case 'rdbms_only':
                searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.location where loc_typ NOT IN('SFTP','FTPS')`;
                dbQuery = DB.executeQuery(searchQuery);
            break;
            case 'ftp_only':
                searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.location where loc_typ IN('SFTP','FTPS')`;
                dbQuery = DB.executeQuery(searchQuery);
            break;
            default:
                searchQuery = `SELECT ${select} from cdascdi1d.cdascdi.location where loc_typ = $1`;
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
    const searchQuery = `SELECT loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm from cdascdi1d.cdascdi.location 
            WHERE loc_id = $1`;
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