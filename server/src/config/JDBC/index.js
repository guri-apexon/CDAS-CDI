var JDBC = require("jdbc");
var jinst = require("jdbc/lib/jinst");
const path = require("path");

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

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath([mysqlDriver, oracleDriver, postgresqlDriver]);
}

module.exports = async (
  username,
  pass,
  connectionurl,
  drivername,
  query,
  msg,
  res
) => {
  var config = {
    url: connectionurl,
    user: username,
    password: pass,
    minpoolsize: 2,
    maxpoolsize: 3,
    drivername: drivername,
  };

  var jdbc = new JDBC(config);

  jdbc.initialize(function (err) {
    if (err) {
      console.log(err);
    }
    jdbc.reserve(function (err, connObj) {
      if (connObj) {
        console.log("Using connection: " + connObj.uuid);
        var conn = connObj.conn;

        conn.createStatement(function (err, statement) {
          if (err) {
            res.status(500).json({
              status: 0,
              message: "",
              error: err,
            });
          } else {
            statement.setFetchSize(100, function (err) {
              if (err) {
                res.status(500).json({
                  status: 0,
                  message: "",
                  error: err,
                });
              } else {
                //Execute a query
                statement.executeQuery(query, function (err, resultset) {
                  console.log("err", err);
                  if (err) {
                    res.status(500).json({
                      status: 0,
                      message: "",
                      error: err,
                    });
                  } else {
                    resultset.toObjArray(function (err, results) {
                      res.status(200).json({
                        status: 1,
                        message: msg,
                        data: results,
                      });
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
};
