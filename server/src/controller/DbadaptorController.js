const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const jdbc = require("../config/JDBC");

exports.listTables = async (req, res) => {
  try {
    let {
      locationType,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      driverName,
      // externalSystem,
    } = req.body;

    let q = ``;
    switch (locationType?.toLowerCase()) {
      case "oracle":
        q = `SELECT table_name as "tableName" FROM user_tables UNION select view_name FROM user_views`;
        break;
      case "sqlserver":
      case "sql server":
        q = `SELECT name as "tableName" FROM sys.Tables`;
        break;
      case "hive cdh":
      case "hivecdh":
      case "hivecdp":
      case "hive cdp":
        q = `show tables`;
        break;
      case "mysql":
      case "my sql":
      case "postgresql":
      case "postgre sql":
        q = `SELECT table_name as "tableName" FROM information_schema.tables`;
        break;
      default:
        q = `SELECT table_name as "tableName" FROM information_schema.tables`;
        break;
    }

    let newConn = await jdbc(
      connectionUserName,
      connectionPassword,
      connectionUrl,
      driverName,
      q,
      "Connectivity Successful",
      res,
      "fetchTables"
    );
  } catch (error) {
    Logger.error("catch :listTables");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.tablecolumns = async (req, res) => {
  try {
    let {
      locationType,
      tableName,
      connectionPassword,
      connectionUserName,
      connectionUrl,
      driverName,
      externalSystem,
    } = req.body;
    let q = ``;
    if (!tableName) {
      return apiResponse.ErrorResponse(
        res,
        "Table name is missing. Please provide table name to get columns"
      );
    }
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
        q = `select "columnName", "datatype", "primaryKey", "unique", "required" from (
          SELECT a.COLUMN_NAME AS "columnName",a.DATA_TYPE AS "datatype",
                CASE WHEN c.CONSTRAINT_TYPE ='P' THEN 'true'
                ELSE 'false' END AS "primaryKey",
                CASE WHEN c.CONSTRAINT_TYPE IN ('U','P') THEN 'true'
                ELSE 'false' END AS "unique",
                CASE WHEN a.NULLABLE ='N' THEN 'true'
                ELSE 'false' END AS  "required",
                row_Number() over (partition by a.COLUMN_NAME,a.DATA_TYPE order by c.constraint_type desc) as rnk
                FROM ALL_TAB_COLUMNS a
                LEFT JOIN ALL_CONS_COLUMNS b ON (a.TABLE_NAME=b.table_name AND a.COLUMN_NAME=b.COLUMN_NAME)
                LEFT JOIN ALL_CONSTRAINTS c ON (b.CONSTRAINT_NAME=c.CONSTRAINT_NAME)
                WHERE a.table_name='${tableName}' ) r where rnk=1`;
        break;

      case "sqlserver":
      case "sql server":
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
      case "hive cdh":
      case "impala":
        q = `describe ${tableName}`;
        break;

      case "mysql":
        q = `SHOW COLUMNS FROM ${tableName}`;
        break;
      default:
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
      res,
      "fetchColumns"
    );
  } catch (error) {
    console.log(error);
    Logger.error("catch :listTables");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, err);
  }
};
