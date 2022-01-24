var JDBC = require("jdbc");
var jinst = require("jdbc/lib/jinst");

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(["../mysql-connector-java-5.1.39-bin.jar"]);
}

module.exports = async (UserName, Pass, connectionUrl, driverName) => {
  try {
    var config = {
      url: connectionUrl,
      user: UserName,
      password: Pass,
      minpoolsize: 2,
      maxpoolsize: 3,
      drivername: driverName,
    };
    var jdbc = new JDBC(config);
    //Initialize jdbc object
    jdbc.initialize(config, function (err, res) {
      if (err) {
        console.log(err);
      }
    });
    return jdbc;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
