const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

module.exports = async() => {
    let connection;
    try {
        connection = await oracledb.getConnection({
          user          : process.env.ORACLE_USER,
          password      : process.env.ORACLE_PASS,
          connectString : `(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = ${process.env.ORACLE_SERVER})(PORT = ${process.env.ORACLE_PORT}))(CONNECT_DATA =(SID= ${process.env.ORACLE_DB})))`
        });
        return connection;
      } catch (err) {
        console.error(err);
        throw err;
      }
}



