const getTablesArray = [
  {
    externalSystem: "GDMPM-DAS",
    locationType: "Oracle",
    driverName: "oracle.jdbc.driver.OracleDriver",
    connectionPassword: "ParkWay432",
    connectionUserName: "IDP",
    connectionUrl: "jdbc:oracle:thin:@db-cdr1d:1521:CDR1D",
  },
  {
    externalSystem: "GDMPM-DAS",
    locationType: "PostgreSQL",
    driverName: "org.postgresql.Driver",
    connectionPassword: "ycdas1d@cdas1d",
    connectionUserName: "ycdas1d",
    connectionUrl: "jdbc:postgresql://ca2updb249vd:5433/cdas1d",
  },

  {
    externalSystem: "TDSE",
    locationType: "MySQL",
    driverName: "com.mysql.jdbc.Driver",
    connectionPassword: "vault",
    connectionUserName: "vault",
    connectionUrl: "jdbc:mysql://ca2uhdtsd001vd:3306/vault",
  },

  {
    externalSystem: "TDSE",
    locationType: "SQL",
    driverName: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    connectionPassword: "l=^37FK6-^:KAp3!i*N6z",
    connectionUserName: "QuintilesCTMS",
    connectionUrl: "jdbc:sqlserver://192.168.81.11:1433;databaseName=QCTMS",
  },

  {
    externalSystem: "CDR",
    locationType: "Hive CDH",
    driverName: "com.cloudera.hive.jdbc41.HS2Driver",
    connectionPassword: "Iqvia@123",
    connectionUserName: "ycdrssd",
    connectionUrl:
      "jdbc:hive2://cdtdev-hive.quintiles.net:10001/db_hats0301;transportMode=https;httpPath=cliservice;ssl=1;AllowSelfSignedCerts=1;AuthMech=3",
  },

  {
    externalSystem: "CDR",
    locationType: "Hive CDP",
    driverName: "com.cloudera.hive.jdbc41.HS2Driver",
    connectionPassword: "tcdh_prd_RO_@!58",
    connectionUserName: "srv_tcdh_prd_ro_iqvia",
    connectionUrl:
      "jdbc:hive2://hs2-tdse-us-cdp-dw-hive.env-v5cswj.dw.imkp-dy57.cloudera.site:443/tctmgt01p;transportMode=http;httpPath=cliservice;ssl=1;AllowSelfSignedCerts=1;AuthMech=3",
  },
];

const previewSQLArray = [
  {
    tableName: null,
    externalSystem: "CDR",
    columnCount: null,
    driverName: "com.cloudera.hive.jdbc41.HS2Driver",
    locationType: "Hive CDH",
    customQuery: "YES",
    connectionPassword: "Iqvia@123",
    connectionUserName: "ycdrssd",
    columnDefinition: null,
    customSql:
      "SELECT studyid FROM Hive.db_hats0301.cd_tabular_medavante_ae_sas2_history",
    conditionalExpression: null,
    connectionUrl:
      "jdbc:hive2://cdtdev-hive.quintiles.net:10001/db_hats0301;transportMode=https;httpPath=cliservice;ssl=1;AllowSelfSignedCerts=1;AuthMech=3",
  },
  {
    tableName: null,
    externalSystem: "CDR",
    columnCount: null,
    driverName: "oracle.jdbc.driver.OracleDriver",
    locationType: "Oracle",
    customQuery: "YES",
    connectionPassword: "ParkWay432",
    connectionUserName: "IDP",
    columnDefinition: null,
    customSql: "SELECT DATAFLOWID FROM DATAFLOW",
    conditionalExpression: null,
    connectionUrl: "jdbc:oracle:thin:@db-cdr1d:1521:CDR1D",
  },
  {
    tableName: null,
    externalSystem: "GDMPM-DAS",
    columnCount: null,
    driverName: "org.postgresql.Driver",
    locationType: "PostgreSQL",
    customQuery: "YES",
    connectionPassword: "ycdas1d@cdas1d",
    connectionUserName: "ycdas1d",
    columnDefinition: null,
    customSql: "SELECT DATAFLOWID FROM DATAFLOW",
    conditionalExpression: null,
    connectionUrl: "jdbc:postgresql://ca2updb249vd:5433/cdas1d",
  },
  {
    tableName: null,
    externalSystem: "TDSE",
    columnCount: null,
    driverName: "com.mysql.jdbc.Driver",
    locationType: "MySQL",
    customQuery: "YES",
    connectionPassword: "vault",
    connectionUserName: "vault",
    columnDefinition: null,
    customSql: "SELECT vault_value FROM vault",
    conditionalExpression: null,
    connectionUrl: "jdbc:mysql://ca2uhdtsd001vd:3306/vault",
  },
  {
    tableName: null,
    externalSystem: "TDSE",
    columnCount: null,
    driverName: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    locationType: "SQL",
    customQuery: "YES",
    connectionPassword: "l=^37FK6-^:KAp3!i*N6z",
    connectionUserName: "QuintilesCTMS",
    columnDefinition: null,
    customSql: "SELECT vault_value FROM vault",
    connectionUrl: "jdbc:sqlserver://192.168.81.11:1433;databaseName=QCTMS",
  },
];

const getColumnsArray = [
  {
    locationType: "Postgres SQl",
    tableName: "dataflow",
    connectionPassword: "ycdas1d@cdas1d",
    connectionUserName: "ycdas1d",
    connectionUrl: "jdbc:postgresql://ca2updb249vd:5433/cdas1d",
    driverName: "org.postgresql.Driver",
    externalSystem: "CDR",
  },

  {
    locationType: "oracle",
    tableName: "dataflow",
    connectionPassword: "ParkWay432",
    connectionUserName: "IDP",
    connectionUrl: "jdbc:oracle:thin:@db-cdr1d:1521:CDR1D",
    driverName: "oracle.jdbc.driver.OracleDriver",
    externalSystem: "CDR",
  },
];
