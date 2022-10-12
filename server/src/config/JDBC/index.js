var JDBC = require("jdbc");
var jinst = require("jdbc/lib/jinst");
const path = require("path");
const apiResponse = require("../../helpers/apiResponse");
const {
  formatDBColumns,
  formatDBTables,
} = require("../../helpers/customFunctions");

//driver imports
const mysqlDriver = path.join(
  __dirname,
  "Drivers",
  "mysql-connector-java-8.0.28.jar"
);
const oracleDriver = path.join(__dirname, "Drivers", "ojdbc7.jar");
const postgresqlDriver = path.join(
  __dirname,
  "Drivers",
  "postgresql-42.3.2.jar"
);

const sqlServerDriver = path.join(
  __dirname,
  "Drivers",
  "mssql-jdbc-9.2.0.jre8.jar"
);

const impalaDriver = path.join(__dirname, "Drivers", "ImpalaJDBC41.jar");

const snowflakeDriver = path.join(
  __dirname,
  "Drivers",
  "snowflake-jdbc-3.8.5.jar"
);

const hiveCDHServerDriver = path.join(__dirname, "Drivers", "HiveJDBC41.jar");
if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.addOption(`-Djava.security.krb5.conf=${__dirname}/krb5.conf`);
  jinst.addOption(
    `-Djava.security.auth.login.config=${__dirname}/HiveConfig/jass.conf`
  );
  jinst.addOption(
    `-Djava.security.auth.login.config.keyTabFile=${__dirname}/HiveConfig/iqvia-cdas.keytab`
  );
  jinst.addOption(
    `-Djava.security.auth.login.config.principal="hive/uskhdphive.quintiles.net@QUINTILES.NET"`
  );
  jinst.addOption(`-Dhadoop.security.authentication="kerberos"`);
  jinst.addOption(`-Djavax.security.auth.useSubjectCredsOnly=false`);
  jinst.addOption(
    `-Djava.security.debug=gssloginconfig,configfile,configparser,logincontext`
  );
  jinst.addOption(`-Dsun.security.krb5.debug=true`);
  jinst.addOption(`-Djavax.security.auth.useSubjectCredsOnly=false`);

  jinst.setupClasspath([
    mysqlDriver,
    oracleDriver,
    postgresqlDriver,
    sqlServerDriver,
    hiveCDHServerDriver,
    snowflakeDriver,
    impalaDriver,
  ]);
}
module.exports = async (
  username,
  pass,
  connectionurl,
  drivername,
  query,
  msg,
  res,
  callSrc = null,
  errorMessage
) => {
  try {
    var config = {
      url: connectionurl,
      user: username,
      password: pass,
      minpoolsize: 2,
      maxpoolsize: 3,
      drivername: drivername,
    };
    // console.log("config", config, connectionurl);

    var jdbc = new JDBC(config);
    jdbc.initialize(function (err) {
      console.log("err:initialize:::: ", err);
      if (err) {
        return apiResponse.ErrorResponse(
          res,
          errorMessage || "Location config is wrong"
        );
      }
      jdbc.reserve(function (err, connObj) {
        console.log("err:reserve:::: ", err);
        if (connObj) {
          console.log("Using connection: " + connObj.uuid);
          var conn = connObj.conn;

          conn.createStatement(function (err, statement) {
            if (err) {
              console.log("err:createStatement:::: ", createStatement);
              res.status(500).json({
                status: 0,
                message: "",
                error: err,
              });
            } else {
              statement.setFetchSize(100, function (err) {
                if (err) {
                  console.log("err:setFetchSize:::: ", createStatement);
                  res.status(500).json({
                    status: 0,
                    message: "",
                    error: err.message,
                  });
                } else {
                  //Execute a query
                  statement.executeQuery(query, function (err, resultset) {
                    if (err) {
                      console.log("err:executeQuery:::: ", err, resultset);
                      res.status(500).json({
                        status: 0,
                        message:
                          errorMessage ||
                          "Query Compilation Error, check query syntax.",
                        error: err,
                      });
                    } else {
                      resultset.toObjArray(function (err, results) {
                        if (results?.length) {
                          let data = [];
                          if (callSrc === "fetchColumns") {
                            data = formatDBColumns(results, drivername);
                          } else if (callSrc === "fetchTables") {
                            data = formatDBTables(results);
                          } else {
                            data = results;
                          }
                          res.status(200).json({
                            status: 1,
                            message: msg,
                            data,
                          });
                        } else {
                          res.status(500).json({
                            status: 0,
                            message:
                              callSrc === "fetchTables"
                                ? "No Tables Returned. Please reach out to admins"
                                : "No records found.",
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
  } catch (err) {
    return apiResponse.ErrorResponse(
      res,
      errorMessage ||
        "Location config is wrong. Please select correct location to proceed."
    );
  }
};
