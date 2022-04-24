const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

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
    Logger.info({ message: "searchLocationList" });

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
    Logger.error("catch :searchLocationList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getLocationList = function (req, res) {
  try {
    let type = req.query.type || null;
    let select = `src_loc_id,src_loc_id as value,CONCAT(extrnl_sys_nm, ': ', loc_alias_nm) as label,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm,db_nm`;
    let searchQuery = `SELECT ${select} from ${schemaName}.source_location where active=1 order by label asc`;
    Logger.info({ message: "getLocationList" });
    if (type) {
      switch (type) {
        case "rdbms_only":
          searchQuery = `SELECT ${select} from ${schemaName}.source_location where loc_typ NOT IN('SFTP','FTPS') and active=1 order by label asc`;
          break;
        case "ftp_only":
          searchQuery = `SELECT ${select} from ${schemaName}.source_location where loc_typ IN('SFTP','FTPS') and active=1 order by label asc`;
          break;
        case "all":
          searchQuery = `SELECT ${select} from ${schemaName}.source_location order by label asc`;
          break;
        default:
          searchQuery = `SELECT ${select} from ${schemaName}.source_location where loc_typ = '${type}' and active=1 order by label asc`;
      }
    }

    Logger.info({ message: "locationList" });

    let dbQuery = DB.executeQuery(searchQuery, []);
    dbQuery
      .then(async (response) => {
        const locations = response.rows || [];

        const withCredentials = locations.map((d) => {
          if (d.pswd === "Yes") {
            // const credentials = helper.readVaultData(d.src_loc_id);
            // if (credentials) {
            //   d.pswd = credentials.password;
            // }
          } else if (d.pswd === "No") {
            d.pswd = "";
          }
          return d;
        });

        return apiResponse.successResponseWithData(res, "Operation success", {
          records: withCredentials,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getLocationList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getPassword = async function (req, res) {
  try {
    const id = req.params.location_id;
    Logger.info({ message: "getPasswordOfLocation" });
    const response = await helper.readVaultData(id);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      response
    );
  } catch (err) {
    Logger.error("catch :getPasswordOfLocation");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getLocationById = async function (req, res) {
  try {
    const id = req.params.location_id;
    const searchQuery = `SELECT src_loc_id,loc_typ,ip_servr,port,cnn_url,data_strc,active,extrnl_sys_nm,loc_alias_nm from ${schemaName}.source_location WHERE src_loc_id = $1`;
    Logger.info({ message: "getLocationById" });
    const response = await DB.executeQuery(searchQuery, [id]);
    if (response.rows[0]) {
      const credentials = await helper.readVaultData(id);
      return apiResponse.successResponseWithData(res, "Operation success", {
        ...response.rows[0],
        usr_nm: credentials.user,
        pswd: credentials.password,
      });
    }
    return apiResponse.successResponseWithData(res, "Operation success", null);
  } catch (err) {
    Logger.error("catch :getLocationById");
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
    const newId = helper.generateUniqueID();

    const body = [
      newId,
      values.locationType || null,
      values.ipServer || null,
      values.port || null,
      values.connURL || null,
      values.dataStructure || null,
      values.active == true ? 1 : 0,
      values.externalSytemName || null,
      values.locationName || null,
      values.userName,
      values.password ? "Yes" : "No",
      values.dbName || null,
    ];
    const searchQuery = `INSERT into ${schemaName}.source_location (src_loc_id, loc_typ, ip_servr, port, cnn_url, data_strc, active, extrnl_sys_nm, loc_alias_nm, usr_nm, pswd, insrt_tm, updt_tm, db_nm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, Now(), Now(), $12)`;
    Logger.info({ message: "storeLocation" });

    DB.executeQuery(searchQuery, body)
      .then(async (response) => {
        const vaultData = {
          user: values.userName || null,
          password: values.password || null,
        };
        await helper.writeVaultData(newId, vaultData);

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

exports.updateLocationData = async function (req, res) {
  try {
    const values = req.body;
    const { locationID } = values;
    Logger.info({ message: "updateLocation" });

    const isExist = await checkLocationExists(
      values.locationType,
      values.connURL,
      values.userName,
      values.dbName,
      values.externalSytemName,
      locationID
    );
    if (isExist > 0) {
      return apiResponse.ErrorResponse(
        res,
        "No duplicate locations are allowed"
      );
    }

    const vaultData = {
      user: values.userName || null,
      password: values.password || null,
    };

    await helper.writeVaultData(locationID, vaultData);

    const body = [
      values.locationType,
      values.ipServer || null,
      values.port || null,
      values.dataStructure || null,
      values.active === true ? 1 : 0,
      values.externalSytemName,
      values.locationName || null,
      values.dbName || null,
      values.connURL || null,
      values.userName,
      values.password ? "Yes" : "No",
      locationID,
    ];

    const selectQuery = `SELECT loc_typ, ip_servr, loc_alias_nm, port, usr_nm, pswd, cnn_url, data_strc, active, extrnl_sys_nm, updt_tm, db_nm FROM ${schemaName}.source_location where src_loc_id=$1`;

    const updateQuery = `UPDATE ${schemaName}.source_location set loc_typ=$1, ip_servr=$2, port=$3, data_strc=$4, active=$5, extrnl_sys_nm=$6, loc_alias_nm=$7, updt_tm=NOW(), db_nm=$8, cnn_url=$9, usr_nm=$10, pswd=$11 where src_loc_id=$12 returning *`;
    const updateLocation = await DB.executeQuery(updateQuery, body);
    const oldLocation = await DB.executeQuery(selectQuery, locationID);

    if (!updateLocation?.rowCount || !oldLocation?.rowCount) {
      return apiResponse.ErrorResponse(res, "Something went wrong on update");
    }

    const dfList = await DB.executeQuery(
      `select d.dataflowid from ${schemaName}.dataflow d where d.src_loc_id = $1`,
      [locationID]
    );

    if (dfList.rowCount > 0) {
      const locationObj = updateLocation.rows[0];
      const existingObj = oldLocation.rows[0];
      dfList?.rows?.forEach(async (row) => {
        const dataflowId = row.dataflowid;
        const comparisionObj = {
          loc_typ: values.locationType,
          ip_servr: values.ipServer || null,
          port: values.port || null,
          data_strc: values.dataStructure || null,
          active: values.active === true ? 1 : 0,
          extrnl_sys_nm: values.externalSytemName,
          loc_alias_nm: values.locationName || null,
          db_nm: values.dbName || null,
          cnn_url: values.connURL || null,
          usr_nm: values.userName || null,
          pswd: values.password ? "Yes" : "No",
        };
        const diffObj = helper.getdiffKeys(comparisionObj, existingObj);
        await addDataflowHistory({
          dataflowId,
          externalSystemName: "CDI",
          userId,
          config_json: locationObj,
          diffObj,
          existingObj,
        });
      });
    }

    await updateDataflowVersion(
      locationID,
      updateLocation.row,
      oldLocation.row,
      userId
    );

    return apiResponse.successResponseWithData(res, "Operation success", true);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateLocation");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.statusUpdate = async (req, res) => {
  try {
    const { id, status, userId } = req.body;
    const activeStatus = status === true ? 1 : 0;
    Logger.info({ message: "Location status Update" });

    const updateLocation = await DB.executeQuery(
      `UPDATE ${schemaName}.source_location SET updt_tm=NOW(), active=$1 WHERE src_loc_id=$2 returning *`,
      [activeStatus, id]
    );
    const oldLocation = await DB.executeQuery(
      `SELECT active FROM ${schemaName}.source_location where src_loc_id=$1`,
      id
    );

    if (!updateLocation?.rowCount || !oldLocation?.rowCount) {
      return apiResponse.ErrorResponse(res, "Something went wrong on update");
    }

    const dfList = await DB.executeQuery(
      `select d.dataflowid from ${schemaName}.dataflow d where d.src_loc_id = $1`,
      [id]
    );

    if (dfList.rowCount > 0) {
      const locationObj = updateLocation.rows[0];
      const existingObj = oldLocation.rows[0];
      dfList?.rows?.forEach(async (row) => {
        const dataflowId = row.dataflowid;
        const diffObj = helper.getdiffKeys(
          {
            active: activeStatus,
          },
          existingObj
        );
        await addDataflowHistory({
          dataflowId,
          externalSystemName: "CDI",
          userId,
          config_json: locationObj,
          diffObj,
          existingObj,
        });
      });
    }

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      updateLocation.rows
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :location status Update");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
