var JDBC = require("jdbc");
var jinst = require("jdbc/lib/jinst");
const path = require("path");

const mysqlDriver = path.join(
  __dirname,
  "Drivers",
  "mysql-connector-java-8.0.28.jar"
);

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath([mysqlDriver]);
}

module.exports = async (
  username,
  pass,
  connectionurl,
  drivername,
  query,
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
                        message: "query executed successfully.",
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
