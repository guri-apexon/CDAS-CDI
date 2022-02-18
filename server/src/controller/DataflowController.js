const DB = require("../config/db");
const oracleDB = require("../config/oracleDB");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getStudyDataflows = async (req, res) => {
  try {
    const { protocolId } = req.body;
    if (protocolId) {
      const query = `select "studyId","dataFlowId","dsCount","dpCount","studyName","version","dataFlowName","type","dateCreated","vendorSource",description,adapter,status,"externalSourceSystem","locationType","lastModified","lastSyncDate"
      from (select s.prot_id as "studyId", d.dataflowid as "dataFlowId",
      row_number () over(partition by d.dataflowid,d.prot_id order by dh."version" desc) as rnk,
      dsetcount.dsCount as "dsCount", dpackagecount.dpCount as "dpCount", s.prot_nbr as "studyName",
      dh."version", d.name as "dataFlowName", d.testflag as "type", d.insrt_tm as "dateCreated",
      vend_nm as "vendorSource", d.description, d.type as "adapter", d.active as "status",
      d.externalsystemname as "externalSourceSystem", loc_typ as "locationType", d.updt_tm as "lastModified",
      d.refreshtimestamp as "lastSyncDate" from ${schemaName}.dataflow d
      inner join ${schemaName}.vendor v on d.vend_id = v.vend_id
      inner join ${schemaName}.source_location sl on d.src_loc_id = sl.src_loc_id
      inner join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid
      inner join ${schemaName}.study s on d.prot_id = s.prot_id
      inner join (select dataflowid,max("version") as "version" from ${schemaName}.dataflow_version dv group by dataflowid ) dh on dh.dataflowid =d.dataflowid
      left join (select datapackageid, COUNT(DISTINCT datasetid) as dsCount FROM ${schemaName}.dataset d GROUP BY datapackageid) dsetcount on (d2.datapackageid=dsetcount.datapackageid)
      left join (select dataflowid, COUNT(DISTINCT datapackageid) as dpCount FROM ${schemaName}.datapackage d GROUP BY dataflowid) dpackagecount on (d.dataflowid=dpackagecount.dataflowid)
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
        let q = `select vend_id from ${schemaName}.vendor where vend_nm='${vendorName}'`;
        let { rows } = await DB.executeQuery(q);
        let q1 = `select src_loc_id from ${schemaName}.source_location where cnn_url='${location}'`;
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
            const checkDFQuery = `select data_flow_nm from ${schemaName}.dataflow where data_flow_nm LIKE '${DFTestname}%'`;
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

            const query = `insert into ${schemaName}.dataflow 
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
                        let dataKindQ = `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}'`;
                        let checkDataKind = await DB.executeQuery(dataKindQ);
                        if (checkDataKind.rows.length > 0) {
                          let datakindid = checkDataKind.rows[0].datakindid;
                          const dsUid = createUniqueID();
                          let DSQuery = `insert into ${schemaName}.dataset(datasetid,datapackageid,datakindid,datakind,mnemonic,columncount,incremental,
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
        let q = `select vend_nm from ${schemaName}.vendor where vend_id='${vendorID}'`;
        let { rows } = await DB.executeQuery(q);
        let q1 = `select cnn_url from ${schemaName}.source_location where src_loc_id='${locationName}'`;
        let { rows: data } = await DB.executeQuery(q1);
        if (rows.length > 0 && data.length > 0) {
          var DFTestname = `${rows[0].vend_nm}-${protocolNumberStandard}-${description}`;
          if (testFlag === "true") {
            DFTestname = "TST-" + DFTestname;
          }
          //check for dataflowname
          const checkDFQuery = `select data_flow_nm from ${schemaName}.dataflow where data_flow_nm LIKE '${DFTestname}%'`;
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
          const query = `insert into ${schemaName}.dataflow 
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
    `SELECT * from ${schemaName}.dataflow WHERE dataflowid=$1`,
    values
  ).then(async (response) => {
    dataFlow = response.rows ? response.rows[0] : null;
  });
  if (!dataFlow) {
    return "not_found";
  }
  const deleteQuery = `DELETE FROM ${schemaName}.dataflow_audit_log da
      WHERE da.dataflowid = $1`;
  await DB.executeQuery(deleteQuery, values)
    .then(async (response) => {
      const deleteQuery2 = `DELETE FROM ${schemaName}.temp_json_log da
      WHERE da.dataflowid = '${dataflowId}';
      DELETE FROM ${schemaName}.columndefinition cd WHERE cd.datasetid in (select datasetid FROM ${schemaName}.dataset ds
      WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}'));
      DELETE FROM ${schemaName}.columndefinition_history cd WHERE cd.datasetid in (select datasetid FROM ${schemaName}.dataset ds
      WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}'));
      DELETE FROM ${schemaName}.dataset ds
      WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}');
      DELETE FROM ${schemaName}.dataset_history ds
      WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}');
      DELETE FROM ${schemaName}.datapackage dp WHERE dp.dataflowid = '${dataflowId}';
      DELETE FROM ${schemaName}.datapackage_history dph WHERE dph.dataflowid = '${dataflowId}';`;

      await DB.executeQuery(deleteQuery2)
        .then(async (response2) => {
          const deleteQuery3 = `DELETE FROM ${schemaName}.dataflow
      WHERE dataflowid = $1`;
          await DB.executeQuery(deleteQuery3, values)
            .then(async (response3) => {
              if (response3.rowCount && response3.rowCount > 0) {
                const insertDeletedQuery = `INSERT INTO ${schemaName}.deleted_dataflow(df_del_id, dataflow_nm, del_by, del_dt, del_req_dt, prot_id) VALUES($1, $2, $3, $4, $5, $6)`;
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
  const insertTempQuery = `INSERT INTO ${schemaName}.temp_json_log(temp_json_log_id, dataflowid, trans_typ, trans_stat, no_of_retry_attempted, del_flg, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
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
  DB.executeQuery(`SELECT * FROM ${schemaName}.temp_json_log`).then(
    async (response) => {
      const logs = response.rows || [];
      if (logs.length) {
        logs.forEach((log) => {
          const { dataflowid: dataflowId, created_by: user_id } = log;
          DB.executeQuery(
            `SELECT * FROM ${schemaName}.user where usr_id = $1`,
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
    }
  );
};
exports.hardDelete = async (req, res) => {
  try {
    const { dataFlowId, userId } = req.body;
    DB.executeQuery(`SELECT * FROM ${schemaName}.user where usr_id = $1`, [
      userId,
    ]).then(async (response) => {
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

    const q0 = `select d3.active from ${schemaName}.dataflow d
    inner join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid  
    inner join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where d.dataflowid = $1`;
    const $q0 = await DB.executeQuery(q0, [dataFlowId]);

    if ($q0.rows.map((e) => e.active).includes(1)) {
      // const q1 = `SELECT "version" FROM ${schemaName}.dataflow_version WHERE dataflowid=$1 ORDER BY created_on DESC LIMIT 1`;
      const q2 = `UPDATE ${schemaName}.dataflow set active=1 WHERE dataflowid=$1`;
      const q3 = `INSERT INTO ${schemaName}.dataflow_audit_log
      (df_audit_log_id, dataflowid, audit_vers, audit_updt_dt, audit_updt_by, "attribute", old_val, new_val)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
      const q4 = `INSERT INTO ${schemaName}.dataflow_version (dataflowid, "version",  created_by, created_on)
      VALUES($1, $2, $3, $4)`;
      // const $q1 = await DB.executeQuery(q1, [dataFlowId]);
      // const currVersion = $q1.rows[0].version;
      // const newVersion = currVersion + 1;
      const $q2 = await DB.executeQuery(q2, [dataFlowId]);
      const $q3 = await DB.executeQuery(q3, [
        dataflowAuditlogId,
        dataFlowId,
        newVersion,
        curDate,
        userId,
        "active",
        0,
        1,
      ]);

      const $q4 = await DB.executeQuery(q4, [
        dataFlowId,
        newVersion,
        userId,
        curDate,
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
    // const q0 = `SELECT "version" FROM ${schemaName}.dataflow_version WHERE dataflowid=$1 ORDER BY created_on DESC LIMIT 1`;
    const q1 = `UPDATE ${schemaName}.dataflow set active=0 WHERE dataflowid=$1`;
    const q2 = `INSERT INTO ${schemaName}.dataflow_audit_log
    (df_audit_log_id, dataflowid, audit_vers, audit_updt_dt, audit_updt_by, "attribute", old_val, new_val)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
    const q3 = `INSERT INTO ${schemaName}.dataflow_version (dataflowid, "version",  created_by, created_on)
    VALUES($1, $2, $3, $4)`;

    // const $q0 = await DB.executeQuery(q0, [dataFlowId]);
    // const currVersion = $q0.rows[0].version;
    // const newVersion = currVersion + 1;
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

    const $q3 = await DB.executeQuery(q3, [
      dataFlowId,
      newVersion,
      userId,
      curDate,
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
    const searchQuery = `SELECT name, type, description, loc_typ from ${schemaName}.dataflow as dataflowTbl JOIN ${schemaName}.source_location as locationTbl ON locationTbl.src_loc_id = dataflowTbl.src_loc_id WHERE dataflowid = $1`;
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

exports.updateDataFlow = async (req, res) => {
  try {
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
    } = req.body;
    if (vendorName !== "") {
      var ResponseBody = {};
      let q = `select vend_id from ${schemaName}.vendor where vend_nm='${vendorName}'`;
      let { rows } = await DB.executeQuery(q);
      let q1 = `select src_loc_id from ${schemaName}.source_location where cnn_url='${location}'`;
      let { rows: data } = await DB.executeQuery(q1);
      if (rows.length > 0 && data.length > 0) {
        //validation for dataflow metadata
        if (
          vendorName !== null &&
          protocolNumberStandard !== null &&
          description !== ""
        ) {
          const query = `update ${
            constants.DB_SCHEMA_NAME
          }.dataflow set vend_id='${rows[0].vend_id}',
          type='${type}',description='${description}',src_loc_id=${
            data[0].src_loc_id
          },active=1,expt_fst_prd_dt='${exptDtOfFirstProdFile}',
          testflag=${
            testFlag === "false" ? 0 : 1
          },connectiontype='${connectionType}',connectiondriver='${location}',
          updt_tm=CURRENT_TIMESTAMP where extrnl_id='${externalID}'`;
          let ts = new Date().toLocaleString();
          // update dataflow schema into db
          let createDF = await DB.executeQuery(query);
          ResponseBody.action = "Data flow updated successfully.";
          ResponseBody.timestamp = ts;
          if (dataPackage && dataPackage.length > 0) {
            ResponseBody.data_packages = [];
            // if datapackage exists
            for (let each of dataPackage) {
              let newObj = {};
              const dpUid = createUniqueID();
              if (each.name !== "" && each.path !== "" && each.type !== "") {
                let DPQuery = `UPDATE ${
                  constants.DB_SCHEMA_NAME
                }.datapackage set type='${each.type}', name='${
                  each.name
                }', path='${each.path}',
                   password='${each.password}',active='${
                  each.active === false ? 0 : 1
                }',nopackageconfig='${each.noPackageConfig === false ? 0 : 1}',
                   updt_tm=CURRENT_TIMESTAMP where extrnl_id='${
                     each.externalID
                   }'`;
                let createDP = await DB.executeQuery(DPQuery);
                newObj.timestamp = ts;
                newObj.externalId = each.externalID;
                newObj.action = "Data package update successfully.";
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
                      let dataKindQ = `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}'`;
                      let checkDataKind = await DB.executeQuery(dataKindQ);
                      if (checkDataKind.rows.length > 0) {
                        let datakindid = checkDataKind.rows[0].datakindid;
                        const dsUid = createUniqueID();
                        let DSQuery = `UPDATE ${schemaName}.dataset set datakind='${obj.dataKind}',mnemonic='${obj.mnemonic}',columncount=${obj.columncount},incremental=${obj.incremental},
                        offsetcolumn='${obj.offsetColumn}',type='${obj.type}',path='${obj.path}',ovrd_stale_alert=${obj.OverrideStaleAlert} ,
                        headerrownumber=${obj.headerRowNumber},footerrownumber=${obj.footerRowNumber},customsql='${obj.customSql}',custm_sql_query='${obj.customQuery}',
                        tbl_nm='${obj.tableName}',updt_tm=CURRENT_TIMESTAMP where extrnl_id=${obj.externalID}`;
                        let createDS = await DB.executeQuery(DSQuery);
                        newobj.timestamp = ts;
                        newobj.externalId = obj.externalID;
                        newobj.action = "Data set update successfully.";
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
                    "Data flow update successfully",
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
              "Data flow update successfully",
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
    return apiResponse.successResponseWithData(
      res,
      "Data flow update successfully.",
      ResponseBody
    );
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :update dataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.searchDataflow = async (req, res) => {
  try {
    const searchParam = req.params.id.toLowerCase();
    const { studyId } = req.body;
    Logger.info({
      message: "searchDataflow",
      searchParam,
    });
    const searchQuery = `SELECT d.dataflowid,d."name" ,d.description, d.externalsystemname , v.vend_nm FROM ${schemaName}.dataflow d inner join ${schemaName}.vendor v on d.vend_id  = v.vend_id where d.prot_id = '${studyId}' and (LOWER(d.name)) LIKE '${searchParam}%' LIMIT 10`;
    // console.log(searchQuery);
    let { rows } = await DB.executeQuery(searchQuery);
    return apiResponse.successResponseWithData(res, "Operation success", {
      dataflows: rows,
      totalSize: rows.rowCount,
    });
  } catch (error) {
    console.log(error);
    Logger.error("catch :searchDataflow");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.fetchdataflowSource = async (req, res) => {
  try {
    let dataflow_id = req.params.id;
    let q = `select d."name",v.vend_nm as vendorName,sl.loc_typ as locationType ,d.description,d.vend_id ,d."type" , d.externalsystemname ,d.src_loc_id ,d.testflag ,d2."name" as datapackagename ,d3."name" as datasetname from ${schemaName}.dataflow d
    inner join ${schemaName}.vendor v on (v.vend_id = d.vend_id)
    inner join ${schemaName}.source_location sl on (sl.src_loc_id = d.src_loc_id)  
    inner join ${schemaName}.datapackage d2 on (d.dataflowid=d2.dataflowid)
      inner join ${schemaName}.dataset d3 on (d3.datapackageid=d2.datapackageid)
      where d.dataflowid ='${dataflow_id}'`;
    Logger.info({
      message: "fetchdataflowSource",
      dataflow_id,
    });
    let { rows } = await DB.executeQuery(q);
    return apiResponse.successResponseWithData(
      res,
      "Operation successfully.",
      rows
    );
  } catch (error) {
    console.log(error);
    Logger.error("catch :fetchdataflowSource");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.fetchdataflowDetails = async (req, res) => {
  try {
    let dataflow_id = req.params.id;
    let q = `select d."name" as dataflowname, d.*,v.vend_nm,sl.loc_typ, d2."name" as datapackagename, 
    d2.* ,d3."name" as datasetname ,d3.*,c.*
    from ${schemaName}.dataflow d
    inner join ${schemaName}.vendor v on (v.vend_id = d.vend_id)
    inner join ${schemaName}.source_location sl on (sl.src_loc_id = d.src_loc_id)  
    inner join ${schemaName}.datapackage d2 on (d.dataflowid=d2.dataflowid)
      inner join ${schemaName}.dataset d3 on (d3.datapackageid=d2.datapackageid)
      inner join cdas1d.cdascfg.columndefinition c on (c.datasetid =d3.datasetid)
      where d.dataflowid ='${dataflow_id}'`;
    Logger.info({
      message: "fetchdataflowDetails",
      dataflow_id,
    });
    let { rows } = await DB.executeQuery(q);
    let tempDP = _.uniqBy(rows, "datapackageid");
    let tempDS = _.uniqBy(rows, "datasetid");
    let newArr = [];
    for (const each of tempDP) {
      for (const el of tempDS) {
        if (el.datapackageid === each.datapackageid) {
          let datapackageObj = {
            externalID: each.externalid,
            type: each.type,
            sasXptMethod: each.sasxptmethod,
            path: each.path,
            password: each.password,
            noPackageConfig: each.nopackageconfig,
            name: each.datapackagename,
            dataSet: [],
          };
          if (el.datasetid === each.datasetid) {
            let datasetObj = {
              columncount: el.columncount,
              externalID: el.externalid,
              customQuery: el.customsql,
              customSql: el.customsql_query,
              tableName: el.tbl_nm,
              incremental: el.incremental,
              offsetColumn: el.offsetcolumn,
              type: el.type,
              dataTransferFrequency: el.data_freq,
              OverrideStaleAlert: el.ovrd_stale_alert,
              rowDecreaseAllowed: el.rowdecreaseallowed,
              quote: el.quote,
              path: el.path,
              name: el.datasetname,
              mnemonic: el.mnemonic,
              headerRowNumber: el.headerrownumber,
              footerRowNumber: el.footerrownumber,
              escapeCode: el.escapecode,
              delimiter: el.delimiter,
              dataKind: el.datakindid,
              naming_convention: el.naming_convention,
              columnDefinition: [],
            };
            for (let obj of rows) {
              if (obj.datasetid === el.datasetid) {
                let columnObj = {
                  name: obj.name,
                  dataType: obj.datatype,
                  primaryKey: obj.primarykey,
                  required: obj.required,
                  characterMin: obj.charactermin,
                  characterMax: obj.charactermax,
                  position: obj.position,
                  format: obj.format,
                  lov: obj.lov,
                  requiredfield: obj.requiredfield?.requiredfield || null,
                  unique: obj.unique,
                  variable: obj.variable?.variable || null,
                };
                datasetObj.columnDefinition.push(columnObj);
              }
            }
            datapackageObj.dataSet.push(datasetObj);
          }
          newArr.push(datapackageObj);
        }
      }
    }
    let myobj = {
      vendorName: rows[0].vend_nm,
      protocolNumber: rows[0].prot_id,
      type: rows[0].type,
      name: rows[0].dataflowname,
      externalID: rows[0].externalid,
      externalSystemName: rows[0].externalsystemname,
      connectionType: rows[0].connectiontype,
      location: rows[0].src_loc_id,
      exptDtOfFirstProdFile: rows[0].expt_fst_prd_dt,
      testFlag: rows[0].testflag,
      prodFlag: rows[0].testflag === 1 ? 1 : 0,
      description: rows[0].description,
      connectiondriver: rows[0].connectiondriver,
      fsrstatus: rows[0].fsrstatus,
      dataPackage: newArr,
    };
    return apiResponse.successResponseWithData(
      res,
      "Operation successfully.",
      myobj
    );
  } catch (error) {
    console.log(error);
    Logger.error("catch :fetchdataflowDetails");
    Logger.error(error);
    return apiResponse.ErrorResponse(res, error);
  }
};
