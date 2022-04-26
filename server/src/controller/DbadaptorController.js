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
      // externalSystem,
    } = req.req.body;
    //get connection
    // let dbname = connectionUrl.split("/")[3];
    //let q = `select table_name as tableName from information_schema.tables where table_schema = 'cdascfg'`;
    //let q = "SELECT table_name as tableName FROM information_schema.tables;";
    //let q = "SELECT table_name as tableName FROM all_tables";
    let q = ``;
    switch (locationType?.toLowerCase()) {
      case "oracle":
        q = `SELECT table_name as "tableName" FROM all_tables FETCH FIRST 10 ROWS ONLY`;
        break;
      case "sqlserver":
        q = `SELECT name as "tableName" FROM sys.Tables LIMIT 10`;
        break;
      case "sql server":
        q = `SELECT name as "tableName" FROM sys.Tables LIMIT 10`;
        break;
      case "hive cdh":
        q = `show tables`;
        break;
      case "hivecdh":
        q = `show tables`;
        break;
      case "hivecdp":
        q = `show tables`;
        break;
      case "hive cdp":
        q = `show tables`;
        break;
      case "mysql":
        q = `show tables as "tableName" LIMIT 10`;
        break;
      case "my sql":
        q = `show tables as "tableName" LIMIT 10`;
        break;
      case "postgresql":
        q = `SELECT table_name as "tableName" FROM information_schema.tables LIMIT 10`;
        break;
      case "postgre sql":
        q = `SELECT table_name as "tableName" FROM information_schema.tables LIMIT 10`;
        break;
      default:
        q = `SELECT table_name as "tableName" FROM information_schema.tables LIMIT 10`;
        break;
    }

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
    let q = ``;
    switch (locationType?.toLowerCase()) {
      case "postgresql":
        q = `SELECT c.COLUMN_NAME as "columnName",c.DATA_TYPE as "datatype"
    ,CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'true' ELSE 'false' END AS "primaryKey"
    ,CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'true' ELSE 'false' END AS required
    ,case when pk.COLUMN_NAME IS null then 'false' else 'true' end as unique
    FROM INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN(
    SELECT ku.TABLE_CATALOG,ku.TABLE_SCHEMA,ku.TABLE_NAME,ku.COLUMN_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
    ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
    )pk
    ON c.TABLE_CATALOG = pk.TABLE_CATALOG
    AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
    AND c.TABLE_NAME = pk.TABLE_NAME
    AND c.COLUMN_NAME = pk.COLUMN_NAME
    where c.TABLE_NAME ='${tableName}'`;
        break;

      case "oracle":
        q = `SELECT a.COLUMN_NAME AS "columnName",a.DATA_TYPE AS "datatype",
      CASE WHEN c.CONSTRAINT_TYPE ='P' THEN 'true'
      ELSE 'false' END AS "primaryKey",
      CASE WHEN c.CONSTRAINT_TYPE IN ('U','P') THEN 'true'
      ELSE 'false' END AS "unique",
      CASE WHEN a.NULLABLE ='N' THEN 'true'
      ELSE 'false' END AS  "required"
      FROM ALL_TAB_COLUMNS a
      LEFT JOIN ALL_CONS_COLUMNS b ON (a.TABLE_NAME=b.table_name AND a.COLUMN_NAME=b.COLUMN_NAME)
      LEFT JOIN ALL_CONSTRAINTS c ON (b.CONSTRAINT_NAME=c.CONSTRAINT_NAME)
      WHERE a.table_name='${tableName}'`;
        break;

      case "sqlserver":
        q = `select c.name columnName,t1.name as dataType,
      case when c.is_nullable=1 then 'yes' else 'no' end as required,
      case when r.ConstraintType in ('PK' , 'UQ') then 'Yes' else 'No' end as "unique",
      case when r.ConstraintType in ('PK') then 'Yes' else 'No' end as primaryKey from sys.tables t
      inner join sys.columns c on (t.object_id=c.object_id)
      inner join sys.types t1 on (c.user_type_id=t1.user_type_id)
      left join (select t.[name] as tablename, c.[type] as ConstraintType ,
      isnull(c.[name], i.[name]) as constraint_name,
      substring(column_names, 1, len(column_names)-1) as [details]
      from sys.objects t
      left outer join sys.indexes i
      on t.object_id = i.object_id
      left outer join sys.key_constraints c
      on i.object_id = c.parent_object_id
      and i.index_id = c.unique_index_id
      cross apply (select col.[name] + ', '
      from sys.index_columns ic
      inner join sys.columns col
      on ic.object_id = col.object_id
      and ic.column_id = col.column_id
      where ic.object_id = t.object_id
      and ic.index_id = i.index_id
      order by col.column_id
      for xml path ('') ) D (column_names)
      where is_unique = 1
      and t.is_ms_shipped <> 1) r on (t.name=r.tablename and c.name=r.details)
      where t.name ='${tableName}'`;
        break;

      case "hive cdp":
        q = `describe ${tableName}`;
        break;

      case "hive cdh":
        q = `describe ${tableName}`;
        break;

      case "impala":
        q = `describe ${tableName}`;
        break;

      case "mysql":
        q = `SHOW COLUMNS FROM ${tableName}`;
        break;
    }

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
