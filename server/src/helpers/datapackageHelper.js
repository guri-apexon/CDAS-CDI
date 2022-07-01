const DB = require("../config/db");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.find = async (filter) => {
  try {
    const result = await DB.executeQuery(
      `SELECT * from ${schemaName}.datapackage WHERE ${filter}`
    );
    if (result && result.rowCount > 0) return result.rows[0];
  } catch (error) {
    Logger.error("datapackagehelper > find");
  }
  return false;
};

exports.findById = async (id) => await this.find(`datapackageid='${id}'`);
