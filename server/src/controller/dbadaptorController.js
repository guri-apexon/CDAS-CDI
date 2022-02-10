const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.listtables = async () => {
  try {
    let responseBody = {};
    let {
      locationType,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      driverName,
      externalSystem,
    } = req.body;
    //get connection
    let newConn = await sqlConnection(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName
    );

    let q = `select tableName from information_schema.tables`;
    let result = await newConn.query(q);
    responseBody.tableMetadataList = result;
    return apiResponse.successResponseWithData(
      res,
      "Connectivity Successful",
      responseBody
    );
  } catch (error) {
    console.log(err);
    Logger.error("catch :listtables");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.tablecolumns = async () => {
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
    //get connection
    let newConn = await sqlConnection(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName
    );
    let q = `select * from information_schema.tablesSELECT *
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION`;
    let result = await newConn.query(q);
    responseBody.columnCount = result.length;
    responseBody.columnInfo = result;
    return apiResponse.successResponseWithData(
      res,
      "Successful Execution",
      responseBody
    );
  } catch (error) {
    console.log(err);
    Logger.error("catch :listtables");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
