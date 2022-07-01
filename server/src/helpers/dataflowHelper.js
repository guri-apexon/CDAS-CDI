const DB = require("../config/db");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.find = async (filter) => {
  try {
    const result = await DB.executeQuery(
      `SELECT * from ${schemaName}.dataflow WHERE ${filter} `
    );
    if (result && result.rowCount > 0) return result.rows[0];
  } catch (error) {
    Logger.error("dataflowhelper > find");
  }
  return false;
};

exports.findById = async (id) => await this.find(`dataflowid='${id}'`);

exports.findByDatasetId = async (id) => {
  const query = `SELECT df.* FROM ${schemaName}.dataflow df 
  join datapackage dp on dp.dataflowid = df.dataflowid 
  join dataset ds on ds.datapackageid = dp.datapackageid
  WHERE ds.datasetid='${id}'`;

  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0];
  } catch (error) {
    Logger.error("dataflowhelper > find");
  }
  return "";
};
