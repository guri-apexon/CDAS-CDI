const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const jdbc = require("../config/JDBC");
const { response } = require("express");

exports.listtables = async (res, req) => {
  try {
    let {
      locationType,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      driverName,
      externalSystem,
    } = req.req.body;
    //get connection
    let dbname = connectionUrl.split("/")[3];
    //let q = `select table_name as tableName from information_schema.tables where table_schema = 'cdascfg'`;
    //let q = "SELECT table_name as tableName FROM information_schema.tables;";
    let q = "SELECT table_name as tableName FROM all_tables";

    let newConn = await jdbc(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName,
      q,
      "Connectivity Successful",
      res.res
    );
  } catch (error) {
    console.log(error);
    Logger.error("catch :listtables");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.tablecolumns = async (res, req) => {
  try {
    let responseBody = {};
    let {
      locationType,
      tableName,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      driverName,
      externalSystem,
    } = req.req.body;
    let q = `SELECT  c.COLUMN_NAME as columnName,c.DATA_TYPE as dataType, c.is_nullable
    ,CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'true' ELSE 'false' END AS primaryKey
FROM INFORMATION_SCHEMA.COLUMNS c
LEFT JOIN (
   SELECT ku.TABLE_CATALOG,ku.TABLE_SCHEMA,ku.TABLE_NAME,ku.COLUMN_NAME
   FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
   INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
       ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
       AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
)   pk 
ON  c.TABLE_CATALOG = pk.TABLE_CATALOG
   AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
   AND c.TABLE_NAME = pk.TABLE_NAME
   AND c.COLUMN_NAME = pk.COLUMN_NAME
   where c.TABLE_NAME ='${tableName}'
ORDER BY c.COLUMN_NAME`;
    let newConn = await jdbc(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName,
      q,
      "Successful Execution",
      res.res
    );
  } catch (error) {
    console.log(error);
    Logger.error("catch :listtables");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, err);
  }
};
