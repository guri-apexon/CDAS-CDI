// var JDBC = require("jdbc");
// var jinst = require("jdbc/lib/jinst");

// if (!jinst.isJvmCreated()) {
//   jinst.addOption("-Xrs");
//   jinst.setupClasspath(["../mysql-connector-java-5.1.39-bin.jar"]);
// }

// module.exports = async (UserName, Pass, connectionUrl, driverName) => {
//   try {
//     var config = {
//       url: connectionUrl,
//       user: UserName,
//       password: Pass,
//       minpoolsize: 2,
//       maxpoolsize: 3,
//       drivername: driverName,
//     };
//     var jdbc = new JDBC(config);
//     //Initialize jdbc object
//     jdbc.initialize(config, function (err, res) {
//       if (err) {
//         console.log(err);
//       }
//     });
//     return jdbc;
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// };

var JDBC = require("jdbc");
var jinst = require("jdbc/lib/jinst");
// var Pool = require('jdbc/lib/pool');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath([
    "C:\\Users\\u1118184\\Documents\\workspace\\code\\cdi\\server\\src\\config\\mysql-connector-java-8.0.28.jar",
  ]);
}

module.exports = async (username, pass, connectionurl, drivername) => {
  var config = {
    url: connectionurl,
    user: username,
    password: pass,
    minpoolsize: 2,
    maxpoolsize: 3,
    drivername: drivername,
  };
  // var config = {
  //   url: "jdbc:oracle:thin:@db-cdr1d:1521:CDR1D",
  //   user: "IDP",
  //   password: "s+vXj329Yrd4hLFETTBJSg==",
  //   minpoolsize: 2,
  //   maxpoolsize: 3,
  //   drivername: "oracle.jdbc.driver.OracleDriver"
  // }
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
            callback(err);
          } else {
            statement.setFetchSize(100, function (err) {
              if (err) {
                callback(err);
              } else {
                //Execute a query
                statement.executeQuery(
                  "SELECT * FROM INFORMATION_SCHEMA.TABLES;",
                  function (err, resultset) {
                    if (err) {
                      callback(err);
                    } else {
                      resultset.toObjArray(function (err, results) {
                        //Printing number of records
                        if (results.length > 0) {
                          console.log("Record count: " + results.length);
                          console.log(results);
                        }
                        callback(null, resultset);
                      });
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  });
};
