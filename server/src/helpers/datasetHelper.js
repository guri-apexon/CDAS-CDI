const DB = require("../config/db");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

const dataflowHelper = require("./dataflowHelper");
const datapackageHelper = require("./datapackageHelper");

exports.find = async (filter) => {
  try {
    const result = await DB.executeQuery(
      `SELECT * from ${schemaName}.dataset WHERE ${filter} `
    );
    if (result && result.rowCount > 0) return result.rows[0];
  } catch (error) {
    Logger.error("datasethelper > find");
  }
  return false;
};

exports.findById = async (id) => await this.find(`datasetid='${id}'`);

exports.findByMnemonic = async (
  prot_id,
  testflag,
  vend_id,
  datakindid,
  mnemonic,
  datasetid = ""
) => {
  if (datasetid) {
    const dataflow = await dataflowHelper.findByDatasetId(datasetid);
    if (dataflow) {
      prot_id = dataflow.prot_id;
      testflag = dataflow.testflag;
      vend_id = dataflow.vend_id;
    }
  }

  const query = `
    SELECT * FROM  ${schemaName}.dataflow df 
    JOIN ${schemaName}.datapackage dp ON dp.dataflowid = df.dataflowid 
    JOIN ${schemaName}.dataset ds ON ds.datapackageid = dp.datapackageid 
    WHERE 
      df.prot_id = '${prot_id}'       AND 
      df.vend_id = '${vend_id}'       AND 
      df.testflag = '${testflag}'     AND 
      ds.datakindid = '${datakindid}' AND
      ${datasetid ? `ds.datasetid != '${datasetid}' AND ` : ""} 
      lower(ds.mnemonic) LIKE lower('${mnemonic}')
  `;

  try {
    const response = await DB.executeQuery(query);
    console.log("rows", response.rows);
    if (response && response.rowCount > 0) return response.rows[0];
  } catch (error) {
    console.log(error);
    Logger.error(`verify mnemonic ${error}`);
  }
  return false;
};

exports.isNotUniqueAmongstDatasets = async (
  prot_id,
  testFlag,
  vendorID,
  dataflowid
) => {
  const query = `
  select
    count(*)
  from
    study s
  join dataflow df on
    df.prot_id = s.prot_id
  join datapackage dp on
    (df.dataflowid = dp.dataflowid )
  join dataset ds on
    (dp.datapackageid = ds.datapackageid )
  where
    s.prot_id = '${prot_id}'
    and df.vend_id = '${vendorID}'
    and df.testflag = ${testFlag}
    and df.dataflowid != '${dataflowid}'
    and ds.mnemonic in (
    select distinct
      ds.mnemonic
    from
      dataflow df
    join datapackage dp on
      (df.dataflowid = dp.dataflowid )
    join dataset ds on
      (dp.datapackageid = ds.datapackageid )
    where
      df.dataflowid = '${dataflowid}'

  )
    and ds.datakindid in (
    select distinct
      ds.datakindid
    from
      dataflow df
    join datapackage dp on
      (df.dataflowid = dp.dataflowid )
    join dataset ds on
      (dp.datapackageid = ds.datapackageid )
    where
      df.dataflowid = '${dataflowid}'
);
  `;

  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0].count !== "0";
  } catch (error) {}
  return false;
};
