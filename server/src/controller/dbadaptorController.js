const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const jdbc = require("../config/JDBC");

exports.listtables = async (res, req) => {
  try {
    let {
      locationType,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      driverName,
      externalSystem,
    } = req.body;
    //get connection
    let dbname = connectionUrl.split("/")[3];
    let q = `select table_name as tableName from information_schema.tables where table_schema = '${dbname}'`;
    let newConn = await jdbc(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName,
      q,
      "Connectivity Successful",
      res
    );
  } catch (error) {
    console.log(err);
    Logger.error("catch :listtables");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
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
    } = req.body;
    let q = `SELECT COLUMN_NAME as columnName , 
    DATA_TYPE as dataType, 
    IS_NULLABLE as required, 
    COLUMN_KEY as primaryKey,
    COLUMN_KEY as unique
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION`;
    let newConn = await jdbc(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName,
      q,
      "Successful Execution",
      res
    );
  } catch (error) {
    console.log(err);
    Logger.error("catch :listtables");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
