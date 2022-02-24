const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

async function updateDataflowVersion(locationId, location, userId) {
  const searchQuery = `select d.src_loc_id, d.dataflowid, max(dv."version") as "version" from ${schemaName}.dataflow d inner join ${schemaName}.dataflow_version dv on dv.dataflowid = d.dataflowid where d.src_loc_id = $1 group by d.dataflowid `;
  const dep = [locationId];
  const res = await DB.executeQuery(searchQuery, dep);
  if (res.rowCount > 0) {
    const rows = res.rows;
    rows.forEach((row) => {
      const version = row.version + 1;
      const dataflowid = row.dataflowid;
      const config_json = {
        dataflowid,
        location,
      };
      const insertBody = [dataflowid, version, config_json, userId, new Date()];
      const insertQuery = `INSERT into ${schemaName}.dataflow_version (dataflowid, "version", config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`;
      DB.executeQuery(insertQuery, insertBody);
    });
  }
  return null;
}

async function checkLocationExists(
  locationType = "",
  cnUnl = "",
  u_name = "",
  db_name = "",
  esys_nm = "",
  loc_id = null
) {
  const locType = locationType.toLowerCase();
  const connUrl = cnUnl ? cnUnl.toLowerCase() : null;
  const uname = u_name ? u_name.toLowerCase() : null;
  const dbname = db_name ? db_name.toLowerCase() : null;
  const exsys_nm = esys_nm ? esys_nm.toLowerCase() : null;
  let searchQuery = `SELECT src_loc_id from ${schemaName}.source_location where LOWER(loc_typ)=$1 and LOWER(cnn_url)=$2 and LOWER(usr_nm)=$3 and LOWER(extrnl_sys_nm)=$4 and LOWER(db_nm)=$5`;
  let dep = [locType, connUrl, uname, exsys_nm, dbname];
  if (loc_id) {
    searchQuery = `SELECT src_loc_id from ${schemaName}.source_location where LOWER(loc_typ) = $1 and  LOWER(cnn_url) = $2 and LOWER(usr_nm) = $3 and LOWER(extrnl_sys_nm) = $4 and LOWER(db_nm)=$5 and src_loc_id != $6`;
    dep = [locType, connUrl, uname, exsys_nm, dbname, loc_id];
  }
  if (locType === "sftp" || locType === "ftps") {
    searchQuery = `SELECT src_loc_id from ${schemaName}.source_location where LOWER(loc_typ) = $1 and  LOWER(cnn_url) = $2 and LOWER(usr_nm) = $3 and LOWER(extrnl_sys_nm) = $4`;
    dep = [locType, connUrl, uname, exsys_nm];
    if (loc_id) {
      searchQuery = `SELECT src_loc_id from ${schemaName}.source_location where LOWER(loc_typ) = $1 and  LOWER(cnn_url) = $2 and LOWER(usr_nm) = $3 and LOWER(extrnl_sys_nm) = $4 and src_loc_id != $5`;
      dep = [locType, connUrl, uname, exsys_nm, loc_id];
    }
  }
  const res = await DB.executeQuery(searchQuery, dep);
  return res.rowCount;
}

exports.checkLocationExistsInDataFlow = async function (req, res) {
  try {
    const locId = req.params.location_id;
    const searchQuery = `SELECT src_loc_id from ${schemaName}.dataflow where src_loc_id=$1`;
    const dep = [locId];
    const response = await DB.executeQuery(searchQuery, dep);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      response.rowCount
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.searchLocationList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT src_loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm,db_nm from ${schemaName}.source_location 
            WHERE LOWER(loc_typ) LIKE $1 OR 
            LOWER(loc_alias_nm) LIKE $2
            `;
    Logger.info({
      message: "locationList",
    });

    DB.executeQuery(searchQuery, [`%${searchParam}%`, `%${searchParam}%`])
      .then((response) => {
        const locations = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: locations,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
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
    let select = `src_loc_id,src_loc_id as value,CONCAT(extrnl_sys_nm, ': ', loc_alias_nm) as label, loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm,db_nm`;
    let searchQuery = `SELECT ${select} from ${schemaName}.source_location where active=1 order by label asc`;
    let dbQuery = DB.executeQuery(searchQuery);
    if (type) {
      switch (type) {
        case "rdbms_only":
          searchQuery = `SELECT ${select} from ${schemaName}.source_location where loc_typ NOT IN('SFTP','FTPS') and active=1 order by label asc`;
          dbQuery = DB.executeQuery(searchQuery);
          break;
        case "ftp_only":
          searchQuery = `SELECT ${select} from ${schemaName}.source_location where loc_typ IN('SFTP','FTPS') and active=1 order by label asc`;
          dbQuery = DB.executeQuery(searchQuery);
          break;
        case "all":
          searchQuery = `SELECT ${select} from ${schemaName}.source_location order by label asc`;
          dbQuery = DB.executeQuery(searchQuery);
          break;
        default:
          searchQuery = `SELECT ${select} from ${schemaName}.source_location where loc_typ = $1 and active=1 order by label asc`;
          dbQuery = DB.executeQuery(searchQuery, [type]);
      }
    }
    Logger.info({
      message: "locationList",
    });

    dbQuery
      .then((response) => {
        const locations = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: locations,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
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
    const searchQuery = `SELECT src_loc_id,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm from ${schemaName}.source_location 
            WHERE src_loc_id = $1`;
    Logger.info({
      message: "locationList",
    });

    DB.executeQuery(searchQuery, [id])
      .then((response) => {
        const locations = response.rows[0] || null;
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          locations
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :locationList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateLocationData = async function (req, res) {
  try {
    const values = req.body;
    const isExist = await checkLocationExists(
      values.locationType,
      values.connURL,
      values.userName,
      values.dbName,
      values.externalSytemName,
      values.locationID
    );
    if (isExist > 0) {
      return apiResponse.ErrorResponse(
        res,
        "No duplicate locations are allowed"
      );
    }
    var userId = req.headers["userid"];
    const body = [
      values.locationType || null,
      values.ipServer || null,
      values.port || null,
      values.userName || null,
      values.password || null,
      values.dataStructure || null,
      values.active == true ? 1 : 0,
      values.externalSytemName || null,
      values.locationName || null,
      new Date(),
      values.locationID,
      values.dbName || null,
      values.connURL || null,
    ];
    const searchQuery = `UPDATE ${schemaName}.source_location set loc_typ=$1, ip_servr=$2, port=$3, usr_nm=$4, pswd=$5, data_strc=$6, active=$7, extrnl_sys_nm=$8, loc_alias_nm=$9, updt_tm=$10, db_nm=$12, cnn_url=$13 where src_loc_id=$11`;
    Logger.info({
      message: "updateLocation",
    });
    DB.executeQuery(searchQuery, body)
      .then(async (response) => {
        await updateDataflowVersion(values.locationID, values, userId);
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          true
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateLocation");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.saveLocationData = async function (req, res) {
  try {
    const values = req.body;
    const isExist = await checkLocationExists(
      values.locationType,
      values.connURL,
      values.userName,
      values.dbName,
      values.externalSytemName
    );
    if (isExist > 0) {
      return apiResponse.ErrorResponse(
        res,
        "No duplicate locations are allowed"
      );
    }
    const body = [
      helper.generateUniqueID(),
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
      new Date(),
      new Date(),
      values.dbName || null,
    ];
    const searchQuery = `INSERT into ${schemaName}.source_location (src_loc_id, loc_typ, ip_servr, port, usr_nm, pswd, cnn_url, data_strc, active, extrnl_sys_nm, loc_alias_nm, insrt_tm, updt_tm, db_nm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
    Logger.info({
      message: "storeLocation",
    });
    DB.executeQuery(searchQuery, body)
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          true
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :storeLocation");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getServiceOwnersList = function (req, res) {
  try {
    let select = `call_back_url_id as value, serv_ownr as label`;
    let searchQuery = `SELECT ${select} from ${schemaName}.call_back_urls where actv_flg=1 order by serv_ownr asc`;
    let dbQuery = DB.executeQuery(searchQuery);
    Logger.info({
      message: "serviceOwnerList",
    });

    dbQuery
      .then((response) => {
        const vendors = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: vendors,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :serviceOwnerList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
exports.statusUpdate = async (req, res) => {
  try {
    const { id, status } = req.body;
    const curDate = new Date();
    Logger.info({
      message: "statusUpdate",
    });
    const $query = `UPDATE ${schemaName}.source_location SET active=$1, updt_tm=$2 WHERE src_loc_id=$3`;
    const details = await DB.executeQuery($query, [
      status == true ? 1 : 0,
      curDate,
      id,
    ]);
    var userId = req.headers["userid"];
    await updateDataflowVersion(id, { active: status == true ? 1 : 0 }, userId);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      details.row || null
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :statusUpdate");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
