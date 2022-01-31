const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");

exports.getStudyDataflows = async (req, res) => {
  try {
    const { protocolId } = req.body;
    if (protocolId) {
      const query = `select * from (select s.prot_id as "studyId", d.dataflowid as "dataFlowId", row_number () over(partition by d.dataflowid,d2.prot_id order by dh."version" desc) as rnk, dsetcount.dsCount as "dsCount", dpackagecount.dpCount as "dpCount", s.prot_nbr as "studyName", dh."version", d.data_flow_nm as "dataFlowName", d.testflag as "type", d.insrt_tm as "dateCreated", vend_nm as "vendorSource", d.description, d.type as "adapter", d.active as "status", d.extrnl_sys_nm as "externalSourceSystem", loc_typ as "locationType", d.updt_tm as "lastModified", d.refreshtimestamp as "lastSyncDate" from ${constants.DB_SCHEMA_NAME}.dataflow d 
    inner join ${constants.DB_SCHEMA_NAME}.vendor v on d.vend_id = v.vend_id 
    inner join ${constants.DB_SCHEMA_NAME}.source_location sl on d.src_loc_id = sl.src_loc_id 
    inner join ${constants.DB_SCHEMA_NAME}.datapackage d2 on d.dataflowid = d2.dataflowid 
    inner join ${constants.DB_SCHEMA_NAME}.dataflow_history dh on d.dataflowid = dh.dataflowid
    inner join ${constants.DB_SCHEMA_NAME}.study s on d2.prot_id = s.prot_id
    inner join (select datapackageid, COUNT(DISTINCT datasetid) as dsCount FROM ${constants.DB_SCHEMA_NAME}.dataset d GROUP BY datapackageid) dsetcount on (d2.datapackageid=dsetcount.datapackageid)
    inner join (select dataflowid, COUNT(DISTINCT datapackageid) as dpCount FROM ${constants.DB_SCHEMA_NAME}.datapackage d GROUP BY dataflowid) dpackagecount on (d.dataflowid=dpackagecount.dataflowid)
    where s.prot_id = $1) as df where df.rnk=1`;

      Logger.info({ message: "getStudyDataflows" });
      const $q1 = await DB.executeQuery(query, [protocolId]);

      const formatDateValues = await $q1.rows.map((e) => {
        let editT = moment(e.lastModified).format("MM/DD/YYYY");
        let addT = moment(e.dateCreated).format("MM/DD/YYYY");
        let syncT = moment(e.lastSyncDate).format("MM/DD/YYYY");
        let status = e.status === 0 ? "Inactive" : "Active";
        let dfType = e.type === 0 ? "Production" : "Test";
        return {
          ...e,
          dateCreated: addT,
          lastModified: editT,
          lastSyncDate: syncT,
          status: status,
          type: dfType,
        };
      });

      const uniqueDataflows = Array.from(
        formatDateValues
          .reduce((acc, { dsCount, dpCount, dataFlowId, ...r }) => {
            const current = acc.get(dataFlowId) || {
              ...r,
              dataSets: 0,
              dataPackages: 0,
            };
            return acc.set(dataFlowId, {
              ...current,
              dataFlowId,
              dataSets: parseInt(current.dataSets) + parseInt(dsCount),
              dataPackages: parseInt(current.dataPackages) + parseInt(dpCount),
            });
          }, new Map())
          .values()
      );

      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        uniqueDataflows
      );
    } else {
      return apiResponse.successResponseWithData(
        res,
        "Protocol is not Selected",
        []
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getStudyDataflows");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.createDataflow = async (req, res) => {
  try {
    const uid = createUniqueID();
    let {
      sponsorNameStandard,
      active,
      connectionType,
      sponsorName,
      externalVersion,
      protocolNumberStandard,
      exptDtOfFirstProdFile,
      vendorName,
      protocolNumber,
      type,
      name,
      externalID,
      location,
      testFlag,
      prodFlag,
      description,
      dataPackage,
      vendorID,
      dataStructure,
      locationType,
      externalSystemName,
      locationName,
      firstFileDate,
    } = req.body;
    var ResponseBody = {};
    if (externalSystemName !== "CDI") {
      // request from external system
      if (vendorName !== "") {
        let q = `select vend_id from ${constants.DB_SCHEMA_NAME}.vendor where vend_nm='${vendorName}'`;
        let { rows } = await DB.executeQuery(q);
        let q1 = `select src_loc_id from ${constants.DB_SCHEMA_NAME}.source_location where cnn_url='${location}'`;
        let { rows: data } = await DB.executeQuery(q1);
        if (rows.length > 0 && data.length > 0) {
          //validation for dataflow metadata
          if (
            vendorName !== null &&
            protocolNumberStandard !== null &&
            description !== ""
          ) {
            var DFTestname = `${vendorName}-${protocolNumberStandard}-${description}`;
            if (testFlag === true) {
              DFTestname = "TST-" + DFTestname;
            }
            //check for dataflowname && sequence logic
            const checkDFQuery = `select data_flow_nm from ${constants.DB_SCHEMA_NAME}.dataflow where data_flow_nm LIKE '${DFTestname}%'`;
            const executeCheckDf = await DB.executeQuery(checkDFQuery);
            if (executeCheckDf.rows.length > 0) {
              let splittedVal =
                executeCheckDf.rows[
                  executeCheckDf.rows.length - 1
                ].data_flow_nm.split("-");
              let _index = testFlag === true ? 4 : 3;
              if (splittedVal.length > _index) {
                let newParsed = parseInt(splittedVal[_index]);
                DFTestname = DFTestname + "-" + (newParsed + 1);
              } else {
                DFTestname = DFTestname + "-1";
              }
            }

            const query = `insert into ${constants.DB_SCHEMA_NAME}.dataflow 
            (dataflowid,data_flow_nm,vend_id,type,description,src_loc_id,active,refreshtimestamp,configured,expt_fst_prd_dt,
              config_json,testflag,data_in_cdr,connectiontype,connectiondriver,data_strc,last_study_sync,
              last_study_re_proc,last_time_view_was_refer,serv_ownr,src_sys_nm,extrnl_sys_nm,extrnl_id,
              fsr_stat,insrt_tm,call_back_url_id) VALUES 
              ('${uid}','${DFTestname}','${
              rows[0].vend_id
            }','${type}','${description}',${data[0].src_loc_id},0,
              null,0,'${exptDtOfFirstProdFile}','',${
              testFlag === "false" ? 0 : 1
            },'','${connectionType}','${location}',null,null,null,
              null,null,null,null,'${externalID}',null,CURRENT_TIMESTAMP,null)`;
            let ts = new Date().toLocaleString();
            // insert dataflow schema into db
            let createDF = await DB.executeQuery(query);
            ResponseBody.action = "Data flow created successfully.";
            ResponseBody.status = "Inactive";
            ResponseBody.timestamp = ts;
            ResponseBody.version = 1;
            if (dataPackage && dataPackage.length > 0) {
              ResponseBody.data_packages = [];
              // if datapackage exists
              for (let each of dataPackage) {
                let newObj = {};
                const dpUid = createUniqueID();
                if (each.name !== "" && each.path !== "" && each.type !== "") {
                  let DPQuery = `INSERT INTO ${
                    constants.DB_SCHEMA_NAME
                  }.datapackage(datapackageid, type, name, path, 
                    password, active,nopackageconfig,extrnl_id, insrt_tm, dataflowid)
                    VALUES('${dpUid}', '${each.type}', '${each.name}', '${
                    each.path
                  }',
                    '${each.password}',  '1','${
                    each.noPackageConfig === "false" ? 0 : 1
                  }',${each.externalID},CURRENT_TIMESTAMP,'${uid}')`;
                  let createDP = await DB.executeQuery(DPQuery);
                  newObj.timestamp = ts;
                  newObj.externalId = each.externalID;
                  newObj.action = "Data package created successfully.";
                  ResponseBody.data_packages.push(newObj);
                  if (each.dataSet && each.dataSet.length > 0) {
                    ResponseBody.data_sets = [];
                    // if datasets exists
                    for (let obj of each.dataSet) {
                      let newobj = {};
                      if (
                        obj.name !== "" &&
                        obj.path !== "" &&
                        obj.mnemonic !== "" &&
                        obj.customQuery !== "" &&
                        obj.columncount !== null
                      ) {
                        let dataKindQ = `select datakindid from ${constants.DB_SCHEMA_NAME}.datakind where name='${obj.dataKind}'`;
                        let checkDataKind = await DB.executeQuery(dataKindQ);
                        if (checkDataKind.rows.length > 0) {
                          let datakindid = checkDataKind.rows[0].datakindid;
                          const dsUid = createUniqueID();
                          let DSQuery = `insert into ${constants.DB_SCHEMA_NAME}.dataset(datasetid,datapackageid,datakindid,datakind,mnemonic,columncount,incremental,
                              offsetcolumn,type,path,ovrd_stale_alert,headerrownumber,footerrownumber,customsql,
                              custm_sql_query,tbl_nm,extrnl_id,insrt_tm) values('${dsUid}','${dpUid}','${datakindid}','${obj.dataKind}','${obj.mnemonic}',${obj.columncount},${obj.incremental},'${obj.offsetColumn}','${obj.type}',
                                '${obj.path}',${obj.OverrideStaleAlert},${obj.headerRowNumber},${obj.footerRowNumber},'${obj.customSql}',
                                '${obj.customQuery}','${obj.tableName}',${obj.externalID},CURRENT_TIMESTAMP)`;
                          let createDS = await DB.executeQuery(DSQuery);
                          newobj.timestamp = ts;
                          newobj.externalId = obj.externalID;
                          newobj.action = "Data set created successfully.";
                          ResponseBody.data_sets.push(newobj);
                        } else {
                          return apiResponse.ErrorResponse(
                            res,
                            "Data set Datakind is required"
                          );
                        }
                      } else {
                        return apiResponse.ErrorResponse(
                          res,
                          "Data set name and path is required"
                        );
                      }
                    }
                  } else {
                    return apiResponse.successResponseWithData(
                      res,
                      "Data flow created successfully",
                      ResponseBody
                    );
                  }
                } else {
                  return apiResponse.ErrorResponse(
                    res,
                    "Data package name, type and path is required"
                  );
                }
              }
            } else {
              return apiResponse.successResponseWithData(
                res,
                "Data flow created successfully",
                ResponseBody
              );
            }
          } else {
            return apiResponse.ErrorResponse(
              res,
              "Vendor name , protocol number standard and description is required"
            );
          }
        }
      }
    } else {
      //request from CDI
      if (vendorID !== "") {
        let q = `select vend_nm from ${constants.DB_SCHEMA_NAME}.vendor where vend_id='${vendorID}'`;
        let { rows } = await DB.executeQuery(q);
        let q1 = `select cnn_url from ${constants.DB_SCHEMA_NAME}.source_location where src_loc_id='${locationName}'`;
        let { rows: data } = await DB.executeQuery(q1);
        if (rows.length > 0 && data.length > 0) {
          var DFTestname = `${rows[0].vend_nm}-${protocolNumberStandard}-${description}`;
          if (testFlag === "true") {
            DFTestname = "TST-" + DFTestname;
          }
          //check for dataflowname
          const checkDFQuery = `select data_flow_nm from ${constants.DB_SCHEMA_NAME}.dataflow where data_flow_nm LIKE '${DFTestname}%'`;
          const executeCheckDf = await DB.executeQuery(checkDFQuery);
          if (executeCheckDf.rows.length > 0) {
            let splittedVal =
              executeCheckDf.rows[
                executeCheckDf.rows.length - 1
              ].data_flow_nm.split("-");
            let _index = testFlag === "true" ? 4 : 3;
            if (splittedVal.length > _index) {
              let newParsed = parseInt(splittedVal[_index]);
              DFTestname = DFTestname + "-" + (newParsed + 1);
            } else {
              DFTestname = DFTestname + "-1";
            }
          }
          const query = `insert into ${constants.DB_SCHEMA_NAME}.dataflow 
            (dataflowid,data_flow_nm,vend_id,type,description,src_loc_id,active,refreshtimestamp,configured,expt_fst_prd_dt,
              config_json,testflag,data_in_cdr,connectiontype,connectiondriver,data_strc,last_study_sync,
              last_study_re_proc,last_time_view_was_refer,serv_ownr,src_sys_nm,extrnl_sys_nm,extrnl_id,
              fsr_stat,insrt_tm,call_back_url_id) VALUES 
              ('${uid}','${DFTestname}','${vendorID}','${dataStructure}','${description}','${locationName}',0,
              null,0,'${firstFileDate}','',${
            testFlag === "false" ? 0 : 1
          },'','${locationType}','${data[0].cnn_url}','null',null,null,
              null,null,null,'${externalSystemName}',null,null,CURRENT_TIMESTAMP,null)`;
          let ts = new Date().toLocaleString();
          // insert dataflow schema into db
          let createDF = await DB.executeQuery(query);
          ResponseBody.action = "Data flow created successfully.";
          ResponseBody.status = "Inactive";
          ResponseBody.timestamp = ts;
          return apiResponse.successResponseWithData(
            res,
            "Data flow created successfully",
            ResponseBody
          );
          // rows[0].vend_nm
        }
      }
    }

    return apiResponse.successResponseWithData(
      res,
      "Data flow created successfully.",
      ResponseBody
    );
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :createDataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

const hardDeleteTrigger = async (dataflowId, user) => {
  const values = [dataflowId];
  let result, dataFlow;
  await DB.executeQuery(
    `SELECT * from ${constants.DB_SCHEMA_NAME}.dataflow WHERE dataflowid=$1`,
    values
  ).then(async (response) => {
    dataFlow = response.rows ? response.rows[0] : null;
  });
  if (!dataFlow) {
    return "not_found";
  }
  const deleteQuery = `DELETE FROM ${constants.DB_SCHEMA_NAME}.dataflow_audit_log da
      WHERE da.dataflowid = $1`;
  await DB.executeQuery(deleteQuery, values)
    .then(async (response) => {
      const deleteQuery2 = `DELETE FROM ${constants.DB_SCHEMA_NAME}.temp_json_log da
      WHERE da.dataflowid = '${dataflowId}';
      DELETE FROM ${constants.DB_SCHEMA_NAME}.columndefinition cd WHERE cd.datasetid in (select datasetid FROM ${constants.DB_SCHEMA_NAME}.dataset ds
      WHERE ds.datapackageid in (select datapackageid from ${constants.DB_SCHEMA_NAME}.datapackage dp where dp.dataflowid='${dataflowId}'));
      DELETE FROM ${constants.DB_SCHEMA_NAME}.columndefinition_history cd WHERE cd.datasetid in (select datasetid FROM ${constants.DB_SCHEMA_NAME}.dataset ds
      WHERE ds.datapackageid in (select datapackageid from ${constants.DB_SCHEMA_NAME}.datapackage dp where dp.dataflowid='${dataflowId}'));
      DELETE FROM ${constants.DB_SCHEMA_NAME}.dataset ds
      WHERE ds.datapackageid in (select datapackageid from ${constants.DB_SCHEMA_NAME}.datapackage dp where dp.dataflowid='${dataflowId}');
      DELETE FROM ${constants.DB_SCHEMA_NAME}.dataset_history ds
      WHERE ds.datapackageid in (select datapackageid from ${constants.DB_SCHEMA_NAME}.datapackage dp where dp.dataflowid='${dataflowId}');
      DELETE FROM ${constants.DB_SCHEMA_NAME}.datapackage dp WHERE dp.dataflowid = '${dataflowId}';
      DELETE FROM ${constants.DB_SCHEMA_NAME}.datapackage_history dph WHERE dph.dataflowid = '${dataflowId}';`;

      await DB.executeQuery(deleteQuery2)
        .then(async (response2) => {
          const deleteQuery3 = `DELETE FROM ${constants.DB_SCHEMA_NAME}.dataflow
      WHERE dataflowid = $1`;
          await DB.executeQuery(deleteQuery3, values)
            .then(async (response3) => {
              if (response3.rowCount && response3.rowCount > 0) {
                const insertDeletedQuery = `INSERT INTO ${constants.DB_SCHEMA_NAME}.deleted_dataflow(df_del_id, dataflow_nm, del_by, del_dt, del_req_dt, prot_id) VALUES($1, $2, $3, $4, $5, $6)`;
                const deleteDfId = helper.createUniqueID();
                const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
                const deletedValues = [
                  deleteDfId,
                  dataFlow.data_flow_nm,
                  user.usr_id,
                  currentTime,
                  currentTime,
                  "",
                ];
                await DB.executeQuery(insertDeletedQuery, deletedValues)
                  .then(async (response) => {
                    result = true;
                  })
                  .catch((err) => {
                    result = false;
                  });
                result = "deleted";
              } else {
                result = "not_found";
              }
            })
            .catch((err) => {
              result = false;
            });
        })
        .catch((err) => {
          result = false;
        });
    })
    .catch((err) => {
      result = false;
    });
  return result;
};

const addDeleteTempLog = async (dataflowId, user) => {
  const insertTempQuery = `INSERT INTO ${constants.DB_SCHEMA_NAME}.temp_json_log(temp_json_log_id, dataflowid, trans_typ, trans_stat, no_of_retry_attempted, del_flg, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
  const tempId = helper.createUniqueID();
  let result;
  const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
  const values = [
    tempId,
    dataflowId,
    "DELETE",
    "FAILURE",
    1,
    "N",
    user.usr_id,
    currentTime,
    user.usr_id,
    currentTime,
  ];
  await DB.executeQuery(insertTempQuery, values)
    .then(async (response) => {
      result = true;
    })
    .catch((err) => {
      result = false;
    });
  return result;
};
exports.cronHardDelete = async () => {
  DB.executeQuery(
    `SELECT * FROM ${constants.DB_SCHEMA_NAME}.temp_json_log`
  ).then(async (response) => {
    const logs = response.rows || [];
    if (logs.length) {
      logs.forEach((log) => {
        const { dataflowid: dataflowId, created_by: user_id } = log;
        DB.executeQuery(
          `SELECT * FROM ${constants.DB_SCHEMA_NAME}.user where usr_id = $1`,
          [user_id]
        ).then(async (response) => {
          if (response.rows && response.rows.length) {
            const user = response.rows[0];
            const deleted = await hardDeleteTrigger(dataflowId, user);
            if (deleted) {
              return true;
            }
            return false;
          }
        });
      });
    }
  });
};
exports.hardDelete = async (req, res) => {
  try {
    const { dataFlowId, userId } = req.body;
    DB.executeQuery(
      `SELECT * FROM ${constants.DB_SCHEMA_NAME}.user where usr_id = $1`,
      [userId]
    ).then(async (response) => {
      if (response.rows && response.rows.length) {
        const user = response.rows[0];
        const deleted = await hardDeleteTrigger(dataFlowId, user);
        if (deleted == "deleted") {
          return apiResponse.successResponseWithData(
            res,
            "Deleted successfully",
            {
              success: true,
            }
          );
        } else if (deleted == "not_found") {
          return apiResponse.successResponseWithData(
            res,
            "Dataflow not found",
            {}
          );
        } else {
          const inserted = await addDeleteTempLog(dataFlowId, user);
          if (inserted) {
            return apiResponse.successResponseWithData(
              res,
              "Deleted is in queue. System will delete it automatically after sometime.",
              {
                success: false,
              }
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Something wrong. Please try again",
              {}
            );
          }
        }
      } else {
        return apiResponse.ErrorResponse(res, "User not found");
      }
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.activateDataFlow = async (req, res) => {
  try {
    const dataflowAuditlogId = createUniqueID();
    const { dataFlowId, userId, versionNo } = req.body;
    const curDate = new Date();
    const newVersion = versionNo + 1;
    Logger.info({ message: "activateDataFlow" });

    const q0 = `select d3.active from ${constants.DB_SCHEMA_NAME}.dataflow d
    inner join ${constants.DB_SCHEMA_NAME}.datapackage d2 on d.dataflowid = d2.dataflowid  
    inner join ${constants.DB_SCHEMA_NAME}.dataset d3 on d2.datapackageid = d3.datapackageid where d.dataflowid = $1`;
    const $q0 = await DB.executeQuery(q0, [dataFlowId]);

    if ($q0.rows.map((e) => e.active).includes(1)) {
      const q1 = `UPDATE ${constants.DB_SCHEMA_NAME}.dataflow set active=1 WHERE dataflowid=$1`;
      const q2 = `INSERT INTO ${constants.DB_SCHEMA_NAME}.dataflow_audit_log
      (df_audit_log_id, dataflowid, audit_vers, audit_updt_dt, audit_updt_by, "attribute", old_val, new_val)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
      const $q1 = await DB.executeQuery(q1, [dataFlowId]);
      const $q2 = await DB.executeQuery(q2, [
        dataflowAuditlogId,
        dataFlowId,
        newVersion,
        curDate,
        userId,
        "active",
        0,
        1,
      ]);

      return apiResponse.successResponseWithData(res, "Operation success", {
        success: true,
      });
    }
    return apiResponse.validationErrorWithData(res, "Dataflow Having Issue", {
      success: false,
    });
  } catch (err) {
    Logger.error("catch :activateDataFlow");
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.inActivateDataFlow = async (req, res) => {
  try {
    const dataflowAuditlogId = createUniqueID();
    const { dataFlowId, userId, versionNo } = req.body;
    const curDate = new Date();
    const newVersion = versionNo + 1;
    Logger.info({ message: "inActivateDataFlow" });

    const q1 = `UPDATE ${constants.DB_SCHEMA_NAME}.dataflow set active=0 WHERE dataflowid=$1`;
    const q2 = `INSERT INTO ${constants.DB_SCHEMA_NAME}.dataflow_audit_log
    (df_audit_log_id, dataflowid, audit_vers, audit_updt_dt, audit_updt_by, "attribute", old_val, new_val)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;

    const $q1 = await DB.executeQuery(q1, [dataFlowId]);
    const $q2 = await DB.executeQuery(q2, [
      dataflowAuditlogId,
      dataFlowId,
      newVersion,
      curDate,
      userId,
      "active",
      1,
      0,
    ]);

    return apiResponse.successResponseWithData(res, "Operation success", {
      success: true,
    });
  } catch (err) {
    Logger.error("catch :inActivateDataFlow");
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.syncDataFlow = async (req, res) => {
  try {
    let { version, userId, dataFlowId, action } = req.body;
    var dbconnection = await oracleDB();
    Logger.info({ message: "syncDataFlow" });
    let sequenceIdQ = `SELECT MAX(CDR_TA_QUEUE_ID) FROM IDP.CDR_TA_QUEUE`;
    const { rows } = await dbconnection.execute(sequenceIdQ);
    let SeqID;
    if (rows.length > 0) {
      SeqID = rows[0]["MAX(CDR_TA_QUEUE_ID)"] + 1;
    } else {
      SeqID = 1;
    }
    let q = `insert into IDP.CDR_TA_QUEUE(cdr_ta_queue_id,version,dataflowid,action_user,action,STATUS,INSERTTIMESTAMP) values (${SeqID},${version},'${dataFlowId}','${userId}','${action}','QUEUE',CURRENT_TIMESTAMP)`;
    const result = await dbconnection.execute(q);
    return apiResponse.successResponse(
      res,
      "Sync Pipeline configs successfully written to Kafka",
      {
        success: true,
      }
    );
  } catch (error) {
    Logger.error("catch :syncDataFlow");
    return apiResponse.ErrorResponse(res, error);
  } finally {
    // await doRelease(dbconnection);
    if (dbconnection) {
      try {
        await dbconnection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

exports.getDataflowDetail = async (req, res) => {
  try {
    const dataFlowId = req.params.dataFlowId;
    const searchQuery = `SELECT data_flow_nm, type, description, loc_typ from ${constants.DB_SCHEMA_NAME}.dataflow as dataflowTbl JOIN ${constants.DB_SCHEMA_NAME}.source_location as locationTbl ON locationTbl.src_loc_id = dataflowTbl.src_loc_id WHERE dataflowid = $1`;
    Logger.info({
      message: "datafloDetail",
    });
    DB.executeQuery(searchQuery, [dataFlowId]).then((response) => {
      const dataflowDetail = response.rows[0] || null;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        dataflowDetail
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :datafloDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
