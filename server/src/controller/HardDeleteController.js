const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.addEdit = async (req, res) => {
  try {
    const dflowID = req.body.dataflowid;
    const curDate = new Date();

    const updateQuery = `UPDATE ${schemaName}.dataflow SET updt_tm=$1, del_flg=$3 WHERE dataflowid=$2`;
    const getQuery = `SELECT name,fsrstatus,prot_id from ${schemaName}.dataflow WHERE dataflowid = $1`;
    // const insertQuery = `INSERT INTO ${schemaName}.dataflow_action (df_id, df_nm, action_typ,df_status,prot_id)
    //                   VALUES($1, $2, $3, $4, $5)`;
    const insertQuery = `INSERT INTO ${schemaName}.audit_log (tbl_nm, id,attribute,old_val,new_val,rsn_for_chg,updated_on)
                      VALUES($1, $2, $3, $4, $5,$6,$7)`;

    Logger.info({
      message: "hardDelete",
    });

    const upData = await DB.executeQuery(updateQuery, [curDate, dflowID, 1]);

    // const getData = await DB.executeQuery(getQuery, [dflowID]);
    const inset = await DB.executeQuery(insertQuery, [
      "dataflow",
      dflowID,
      "delete",
      0,
      1,
      "Test Data",
      curDate,
    ]);

    return apiResponse.successResponseWithData(res, "Operation success");
  } catch (err) {
    Logger.error("catch :hardDelete");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
