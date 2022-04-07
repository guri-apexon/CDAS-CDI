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

exports.hardDelete = async (req, res) => {
  try {
    const {
      verdorId,
      vendorName,
      vendorStatus,
      description,
      externalSystemName,
    } = req.body;
    const curDate = new Date();
    const query = `UPDATE ${schemaName}.vendor
    SET vend_nm=$3, description=$4, active=$5, updt_tm=$1
    WHERE vend_id=$2 AND extrnl_sys_nm=$6`;

    Logger.info({
      message: "updateVendor",
    });

    const up = await DB.executeQuery(query, [
      curDate,
      verdorId,
      vendorName,
      description,
      vendorStatus,
      externalSystemName,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", up);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateVendor");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.softDelete1 = async (req, res) => {
  try {
    const dataflowid = a0A0E000004lnWlUAI;
    console.log("line 10", req.body);
    const curDate = new Date();

    const getQuery = `SELECT from ${schemaName}.dataflow WHERE dataflowid = $1`;
    // const updateQuery = `UPDATE ${schemaName}.dataflow SET updt_tm=$1, del_flg=$3 WHERE dataflowid=$2`;
    // const saveQuery = `insert into ${schemaName}.dataflow_action
    //       (dataflowid,name,vend_id,type,description,src_loc_id,active,configured,expt_fst_prd_dt,
    //         testflag,data_in_cdr,connectiontype,connectiondriver,externalsystemname,externalid,
    //         fsrstatus,prot_id,insrt_tm) VALUES
    //         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`;

    // Logger.info({
    //   message: "softDelete",
    // });

    const getData = await DB.executeQuery(getQuery, [dataflowid]);
    //  const inset = await DB.executeQuery(insertQuery, [
    //    dflowID,
    //    getData.rows[0].name,
    //    "delete",
    //    getData.rows[0].fsrstatus,
    //    getData.rows[0].prot_id,
    //  ]);

    console.log("line 32", getData.row[0]);
    return apiResponse.successResponseWithData(
      res,
      "Operation success"
      // upData
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :softDelete");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
