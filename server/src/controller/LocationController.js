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

exports.locationDetails = async (req, res) => {
  try {
    Logger.info({ message: "locationDetails" });
    const locationId = req.params.locationId;

    const query = `	select extrnl_sys_nm as "externalSystem", ld.cnn_drvr as "driverName", sl.loc_typ as "locationType", usr_nm as "connectionUserName", pswd, cnn_url as "connectionUrl" from  ${schemaName}.source_location sl inner join  ${schemaName}.location_details ld on sl.loc_typ = ld.loc_typ where sl.src_loc_id=$1`;
    const { rows } = await DB.executeQuery(query, [locationId]);
    let result = {};
    if (rows[0].pswd === "Yes") {
      const credentials = await helper.readVaultData(locationId);
      result = {
        ...rows[0],
        connectionPassword: credentials?.password,
      };
    } else {
      result = {
        ...rows[0],
        connectionPassword: "",
      };
    }

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      result
    );
  } catch (err) {
    Logger.error("catch :locationDetails");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

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

exports.getLocationList = async (req, res) => {
  try {
    let type = req.query.type || null;
    let select = `src_loc_id, src_loc_id as "ID", external_id as "ExternalID", src_loc_id as value, CONCAT(extrnl_sys_nm, ': ', loc_alias_nm) as label,loc_typ,ip_servr,port,usr_nm,pswd,cnn_url,data_strc,active,extrnl_sys_nm, loc_alias_nm,db_nm`;
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

    const response = await DB.executeQuery(searchQuery);
    const locations = response.rows || [];

    const withCredentials = await locations.map((d) => {
      if (d.pswd === "Yes") {
        // const credentials = await helper.readVaultData(d.src_loc_id);
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

exports.getServiceOwnersList = function (req, res) {
  try {
    let select = `call_back_url_id as value, serv_ownr as label`;
    let searchQuery = `SELECT ${select} from ${schemaName}.call_back_urls where actv_flg=1 order by serv_ownr asc`;
    let dbQuery = DB.executeQuery(searchQuery);
    Logger.info({ message: "serviceOwnerList" });

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
    const { id, status, userId } = req.body;
    const activeStatus = status === true ? 1 : 0;
    Logger.info({ message: "Location status Update" });
    const curDate = helper.getCurrentTime();

    const updateLocation = await DB.executeQuery(
      `UPDATE ${schemaName}.source_location SET updt_tm=$3, active=$1 WHERE src_loc_id=$2 returning *`,
      [activeStatus, id, curDate]
    );
    const oldLocation = await DB.executeQuery(
      `SELECT active FROM ${schemaName}.source_location where src_loc_id=$1`,
      [id]
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
        await addLocationCDHHistory({
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

const $insertLocation = `INSERT into ${schemaName}.source_location (src_loc_id, loc_typ, ip_servr, port, cnn_url, data_strc, active, extrnl_sys_nm, loc_alias_nm, usr_nm, pswd, insrt_tm, updt_tm, db_nm, external_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;
const $selectLocation = `SELECT loc_typ, ip_servr, loc_alias_nm, port, usr_nm, pswd, cnn_url, data_strc, active, extrnl_sys_nm, updt_tm, db_nm, external_id FROM ${schemaName}.source_location WHERE src_loc_id=$1`;
const $updateLocation = `UPDATE ${schemaName}.source_location set loc_typ=$1, ip_servr=$2, port=$3, data_strc=$4, active=$5, extrnl_sys_nm=$6, loc_alias_nm=$7, updt_tm=$13, db_nm=$8, cnn_url=$9, usr_nm=$10, pswd=$11, external_id=$12 WHERE src_loc_id=$13 returning *`;
const $selectExternalId = `SELECT loc_typ, ip_servr, loc_alias_nm, port, usr_nm, pswd, cnn_url, data_strc, active, extrnl_sys_nm, updt_tm, db_nm, src_loc_id FROM ${schemaName}.source_location WHERE external_id=$1`;

exports.saveLocationData = async function (req, res) {
  Logger.info({ message: "storeLocation" });
  try {
    const {
      ExternalId,
      locationID,
      active,
      locationName,
      locationType,
      ipServer,
      dataStructure,
      externalSystemName,
      systemName,
      connURL,
      dbName,
      port,
      userName,
      password,
    } = req.body;

    let existingLoc = "";

    if (ExternalId) {
      existingLoc = await DB.executeQuery($selectExternalId, [ExternalId]);
    }

    if (locationID) {
      existingLoc = await DB.executeQuery($selectLocation, [locationID]);
    }

    // construct connURL for external system
    const newURL = await helper.generateConnectionURL(
      locationType,
      ipServer,
      port,
      dbName
    );

    const curDate = helper.getCurrentTime();
    const newId = helper.generateUniqueID();

    const updatedURL = connURL || newURL;
    const updatedID = locationID || existingLoc[0]?.src_loc_id || newId;

    // check for location exist
    const isExist = await checkLocationExists(
      locationType,
      updatedURL,
      userName,
      dbName,
      externalSystemName,
      locationID || existingLoc[0]?.src_loc_id || null
    );

    if (isExist > 0) {
      return apiResponse.ErrorResponse(
        res,
        "No duplicate locations are allowed"
      );
    }

    const body = [
      curDate,
      locationName,
      locationType,
      dataStructure,
      externalSystemName,
      active === true ? 1 : 0,
      userName,
      password ? "Yes" : "No",
      ipServer,
      updatedURL,
      port || null,
      dbName || null,
      ExternalId || null,
      updatedID,
    ];

    const vaultData = {
      user: userName,
      password,
    };

    // write password to vault
    if (password === "Yes") {
      await helper.writeVaultData(updatedID, vaultData);
    }

    // create location
    if ((systemName === "CDI" && !locationID) || !existingLoc?.rowCount) {
      await DB.executeQuery($insertLocation, body);
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        true
      );
    } else {
      // update location
      const updateLocation = await DB.executeQuery($updateLocation, body);

      if (!updateLocation?.rowCount || !existingLoc?.rowCount) {
        return apiResponse.ErrorResponse(res, "Something went wrong");
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
            extrnl_sys_nm: values.externalSystemName,
            loc_alias_nm: values.locationName || null,
            db_nm: values.dbName || null,
            cnn_url: values.connURL || null,
            usr_nm: values.userName || null,
            pswd: values.password ? "Yes" : "No",
          };
          const diffObj = helper.getdiffKeys(comparisionObj, existingObj);
          await addLocationCDHHistory({
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
        true
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :storeLocation");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

// exports.saveLocationData = async function (req, res) {
//   try {
//     const values = req.body;
//     const isExist = await checkLocationExists(
//       values.locationType,
//       values.connURL,
//       values.userName,
//       values.dbName,
//       values.externalSystemName
//     );
//     if (isExist > 0) {
//       return apiResponse.ErrorResponse(
//         res,
//         "No duplicate locations are allowed"
//       );
//     }
//     const newId = helper.generateUniqueID();
//     const curDate = helper.getCurrentTime();

//     const body = [
//       newId,
//       values.locationType || null,
//       values.ipServer || null,
//       values.port || null,
//       values.connURL || null,
//       values.dataStructure || null,
//       values.active == true ? 1 : 0,
//       values.externalSystemName || null,
//       values.locationName || null,
//       values.userName,
//       values.password ? "Yes" : "No",
//       curDate,
//       curDate,
//       values.dbName || null,
//     ];

//     const searchQuery = `INSERT into ${schemaName}.source_location (src_loc_id, loc_typ, ip_servr, port, cnn_url, data_strc, active, extrnl_sys_nm, loc_alias_nm, usr_nm, pswd, insrt_tm, updt_tm, db_nm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
//     Logger.info({ message: "storeLocation" });

//     DB.executeQuery(searchQuery, body)
//       .then(async (response) => {
//         const vaultData = {
//           user: values.userName || null,
//           password: values.password || null,
//         };
//         await helper.writeVaultData(newId, vaultData);

//         return apiResponse.successResponseWithData(
//           res,
//           "Operation success",
//           true
//         );
//       })
//       .catch((err) => {
//         return apiResponse.ErrorResponse(res, err.message);
//       });
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :storeLocation");
//     Logger.error(err);
//     return apiResponse.ErrorResponse(res, err);
//   }
// };

// exports.updateLocationData = async function (req, res) {
//   try {
//     const values = req.body;
//     const { locationID } = values;
//     Logger.info({ message: "updateLocation" });

//     const isExist = await checkLocationExists(
//       values.locationType,
//       values.connURL,
//       values.userName,
//       values.dbName,
//       values.externalSystemName,
//       locationID
//     );
//     if (isExist > 0) {
//       return apiResponse.ErrorResponse(
//         res,
//         "No duplicate locations are allowed"
//       );
//     }

//     const curDate = helper.getCurrentTime();

//     const vaultData = {
//       user: values.userName || null,
//       password: values.password || null,
//     };

//     await helper.writeVaultData(locationID, vaultData);

//     const body = [
//       values.locationType,
//       values.ipServer || null,
//       values.port || null,
//       values.dataStructure || null,
//       values.active === true ? 1 : 0,
//       values.externalSystemName,
//       values.locationName || null,
//       values.dbName || null,
//       values.connURL || null,
//       values.userName,
//       values.password ? "Yes" : "No",
//       locationID,
//       curDate,
//     ];

//     const selectQuery = `SELECT loc_typ, ip_servr, loc_alias_nm, port, usr_nm, pswd, cnn_url, data_strc, active, extrnl_sys_nm, updt_tm, db_nm FROM ${schemaName}.source_location where src_loc_id=$1`;

//     const updateQuery = `UPDATE ${schemaName}.source_location set loc_typ=$1, ip_servr=$2, port=$3, data_strc=$4, active=$5, extrnl_sys_nm=$6, loc_alias_nm=$7, updt_tm=$13, db_nm=$8, cnn_url=$9, usr_nm=$10, pswd=$11 where src_loc_id=$12 returning *`;
//     const updateLocation = await DB.executeQuery(updateQuery, body);
//     const oldLocation = await DB.executeQuery(selectQuery, [locationID]);

//     if (!updateLocation?.rowCount || !oldLocation?.rowCount) {
//       return apiResponse.ErrorResponse(res, "Something went wrong on update");
//     }

//     const dfList = await DB.executeQuery(
//       `select d.dataflowid from ${schemaName}.dataflow d where d.src_loc_id = $1`,
//       [locationID]
//     );

//     if (dfList.rowCount > 0) {
//       const locationObj = updateLocation.rows[0];
//       const existingObj = oldLocation.rows[0];
//       dfList?.rows?.forEach(async (row) => {
//         const dataflowId = row.dataflowid;
//         const comparisionObj = {
//           loc_typ: values.locationType,
//           ip_servr: values.ipServer || null,
//           port: values.port || null,
//           data_strc: values.dataStructure || null,
//           active: values.active === true ? 1 : 0,
//           extrnl_sys_nm: values.externalSystemName,
//           loc_alias_nm: values.locationName || null,
//           db_nm: values.dbName || null,
//           cnn_url: values.connURL || null,
//           usr_nm: values.userName || null,
//           pswd: values.password ? "Yes" : "No",
//         };
//         const diffObj = helper.getdiffKeys(comparisionObj, existingObj);
//         await addLocationCDHHistory({
//           dataflowId,
//           externalSystemName: "CDI",
//           userId,
//           config_json: locationObj,
//           diffObj,
//           existingObj,
//         });
//       });
//     }

//     return apiResponse.successResponseWithData(res, "Operation success", true);
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :updateLocation");
//     Logger.error(err);
//     return apiResponse.ErrorResponse(res, err);
//   }
// };
