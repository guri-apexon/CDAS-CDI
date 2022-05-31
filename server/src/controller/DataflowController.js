const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { addDataflowHistory } = require("./CommonController");
const { DB_SCHEMA_NAME: schemaName } = constants;
const externalFunction = require("../createDataflow/externalDataflowFunctions");

exports.getStudyDataflows = async (req, res) => {
  try {
    const { protocolId } = req.body;
    if (protocolId) {
      const query = `select distinct
      "studyId",
      "dataFlowId",
      count(distinct datasetid) as "dsCount",
      count(distinct datapackageid) as "dpCount",
      "studyName",
      "version",
      "dataFlowName",
      "type",
      "dateCreated",
      "vendorSource",
      description,
      adapter,
      status,
      "externalSourceSystem",
      "fsrStatus",
      "locationType",
      "lastModified",
      "lastSyncDate"
      from
      (
      select
      s.prot_id as "studyId",
      d.dataflowid as "dataFlowId",
      d3.datapackageid ,
      d4.datasetid ,
      s.prot_nbr as "studyName",
      dh."version",
      d.name as "dataFlowName",
      d.fsrstatus as "fsrStatus",
      d.testflag as "type",
      d.insrt_tm as "dateCreated",
      vend_nm as "vendorSource",
      d.description,
      d.type as "adapter",
      d.active as "status",
      d.externalsystemname as "externalSourceSystem",
      loc_typ as "locationType",
      d.updt_tm as "lastModified",
      d.refreshtimestamp as "lastSyncDate"
      from
      ${schemaName}.dataflow d
      left join ${schemaName}.vendor v on d.vend_id = v.vend_id
      left join ${schemaName}.source_location sl on d.src_loc_id = sl.src_loc_id
      left join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid
      left join ${schemaName}.study s on d.prot_id = s.prot_id
      left join ${schemaName}.datapackage d3 on (d.dataflowid=d3.dataflowid)
      left join ${schemaName}.dataset d4 on (d3.datapackageid=d4.datapackageid)
      left join (select dataflowid,max("version") as "version" from ${schemaName}.dataflow_version dv group by dataflowid ) dh on dh.dataflowid = d.dataflowid
      where s.prot_id = $1
      and coalesce (d.del_flg,0) != 1
      ) as df
      group by "studyId","dataFlowId","studyName","version","dataFlowName","type","dateCreated","vendorSource",description,adapter,status,"externalSourceSystem",
      "fsrStatus","locationType","lastModified","lastSyncDate"`;

      // Logger.info({ message: "getStudyDataflows" });
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
        "Protocol is not selected",
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

const creatDataflow = (exports.createDataflow = async (req, res) => {
  let dataFlowId = null;
  try {
    var validate = [];

    let {
      active,
      connectionType,
      locationType,
      exptDtOfFirstProdFile,
      vendorid,
      protocolNumber,
      name,
      ExternalId,
      locationID,
      testFlag,
      userId,
      description,
      dataPackage,
      dataStructure,
      externalSystemName,
      vend_id,
      fsrstatus,
      // connectiondriver,
      data_in_cdr,
      configured,
      sponsorNameStandard,
      sponsorName,
      externalVersion,
      protocolNumberStandard,
      serviceOwners,
    } = req.body;

    if (externalSystemName !== "CDI") {
      var dataRes = externalFunction.insertValidation(req.body);
      if (serviceOwners && Array.isArray(serviceOwners)) {
        let serviceUrl = [];
        for (let key of serviceOwners) {
          const {
            rows: [callbackUrlObj],
          } = await DB.executeQuery(
            `select call_back_url_id from ${schemaName}.call_back_urls where serv_ownr='${key}';`
          );
          if (callbackUrlObj) {
            serviceUrl.push(callbackUrlObj.call_back_url_id);
          }
        }
        serviceOwners = serviceUrl;
      }

      if (dataRes.length) {
        validate.push(dataRes);
        return apiResponse.ErrorResponse(res, validate);
      }
    }

    // return;

    let ResponseBody = {};

    let studyId = null;
    let dFTimestamp = helper.getCurrentTime();
    if (!vendorid || !protocolNumberStandard || !description) {
      return apiResponse.ErrorResponse(
        res,
        "Vendor name , protocol number and description is required"
      );
    }

    const { rows: studyRows } = await DB.executeQuery(
      `select prot_id from study where prot_nbr_stnd ='${protocolNumberStandard}';`
    );
    if (!studyRows?.length) {
      return apiResponse.ErrorResponse(res, "Study not found");
    }
    testFlag = helper.stringToBoolean(testFlag);
    studyId = studyRows[0].prot_id;

    if (locationID) {
      const {
        rows: [selectedLocation],
      } = await DB.executeQuery(
        `select src_loc_id, active from ${schemaName}.source_location where src_loc_id=$1;`,
        [locationID]
      );

      if (!selectedLocation) {
        return apiResponse.ErrorResponse(
          res,
          `Location does not exist for ${externalSystemName}`
        );
      }
      if (selectedLocation.active !== 1) {
        return apiResponse.ErrorResponse(
          res,
          `Location is not active in ${externalSystemName}`
        );
      }
    }
    let q = `select vend_id,active,vend_nm from ${schemaName}.vendor where vend_id='${vendorid}';`;
    const {
      rows: [selectedVendor],
    } = await DB.executeQuery(q);
    if (!selectedVendor) {
      return apiResponse.ErrorResponse(res, `Vendor doesn't exist.`);
    }

    var DFTestname = `${selectedVendor.vend_nm}-${protocolNumberStandard}-${description}`;
    if (testFlag === true) {
      DFTestname = "TST-" + DFTestname;
    }
    //check for dataflowname && sequence logic
    const executeCheckDf = await DB.executeQuery(
      `select name from ${schemaName}.dataflow where name LIKE '${DFTestname}%';`
    );
    if (executeCheckDf?.rows?.length) {
      let splittedVal =
        executeCheckDf.rows[executeCheckDf.rows.length - 1].name.split("-");
      let _index = testFlag === true ? 4 : 3;
      if (splittedVal.length > _index) {
        let newParsed = parseInt(splittedVal[_index]);
        DFTestname = DFTestname + "-" + (newParsed + 1);
      } else {
        DFTestname = DFTestname + "-1";
      }
    }

    DFBody = [
      DFTestname,
      vendorid,
      dataStructure?.toLowerCase() || null,
      description || null,
      locationID || null,
      helper.stringToBoolean(active) ? 1 : 0,
      configured || 0,
      exptDtOfFirstProdFile || null,
      helper.stringToBoolean(testFlag) ? 1 : 0,
      data_in_cdr || "N",
      connectionType || locationType || null,
      externalSystemName || null,
      ExternalId || null,
      fsrstatus || null,
      studyId,
      dFTimestamp,
      serviceOwners && Array.isArray(serviceOwners) ? serviceOwners.join() : "",
      userId,
      0,
    ];
    // insert dataflow schema into db

    const {
      rows: [createdDF],
    } = await DB.executeQuery(
      `insert into ${schemaName}.dataflow 
    (name,vend_id,type,description,src_loc_id,active,configured,expt_fst_prd_dt,
      testflag,data_in_cdr,connectiontype,externalsystemname,externalid,
      fsrstatus,prot_id,insrt_tm,updt_tm, refreshtimestamp, serv_ownr,created_by_user,updated_by_user, del_flg) VALUES 
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16,$16,$17,$18,$18, $19) returning dataflowid as "dataFlowId", name as "dataFlowName", type as adapter, description, active as status, testflag, connectiontype as "locationType", fsrstatus as "fsrStatus", prot_id as "studyId", externalsystemname as "externalSourceSystem";`,
      DFBody
    );
    if (!createdDF) {
      return apiResponse.ErrorResponse(res, `Dataflow was not created.`);
    }
    let ts = dFTimestamp;
    dataFlowId = createdDF.dataFlowId;
    ResponseBody = {
      ...ResponseBody,
      action: "Data flow created successfully.",
      status: helper.stringToBoolean(active) ? "Active" : "Inactive",
      timestamp: ts,
      version: 1,
      dataflowDetails: createdDF,
    };
    if (dataPackage?.length) {
      ResponseBody.data_packages = [];
      // if datapackage exists
      for (let each of dataPackage) {
        // if (each.name !== "" && each.path !== "" && each.type !== "") {

        let dPBody = [
          each.type || null,
          each.name || each.namingConvention || null,
          each.path || null,
          each.sasXptMethod || null,
          each.password ? "Yes" : "No",
          helper.stringToBoolean(each.active) ? 1 : 0,
          helper.stringToBoolean(each.noPackageConfig) ? 1 : 0,
          each.ExternalId || null,
          dFTimestamp,
          createdDF.dataFlowId,
          0,
        ];
        const {
          rows: [createdDP],
        } = await DB.executeQuery(
          `INSERT INTO ${constants.DB_SCHEMA_NAME}.datapackage(type, name, path, sasxptmethod, password, active, nopackageconfig, externalid, insrt_tm, updt_tm, dataflowid, del_flg)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10, $11) returning datapackageid as "dataPackageId";`,
          dPBody
        );
        const dpUid = createdDP?.dataPackageId || null;
        if (!dpUid) {
          await externalFunction.dataflowRollBack(createdDF.dataFlowId);
          return apiResponse.ErrorResponse(
            res,
            `Something went wrong while creating datapackage (${
              each.name || each.namingConvention
            })`
          );
        }
        if (each.password) {
          helper.writeVaultData(`${createdDF.dataFlowId}/${dpUid}`, {
            password: each.password,
          });
        }

        let newObj = {
          timestamp: ts,
          externalId: each.ExternalId,
          datapackageid: dpUid,
          action: "Data package created successfully.",
        };
        ResponseBody.data_packages.push(newObj);

        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_audit_log
        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
          [
            createdDF.dataFlowId,
            dpUid,
            null,
            null,
            1,
            "New Datapackage",
            "",
            "",
            userId,
            dFTimestamp,
          ]
        );
        if (each.dataSet?.length) {
          ResponseBody.data_sets = [];
          // if datasets exists
          for (let obj of each.dataSet) {
            // if (
            //   obj.name !== "" &&
            //   obj.path !== "" &&
            //   obj.mnemonic !== "" &&
            // ) {
            let checkDataKind = await DB.executeQuery(
              `select datakindid, active from ${schemaName}.datakind where datakindid='${obj.dataKindID}';`
            );
            if (!checkDataKind?.rows?.length) {
              const dataSetRollBack = await externalFunction.dataflowRollBack(
                createdDF.dataFlowId
              );
              return apiResponse.ErrorResponse(
                res,
                `Clinical Data Type is missing from ${externalSystemName}, Description in TA cannot be integrated.`
              );
            }
            if (checkDataKind.rows[0].active !== 1) {
              const dataSetRollBack = await externalFunction.dataflowRollBack(
                createdDF.dataFlowId
              );
              return apiResponse.ErrorResponse(
                res,
                `Clinical Data Type is inactive from ${externalSystemName}, Description in TA cannot be integrated.`
              );
            }

            if (obj.datasetName) {
              const name = obj.datasetName;
              let {
                rows: [existedMnemonic],
              } = await DB.executeQuery(`select ds.mnemonic from ${schemaName}.dataset ds
              left join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
              left join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
              where ds.mnemonic ='${name}' and df.testflag ='${
                testFlag ? 1 : 0
              }'`);

              if (existedMnemonic) {
                const dataSetRollBack = await externalFunction.dataflowRollBack(
                  createdDF.dataFlowId
                );
                return apiResponse.ErrorResponse(
                  res,
                  "Mnemonic name already exists!"
                );
              }
            }
            console.log("createdDSAfter");

            let sqlQuery = "";
            if (obj.customQuery === "No" || obj.customsql_yn === "No") {
              if (obj.columnDefinition.length) {
                const cList = obj.columnDefinition
                  .map((el) => el.name || el.columnName)
                  .join(", ");

                sqlQuery = `Select ${cList} from ${
                  obj.tableName || obj.tbl_nm
                } ${
                  obj.conditionalExpression
                    ? obj.conditionalExpression
                    : "where 1=1"
                }`;
              } else {
                sqlQuery = `Select from ${obj.tableName || obj.tbl_nm} ${
                  obj.conditionalExpression
                    ? obj.conditionalExpression
                    : "where 1=1"
                }`;
              }
            } else {
              sqlQuery = obj.customSql || obj.customsql;
            }

            let DSBody = [
              dpUid,
              obj.dataKindID || null,
              obj.datasetName || null,
              obj.fileNamingConvention || obj.name || "",
              helper.stringToBoolean(obj.active) ? 1 : 0,
              typeof obj.columnCount != "undefined" ? obj.columnCount : 0,
              helper.stringToBoolean(obj.incremental) ? "Y" : "N",
              obj.offsetColumn || obj.offsetcolumn || null,
              obj.type || obj.fileType || null,
              obj.path || null,
              obj.OverrideStaleAlert || null,
              obj.headerRowNumber > 0 ? 1 : 0,
              obj.footerRowNumber > 0 ? 1 : 0,
              obj.headerRowNumber || 0,
              obj.footerRowNumber || 0,
              sqlQuery || null,
              obj.customQuery || obj.customsql_yn || null,
              obj.tableName || obj.tbl_nm || null,
              obj.ExternalId || null,
              obj.filePwd ? "Yes" : "No",
              dFTimestamp,
              obj.delimiter || "",
              obj.encoding || "UTF-8",
              // helper.convertEscapeChar(
              obj.escapeCode || obj.escapeCharacter || "",
              // ) || "",
              obj.quote || "",
              obj.rowDecreaseAllowed || 0,
              obj.dataTransferFrequency || "",
              obj.conditionalExpression,
              obj.offset_val || null,
              0,
            ];
            const {
              rows: [createdDS],
            } = await DB.executeQuery(
              `insert into ${schemaName}.dataset(datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
              offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
              customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", charset, escapecode, "quote", rowdecreaseallowed, data_freq, dataset_fltr,offset_val, del_flg )
               values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $21, $22, $23, $24, $25, $26, $27, $28,$29, $30) returning datasetid as "datasetId";`,
              DSBody
            );
            const dsUid = createdDS?.datasetId || null;
            if (!dsUid) {
              await externalFunction.dataflowRollBack(createdDF.dataFlowId);
              return apiResponse.ErrorResponse(
                res,
                `Something went wrong while creating dataset (${obj.datasetName})`
              );
            }
            if (obj.filePwd) {
              await helper.writeVaultData(
                `${createdDF.dataFlowId}/${dpUid}/${dsUid}`,
                {
                  password: obj.filePwd,
                }
              );
            }
            let newobj = {
              timestamp: ts,
              externalId: obj.ExternalId,
              datasetid: dsUid,
              action: "Data set created successfully.",
            };
            ResponseBody.data_sets.push(newobj);
            await DB.executeQuery(
              `INSERT INTO ${schemaName}.dataflow_audit_log
            ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
              [
                createdDF.dataFlowId,
                dpUid,
                dsUid,
                null,
                1,
                "New Dataset",
                "",
                "",
                userId,
                dFTimestamp,
              ]
            );

            if (obj.columnDefinition?.length) {
              ResponseBody.column_definition = [];
              for (let el of obj.columnDefinition) {
                if (el.columnName) {
                  let clName = await DB.executeQuery(
                    `select name from ${schemaName}.columndefinition where datasetid='${dsUid}' and name='${el.columnName}';`
                  );
                  if (clName.rows.length) {
                    await externalFunction.dataflowRollBack(
                      createdDF.dataFlowId
                    );
                    return apiResponse.ErrorResponse(
                      res,
                      `Column (${el.columnName}) Name already exist!`
                    );
                  }
                }

                let CDBody = [
                  dsUid,
                  el.columnName || null,
                  el.dataType || null,
                  helper.stringToBoolean(el.primaryKey) ? 1 : 0,
                  helper.stringToBoolean(el.required) ? 1 : 0,
                  el.characterMin || el.minLength || 0,
                  el.characterMax || el.maxLength || 0,
                  el.position || 0,
                  el.format || null,
                  el.lov || el.values || null,
                  helper.stringToBoolean(el.unique) ? 1 : 0,
                  el.requiredfield || null,
                  dFTimestamp,
                  el.ExternalId || null,
                  el.variableLabel || null,
                  0,
                ];
                const {
                  rows: [createdCD],
                } = await DB.executeQuery(
                  `insert into ${schemaName}.columndefinition(datasetid,name,datatype,
                  primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                  insrt_tm, updt_tm,externalid, variable,del_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13,$14, $15,$16) returning columnid as "columnId";`,
                  CDBody
                );
                const CDUid = createdCD?.columnId || null;
                if (!CDUid) {
                  await externalFunction.dataflowRollBack(createdDF.dataFlowId);
                  return apiResponse.ErrorResponse(
                    res,
                    `Something went wrong while creating column (${el.columnName})`
                  );
                }

                // column count update
                const {
                  rows: [existCDs],
                } = await DB.executeQuery(
                  `select count(*) from ${schemaName}.columndefinition where datasetid ='${dsUid}'`
                );
                const clCountUpdate = await DB.executeQuery(
                  `update ${schemaName}.dataset set columncount='${
                    existCDs.count || 0
                  }' where datasetid ='${dsUid}'`
                );

                // dataflow audit
                let dataflow_aduit_query = `INSERT INTO ${schemaName}.dataflow_audit_log
                ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`;
                let audit_body = [
                  createdDF.dataFlowId,
                  dpUid,
                  dsUid,
                  CDUid,
                  1,
                  "New Column definition",
                  "",
                  "",
                  userId,
                  dFTimestamp,
                ];
                await DB.executeQuery(dataflow_aduit_query, audit_body);

                let newobj = {
                  timestamp: ts,
                  colmunid: CDUid,
                  externalId: obj.ExternalId,
                  action: "Column definition created successfully.",
                };
                ResponseBody.column_definition.push(newobj);
              }
            }

            if (obj.qcType) {
              if (obj.conditionalExpressions?.length) {
                ResponseBody.vlc = [];
                for (let vlc of obj.conditionalExpressions) {
                  await externalFunction
                    .VlcInsert(
                      vlc,
                      obj.qcType,
                      createdDF.dataFlowId,
                      dpUid,
                      dsUid,
                      1,
                      userId
                    )
                    .then((res) => {
                      ResponseBody.vlc.push(res.sucRes);
                    });
                }
              }
            }
          }
        }
      }
    }

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
    ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        createdDF.dataFlowId,
        null,
        null,
        null,
        1,
        "New Dataflow",
        "",
        "",
        userId,
        dFTimestamp,
      ]
    );
    let config_json = {
      dataFlowId: createdDF.dataFlowId,
      vendorName: selectedVendor.vend_nm,
      protocolNumber: studyId,
      type: dataStructure,
      name: name,
      externalID: ExternalId,
      externalSystemName: externalSystemName,
      connectionType: connectionType || locationType,
      locationID,
      exptDtOfFirstProdFile: exptDtOfFirstProdFile,
      testFlag: helper.stringToBoolean(testFlag) ? 1 : 0,
      prodFlag: helper.stringToBoolean(testFlag) ? 0 : 1,
      description: description,
      fsrstatus: fsrstatus,
      dataPackage,
    };

    //insert into dataflow version config log table
    let dataflow_version_query = `INSERT INTO ${schemaName}.dataflow_version
    ( dataflowid, "version", config_json, created_by, created_on)
    VALUES($1,$2,$3,$4,$5);`;
    let aduit_version_body = [
      createdDF.dataFlowId,
      1,
      JSON.stringify(config_json),
      userId,
      dFTimestamp,
    ];
    await DB.executeQuery(dataflow_version_query, aduit_version_body);

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.cdr_ta_queue
    (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
    VALUES($1, 'CONFIG', $2, 'QUEUE', $3, $3, '', 1, '', 1, '', 0)`,
      [createdDF.dataFlowId, userId, dFTimestamp]
    );

    await DB.executeQuery(
      `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
      [createdDF.dataFlowId, dFTimestamp]
    );

    return apiResponse.successResponseWithData(
      res,
      "Data flow created successfully.",
      ResponseBody
    );
  } catch (err) {
    console.log("err", err);
    //throw error in json response with status 500.
    Logger.error("catch :createDataflow");
    await externalFunction.dataflowRollBack(dataFlowId);
    return apiResponse.ErrorResponse(
      res,
      err.message || "Something went wrong"
    );
  }
});

exports.updateDataFlow = async (req, res) => {
  try {
    var validate = [];

    // console.log(req.body);
    let {
      active,
      connectionType,
      exptDtOfFirstProdFile,
      protocolNumber,
      ExternalId,
      vendorid,
      locationID,
      locationType,
      testFlag,
      userId,
      description,
      dataPackage,
      dataStructure,
      externalSystemName,

      // connectiondriver,
      serviceOwners,
      data_in_cdr,
      configured,
      sponsorNameStandard,
      sponsorName,
      externalVersion,
      protocolNumberStandard,
      delFlag,
    } = req.body;

    // Dataflow External Id validation
    if (!ExternalId) {
      return apiResponse.ErrorResponse(
        res,
        "Dataflow level ExternalId required and data type should be string or number"
      );
    }

    // Dataflow External Id validation
    if (exptDtOfFirstProdFile) {
      function validateDOB(date) {
        var pattern =
          /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
        if (!pattern.test(date)) {
          // errMessage += "Invalid date of birth\n";
          return apiResponse.ErrorResponse(
            res,
            "exptDtOfFirstProdFile optional and data format should be [YYYY-MM-DD HH:MI:SS] "
          );
        }
        // else {
        //   return apiResponse.ErrorResponse(res, " Success ");
        // }
      }
      validateDOB(exptDtOfFirstProdFile);
    }

    // return;

    if (!userId) {
      return apiResponse.ErrorResponse(
        res,
        "userId required and data type should be string or Number"
      );
    }

    if (delFlag === null || delFlag === "" || delFlag === undefined) {
      return apiResponse.ErrorResponse(
        res,
        "Data flow Level delFlag  required and it's either 0 or 1"
      );
    }
    if (delFlag) {
      if (delFlag !== 1) {
        return apiResponse.ErrorResponse(
          res,
          "Data flow Level delFlag  value of either 0 or 1"
        );
      }
    }

    // Data Package External Id validation
    if (dataPackage && dataPackage.length > 0) {
      for (let each of dataPackage) {
        if (!each.ExternalId) {
          return apiResponse.ErrorResponse(
            res,
            "Datapackage level ExternalId required and data type should be string or number"
          );
        }

        if (
          each.delFlag === null ||
          each.delFlag === "" ||
          each.delFlag === undefined
        ) {
          return apiResponse.ErrorResponse(
            res,
            "Data Package Level delFlag  required and it's either 0 or 1"
          );
        }
        if (each.delFlag) {
          if (each.delFlag !== 1) {
            return apiResponse.ErrorResponse(
              res,
              "Data Package Level delFlag  value of either 0 or 1"
            );
          }
        }
        // Data Set External Id validation
        if (each.dataSet && each.dataSet.length > 0) {
          for (let obj of each.dataSet) {
            if (!obj.ExternalId) {
              return apiResponse.ErrorResponse(
                res,
                "Dataset level ExternalId required and data type should be string or number"
              );
            }
            if (
              obj.delFlag === null ||
              obj.delFlag === "" ||
              obj.delFlag === undefined
            ) {
              return apiResponse.ErrorResponse(
                res,
                "Data Set Level delFlag  required and it's either 0 or 1"
              );
            }
            if (obj.delFlag) {
              if (obj.delFlag !== 1) {
                return apiResponse.ErrorResponse(
                  res,
                  "Data Set Level delFlag  value of either 0 or 1"
                );
              }
            }

            if (obj.columnDefinition && obj.columnDefinition.length > 0) {
              for (let el of obj.columnDefinition) {
                if (!el.ExternalId) {
                  return apiResponse.ErrorResponse(
                    res,
                    "Column Definition Level ExternalId required and data type should be string or Number"
                  );
                }
                if (
                  el.delFlag === null ||
                  el.delFlag === "" ||
                  el.delFlag === undefined
                ) {
                  return apiResponse.ErrorResponse(
                    res,
                    "Column Definition Level delFlag  required and it's either 0 or 1"
                  );
                }
                if (el.delFlag) {
                  if (el.delFlag !== 1) {
                    return apiResponse.ErrorResponse(
                      res,
                      "Column Definition Level delFlag  value of either 0 or 1"
                    );
                  }
                }
              }
            }

            if (obj.qcType) {
              if (
                obj.conditionalExpressions &&
                obj.conditionalExpressions.length > 0
              ) {
                for (let vl of obj.conditionalExpressions) {
                  if (!vl.conditionalExpressionNumber) {
                    return apiResponse.ErrorResponse(
                      res,
                      "Conditional Expression Number1 required and Data Type should be Number"
                    );
                  } else {
                    if (typeof vl.conditionalExpressionNumber != "number") {
                      return apiResponse.ErrorResponse(
                        res,
                        "Conditional Expression Number required and Data Type should be Number"
                      );
                    }
                  }
                }

                if (obj.conditionalExpressions.length > 0) {
                  if (!obj.qcType) {
                    return apiResponse.ErrorResponse(
                      res,
                      "qcType required and Value should be VLC"
                    );
                  } else {
                    if (obj.qcType.toLowerCase() !== "vlc") {
                      return apiResponse.ErrorResponse(
                        res,
                        "qcType required and Value should be VLC"
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // return;
    if (vendorid) {
      let q2 = `select vend_id,active from ${schemaName}.vendor where vend_id=$1;`;
      let { rows } = await DB.executeQuery(q2, [vendorid]);

      if (rows.length > 0) {
        if (rows[0].active !== 1) {
          return apiResponse.ErrorResponse(
            res,
            `Vendor is not active in ${externalSystemName}`
          );
        }
      } else {
        return apiResponse.ErrorResponse(
          res,
          `Vendor does not exist for ${externalSystemName}`
        );
      }
    }

    if (locationID) {
      let q3 = `select src_loc_id,active from ${schemaName}.source_location where src_loc_id=$1;`;
      let locationData = await DB.executeQuery(q3, [locationID]);

      if (locationData.rows.length > 0) {
        if (locationData.rows[0].active !== 1) {
          return apiResponse.ErrorResponse(
            res,
            `Location is not active in ${externalSystemName}`
          );
        }
      } else {
        return apiResponse.ErrorResponse(
          res,
          `Location does not exist for ${externalSystemName}`
        );
      }
    }

    if (protocolNumberStandard) {
      const studyRows = await DB.executeQuery(
        `select prot_id from study where prot_nbr_stnd ='${protocolNumberStandard}';`
      );
      if (studyRows.rows.length <= 0) {
        return apiResponse.ErrorResponse(
          res,
          "This protocol number doesn't exist "
        );
      }
    }

    const valData = [];
    if (typeof dataStructure != "undefined") {
      valData.push({
        key: "dataStructure ",
        value: dataStructure,
        type: "string",
      });
    }

    if (!externalSystemName) {
      return apiResponse.ErrorResponse(
        res,
        "externalSystemName required and data type should be string"
      );
    } else {
      valData.push({
        key: "externalSystemName",
        value: externalSystemName,
        type: "string",
      });
    }

    if (typeof description != "undefined") {
      valData.push({
        key: "description ",
        value: description,
        type: "string",
        maxLength: 30,
      });
    }
    if (typeof testFlag != "undefined") {
      valData.push({
        key: "testFlag ",
        value: testFlag,
        type: "boolean",
      });
    }
    if (typeof active != "undefined") {
      valData.push({
        key: "active ",
        value: active,
        type: "boolean",
      });
    }
    if (serviceOwners) {
      if (Array.isArray(serviceOwners) === false)
        return apiResponse.ErrorResponse(
          res,
          "serviceOwners its optional and it should be array "
        );
    }

    const returnData = helper.validation(valData);

    if (returnData.length > 0) {
      return apiResponse.ErrorResponse(res, returnData);
    }

    let selectDataFlow = `select * from ${schemaName}.dataflow where externalsystemname='${externalSystemName}' and externalid='${ExternalId}'`;
    let { rows } = await DB.executeQuery(selectDataFlow);

    if (rows.length > 0) {
      let selectVersion = `SELECT version from ${schemaName}.dataflow_version
        WHERE dataflowid = $1 order by version DESC limit 1`;

      const DFId = rows[0].dataflowid;
      let { rows: versions } = await DB.executeQuery(selectVersion, [DFId]);

      const Ver = versions[0]?.version || 0;
      const DFVer = Ver + 1;
      const ConnectionType = rows[0].connectiontype;
      const externalSysName = rows[0].externalsystemname;

      const cData = { dataFlowId: DFId };
      const conf_data = Object.assign(cData, req.body);

      var ResponseBody = {};
      ResponseBody.success = [];
      ResponseBody.errors = [];

      if (rows[0].del_flg === 1) {
        return apiResponse.ErrorResponse(
          res,
          "This dataFlow data already removed"
        );
      }

      if (delFlag === 1) {
        await externalFunction
          .removeDataflow(
            DFId,
            ExternalId,
            DFVer,
            externalSysName,
            conf_data,
            userId
          )
          .then((res) => {
            ResponseBody.success.push(res.sucRes);
          });
      } else {
        //dataFlow update function Call
        var updateDataflow = await externalFunction
          .dataflowUpdate(
            req.body,
            ExternalId,
            DFId,
            DFVer,
            externalSysName,
            conf_data,
            userId
          )
          .then((res) => {
            if (Object.keys(res.sucRes).length !== 0) {
              ResponseBody.success.push(res.sucRes);
            }
          });

        if (dataPackage && dataPackage.length > 0) {
          for (let each of dataPackage) {
            let selectDP = `select * from ${schemaName}.datapackage where dataflowid='${DFId}' and externalid='${each.ExternalId}'`;
            let dpRows = await DB.executeQuery(selectDP);

            const packageExternalId = each.ExternalId;

            if (dpRows.rows.length > 0) {
              const DPId = dpRows.rows[0].datapackageid;

              if (dpRows.rows[0].del_flg == 1) {
                ResponseBody.errors.push([
                  `This - ${packageExternalId}  Data package already removed`,
                ]);
              } else {
                if (each.delFlag === 1) {
                  await externalFunction
                    .removeDataPackage(
                      packageExternalId,
                      DPId,
                      DFId,
                      DFVer,
                      userId
                    )
                    .then((res) => {
                      ResponseBody.success.push(res.sucRes);
                    });
                } else {
                  var updatePackage = await externalFunction
                    .packageUpdate(
                      each,
                      packageExternalId,
                      DPId,
                      DFId,
                      DFVer,
                      ConnectionType,
                      userId
                    )
                    .then((res) => {
                      if (Object.keys(res.sucRes).length !== 0) {
                        ResponseBody.success.push(res.sucRes);
                      }
                      if (Object.keys(res.errRes).length !== 0) {
                        ResponseBody.errors.push(res.errRes);
                      }
                    });

                  if (each.dataSet && each.dataSet.length > 0) {
                    // if datasets exists
                    for (let obj of each.dataSet) {
                      let selectDS = `select * from ${schemaName}.dataset where datapackageid='${DPId}' and externalid='${obj.ExternalId}'`;
                      let { rows: dsRows } = await DB.executeQuery(selectDS);

                      const datasetExternalId = obj.ExternalId;
                      if (dsRows.length > 0) {
                        const DSId = dsRows[0].datasetid;
                        const custSql = dsRows[0].customsql;

                        if (dsRows[0].del_flg == 1) {
                          ResponseBody.errors.push([
                            `This - ${datasetExternalId}  Data set already removed`,
                          ]);
                        } else {
                          if (obj.delFlag === 1) {
                            await externalFunction
                              .removeDataSet(
                                datasetExternalId,
                                DPId,
                                DFId,
                                DSId,
                                DFVer,
                                userId
                              )
                              .then((res) => {
                                ResponseBody.success.push(res.sucRes);
                              });
                          } else {
                            //Function call for update dataSet data
                            var updateDataset = await externalFunction
                              .datasetUpdate(
                                obj,
                                datasetExternalId,
                                DSId,
                                DPId,
                                DFId,
                                DFVer,
                                ConnectionType,
                                custSql,
                                externalSysName,
                                testFlag,
                                userId
                              )
                              .then((res) => {
                                if (Object.keys(res.sucRes).length !== 0) {
                                  ResponseBody.success.push(res.sucRes);
                                }
                                if (Object.keys(res.errRes).length !== 0) {
                                  ResponseBody.errors.push(res.errRes);
                                }
                              });

                            if (
                              obj.columnDefinition &&
                              obj.columnDefinition.length > 0
                            ) {
                              for (let el of obj.columnDefinition) {
                                let selectCD = `select * from ${schemaName}.columndefinition where datasetid='${DSId}' and externalid='${el.ExternalId}'`;
                                let { rows: cdRows } = await DB.executeQuery(
                                  selectCD
                                );

                                const cdExternalId = el.ExternalId;
                                if (cdRows.length > 0) {
                                  const cdId = cdRows[0].columnid;

                                  if (cdRows[0].del_flg === 1) {
                                    ResponseBody.errors.push([
                                      `This - ${cdExternalId}  column definition already removed`,
                                    ]);
                                  } else {
                                    if (el.delFlag === 1) {
                                      await externalFunction
                                        .removeColumnDefination(
                                          cdExternalId,
                                          DPId,
                                          DFId,
                                          DSId,
                                          DFVer,
                                          cdId,
                                          userId
                                        )
                                        .then((res) => {
                                          ResponseBody.success.push(res.sucRes);
                                        });
                                    } else {
                                      var updateClDef = await externalFunction
                                        .clDefUpdate(
                                          el,
                                          cdExternalId,
                                          DSId,
                                          DPId,
                                          DFId,
                                          cdId,
                                          DFVer,
                                          ConnectionType,
                                          userId
                                        )
                                        .then((res) => {
                                          if (
                                            Object.keys(res.sucRes).length !== 0
                                          ) {
                                            ResponseBody.success.push(
                                              res.sucRes
                                            );
                                          }
                                          if (
                                            Object.keys(res.errRes).length !== 0
                                          ) {
                                            ResponseBody.errors.push(
                                              res.errRes
                                            );
                                          }
                                        });
                                    }
                                  }
                                } else {
                                  var cdInsert = await externalFunction
                                    .columnDefinationInsert(
                                      el,
                                      cdExternalId,
                                      DPId,
                                      DFId,
                                      DSId,
                                      DFVer,
                                      ConnectionType,
                                      userId
                                    )
                                    .then((res) => {
                                      if (
                                        Object.keys(res.sucRes).length !== 0
                                      ) {
                                        ResponseBody.success.push(res.sucRes);
                                      }
                                      if (
                                        Object.keys(res.errRes).length !== 0
                                      ) {
                                        ResponseBody.errors.push(res.errRes);
                                      }
                                    });
                                }
                              }
                            }

                            if (obj.qcType) {
                              if (
                                obj.conditionalExpressions &&
                                obj.conditionalExpressions.length > 0
                              ) {
                                for (let vlc of obj.conditionalExpressions) {
                                  let selectVLC = `select * from ${schemaName}.dataset_qc_rules where datasetid='${DSId}' and ext_ruleid='${vlc.conditionalExpressionNumber}'`;
                                  let { rows: vlcRows } = await DB.executeQuery(
                                    selectVLC
                                  );

                                  if (vlcRows.length > 0) {
                                    if (vlcRows[0].active_yn === "N") {
                                      ResponseBody.errors.push([
                                        `This - ${vlcRows[0].ext_ruleid} Qc Rules already removed`,
                                      ]);
                                    } else {
                                      var VlcDataUpdate = await externalFunction
                                        .vlcUpdate(
                                          vlc,
                                          obj.qcType,
                                          DFId,
                                          DPId,
                                          DSId,
                                          DFVer,
                                          userId
                                        )
                                        .then((res) => {
                                          if (
                                            Object.keys(res.sucRes).length !== 0
                                          ) {
                                            ResponseBody.success.push(
                                              res.sucRes
                                            );
                                          }
                                          if (
                                            Object.keys(res.errRes).length !== 0
                                          ) {
                                            ResponseBody.errors.push(
                                              res.errRes
                                            );
                                          }
                                        });
                                    }
                                  } else {
                                    var VlcDataInsert = await externalFunction
                                      .VlcInsert(
                                        vlc,
                                        obj.qcType,
                                        DFId,
                                        DPId,
                                        DSId,
                                        DFVer,
                                        userId
                                      )
                                      .then((res) => {
                                        if (
                                          Object.keys(res.sucRes).length !== 0
                                        ) {
                                          ResponseBody.success.push(res.sucRes);
                                        }
                                        if (
                                          Object.keys(res.errRes).length !== 0
                                        ) {
                                          ResponseBody.errors.push(res.errRes);
                                        }
                                      });
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        // Function call for insert dataSet level data

                        var DatasetInsert = await externalFunction
                          .datasetLevelInsert(
                            obj,
                            datasetExternalId,
                            DPId,
                            DFId,
                            DFVer,
                            ConnectionType,
                            externalSysName,
                            testFlag,
                            userId
                          )
                          .then((res) => {
                            if (Object.keys(res.sucRes).length !== 0) {
                              ResponseBody.success.push(res.sucRes);
                            }
                            if (Object.keys(res.errRes).length !== 0) {
                              ResponseBody.errors.push(res.errRes);
                            }
                          });
                      }
                    }
                  }
                }
              }
            } else {
              var PackageInsert = await externalFunction
                .packageLevelInsert(
                  each,
                  DFId,
                  DFVer,
                  ConnectionType,
                  externalSysName,
                  testFlag,
                  userId
                )
                .then((res) => {
                  if (Object.keys(res.sucRes).length !== 0) {
                    ResponseBody.success.push(res.sucRes);
                  }
                  if (Object.keys(res.errRes).length !== 0) {
                    ResponseBody.errors.push(res.errRes);
                  }
                });
            }
          }
        }
      }
      const sucData = ResponseBody.success;
      let isEmpty = (arr) => Array.isArray(arr) && arr.every(isEmpty);

      if (isEmpty(sucData)) {
        const deleteQuery = `delete from ${schemaName}.dataflow_version where dataflowid='${DFId}' and 
        version ='${DFVer}'`;
        await DB.executeQuery(deleteQuery);
      }
      return apiResponse.successResponseWithData(
        res,
        "Dataflow update successfully.",
        ResponseBody
      );
    } else {
      var dataRes = creatDataflow(req, res);
    }
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :update dataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

// const hardDeleteTrigger = async (dataflowId, user) => {
//   const values = [dataflowId];
//   let result, dataFlow;
//   await DB.executeQuery(
//     `SELECT * from ${schemaName}.dataflow WHERE dataflowid=$1`,
//     values
//   ).then(async (response) => {
//     dataFlow = response.rows ? response.rows[0] : null;
//   });
//   if (!dataFlow) {
//     return "not_found";
//   }
//   const deleteQuery = `DELETE FROM ${schemaName}.dataflow_audit_log da
//       WHERE da.dataflowid = $1`;
//   await DB.executeQuery(deleteQuery, values)
//     .then(async (response) => {
//       const deleteQuery2 = `DELETE FROM ${schemaName}.temp_json_log da
//       WHERE da.dataflowid = '${dataflowId}';
//       DELETE FROM ${schemaName}.columndefinition cd WHERE cd.datasetid in (select datasetid FROM ${schemaName}.dataset ds
//       WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}'));
//       DELETE FROM ${schemaName}.columndefinition_history cd WHERE cd.datasetid in (select datasetid FROM ${schemaName}.dataset ds
//       WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}'));
//       DELETE FROM ${schemaName}.dataset ds
//       WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}');
//       DELETE FROM ${schemaName}.dataset_history ds
//       WHERE ds.datapackageid in (select datapackageid from ${schemaName}.datapackage dp where dp.dataflowid='${dataflowId}');
//       DELETE FROM ${schemaName}.datapackage dp WHERE dp.dataflowid = '${dataflowId}';
//       DELETE FROM ${schemaName}.datapackage_history dph WHERE dph.dataflowid = '${dataflowId}';`;

//       await DB.executeQuery(deleteQuery2)
//         .then(async (response2) => {
//           const deleteQuery3 = `DELETE FROM ${schemaName}.dataflow
//       WHERE dataflowid = $1`;
//           await DB.executeQuery(deleteQuery3, values)
//             .then(async (response3) => {
//               if (response3.rowCount && response3.rowCount > 0) {
//                 const insertDeletedQuery = `INSERT INTO ${schemaName}.deleted_dataflow(df_del_id, dataflow_nm, del_by, del_dt, del_req_dt, prot_id) VALUES($1, $2, $3, $4, $5, $6)`;
//                 const deleteDfId = helper.createUniqueID();
//                 const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
//                 const deletedValues = [
//                   deleteDfId,
//                   dataFlow.data_flow_nm,
//                   user.usr_id,
//                   currentTime,
//                   currentTime,
//                   "",
//                 ];
//                 await DB.executeQuery(insertDeletedQuery, deletedValues)
//                   .then(async (response) => {
//                     result = true;
//                   })
//                   .catch((err) => {
//                     result = false;
//                   });
//                 result = "deleted";
//               } else {
//                 result = "not_found";
//               }
//             })
//             .catch((err) => {
//               result = false;
//             });
//         })
//         .catch((err) => {
//           result = false;
//         });
//     })
//     .catch((err) => {
//       result = false;
//     });
//   return result;
// };

// const addDeleteTempLog = async (dataflowId, user) => {
//   const insertTempQuery = `INSERT INTO ${schemaName}.temp_json_log(temp_json_log_id, dataflowid, trans_typ, trans_stat, no_of_retry_attempted, del_flg, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
//   const tempId = helper.createUniqueID();
//   let result;
//   const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
//   const values = [
//     tempId,
//     dataflowId,
//     "DELETE",
//     "FAILURE",
//     1,
//     "N",
//     user.usr_id,
//     currentTime,
//     user.usr_id,
//     currentTime,
//   ];
//   await DB.executeQuery(insertTempQuery, values)
//     .then(async (response) => {
//       result = true;
//     })
//     .catch((err) => {
//       result = false;
//     });
//   return result;
// };

// exports.cronHardDelete = async () => {
//   DB.executeQuery(`SELECT * FROM ${schemaName}.temp_json_log`).then(
//     async (response) => {
//       const logs = response.rows || [];
//       if (logs.length) {
//         logs.forEach((log) => {
//           const { dataflowid: dataflowId, created_by: user_id } = log;
//           DB.executeQuery(
//             `SELECT * FROM ${schemaName}.user where usr_id = $1`,
//             [user_id]
//           ).then(async (response) => {
//             if (response.rows && response.rows.length) {
//               const user = response.rows[0];
//               const deleted = await hardDeleteTrigger(dataflowId, user);
//               if (deleted) {
//                 return true;
//               }
//               return false;
//             }
//           });
//         });
//       }
//     }
//   );
// };

// exports.hardDelete = async (req, res) => {
//   try {
//     const { dataFlowId, userId } = req.body;
//     DB.executeQuery(`SELECT * FROM ${schemaName}.user where usr_id = $1`, [
//       userId,
//     ]).then(async (response) => {
//       if (response.rows && response.rows.length) {
//         const user = response.rows[0];
//         const deleted = await hardDeleteTrigger(dataFlowId, user);
//         if (deleted == "deleted") {
//           return apiResponse.successResponseWithData(
//             res,
//             "Deleted successfully",
//             {
//               success: true,
//             }
//           );
//         } else if (deleted == "not_found") {
//           return apiResponse.successResponseWithData(
//             res,
//             "Dataflow not found",
//             {}
//           );
//         } else {
//           const inserted = await addDeleteTempLog(dataFlowId, user);
//           if (inserted) {
//             return apiResponse.successResponseWithData(
//               res,
//               "Deleted is in queue. System will delete it automatically after sometime.",
//               {
//                 success: false,
//               }
//             );
//           } else {
//             return apiResponse.successResponseWithData(
//               res,
//               "Something wrong. Please try again",
//               {}
//             );
//           }
//         }
//       } else {
//         return apiResponse.ErrorResponse(res, "User not found");
//       }
//     });
//   } catch (err) {
//     return apiResponse.ErrorResponse(res, err);
//   }
// };

exports.activateDataFlow = async (req, res) => {
  try {
    const { dataFlowId, userId } = req.body;
    Logger.info({ message: "activateDataFlow" });

    const q0 = `select d3.active from ${schemaName}.dataflow d
    inner join ${schemaName}.datapackage d2 on d.dataflowid = d2.dataflowid  
    inner join ${schemaName}.dataset d3 on d2.datapackageid = d3.datapackageid where d.dataflowid = $1 and d2.active=1`;
    const $q0 = await DB.executeQuery(q0, [dataFlowId]);

    if ($q0.rows.map((e) => e.active).includes(1)) {
      const q2 = `UPDATE ${schemaName}.dataflow set active=1 WHERE dataflowid=$1 returning *`;
      const updatedDF = await DB.executeQuery(q2, [dataFlowId]);

      if (!updatedDF?.rowCount) {
        return apiResponse.ErrorResponse(res, "Something went wrong on update");
      }
      const dataflowObj = updatedDF.rows[0];
      const existDf = { active: 0 };
      const diffObj = { active: 1 };

      const updatedLogs = await addDataflowHistory({
        dataflowId: dataFlowId,
        externalSystemName: "CDI",
        userId,
        config_json: dataflowObj,
        diffObj,
        existDf,
      });

      if (updatedLogs) {
        return apiResponse.successResponseWithData(
          res,
          "Dataflow config updated successfully.",
          { ...dataflowObj, version: updatedLogs }
        );
      }

      return apiResponse.successResponseWithData(res, "Operation success", {
        success: true,
      });
    }

    return apiResponse.validationErrorWithData(res, "Dataflow having issues", {
      success: false,
    });
  } catch (err) {
    Logger.error("catch :activateDataFlow");
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.inActivateDataFlow = async (req, res) => {
  try {
    const { dataFlowId, userId } = req.body;
    Logger.info({ message: "inActivateDataFlow" });

    const q1 = `UPDATE ${schemaName}.dataflow set active=0 WHERE dataflowid=$1 returning *`;
    const updatedDF = await DB.executeQuery(q1, [dataFlowId]);

    if (!updatedDF?.rowCount) {
      return apiResponse.ErrorResponse(res, "Something went wrong on update");
    }
    const dataflowObj = updatedDF.rows[0];
    const existDf = { active: 1 };
    const diffObj = { active: 0 };

    const updatedLogs = await addDataflowHistory({
      dataflowId: dataFlowId,
      externalSystemName: "CDI",
      userId,
      config_json: dataflowObj,
      diffObj,
      existDf,
    });

    if (updatedLogs) {
      return apiResponse.successResponseWithData(
        res,
        "Dataflow config updated successfully.",
        { ...dataflowObj, version: updatedLogs }
      );
    }

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
    let { version, userId, dataFlowId } = req.body;
    const curDate = helper.getCurrentTime();
    let q = `INSERT INTO ${schemaName}.cdr_ta_queue
    (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
    VALUES($1, 'SYNC', $2, 'QUEUE', $4, $4, '', $3, '', 1, '', 0)`;
    await DB.executeQuery(q, [dataFlowId, userId, version, curDate]);

    // await DB.executeQuery(
    //   `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
    //   [dataFlowId, curDate]
    // );

    return apiResponse.successResponse(
      res,
      "Sync pipeline configs successfully written to kafka",
      {
        success: true,
      }
    );
  } catch (error) {
    Logger.error("catch :syncDataFlow");
    return apiResponse.ErrorResponse(res, error);
  }
};

exports.getDataflowDetail = async (req, res) => {
  try {
    const dataFlowId = req.params.dataFlowId;
    const searchQuery = `SELECT dataflowTbl.active, locationTbl.usr_nm as username,  dataflowTbl.dataflowid, dataflowTbl.name, dataflowTbl.serv_ownr as serviceOwner, dataflowTbl.data_in_cdr as "isSync", dataflowTbl.testflag, dataflowTbl.type,  dataflowTbl.description ,v.vend_id as vendorID,v.vend_nm as vendorName,locationTbl.loc_typ as loctyp ,dataflowTbl.expt_fst_prd_dt as exptfstprddt, locationTbl.src_loc_id as srclocID, locationTbl.loc_alias_nm as locationName
    from ${schemaName}.dataflow as dataflowTbl 
    JOIN ${schemaName}.source_location as locationTbl ON locationTbl.src_loc_id = dataflowTbl.src_loc_id
    JOIN ${schemaName}.vendor v on (v.vend_id = dataflowTbl.vend_id)
    WHERE dataflowid = $1`;
    Logger.info({ message: "dataflowDetail" });
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
    Logger.error("catch :dataflowDetail");
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
    const searchQuery = `SELECT d.dataflowid, d."name" as "dataFlowName", d.description, d.externalsystemname as "externalSourceSystem" , v.vend_nm as "vendorSource" FROM ${schemaName}.dataflow d inner join ${schemaName}.vendor v on d.vend_id  = v.vend_id where d.prot_id = '${studyId}' and (LOWER(v.vend_nm)) LIKE '${searchParam}%' or (LOWER(d.name)) LIKE '${searchParam}%' or (LOWER(d.description)) LIKE '${searchParam}%' or (LOWER(d.externalsystemname)) LIKE '${searchParam}%' LIMIT 10`;
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
    d2.* ,d3."name" as datasetname ,d3.*,c.*,d.testflag as test_flag, dk.name as datakind, S.prot_nbr_stnd
    from ${schemaName}.dataflow d
    inner join ${schemaName}.vendor v on (v.vend_id = d.vend_id)
    inner Join ${schemaName}.study S on (d.prot_id = S.prot_id)
    inner join ${schemaName}.source_location sl on (sl.src_loc_id = d.src_loc_id)  
    left join ${schemaName}.datapackage d2 on (d.dataflowid=d2.dataflowid)
    left join ${schemaName}.dataset d3 on (d3.datapackageid=d2.datapackageid)
    left join ${schemaName}.datakind dk on (dk.datakindid=d3.datakindid)
    left join ${schemaName}.columndefinition c on (c.datasetid =d3.datasetid)
    where d.dataflowid ='${dataflow_id}'`;
    Logger.info({
      message: "fetchdataflowDetails",
      dataflow_id,
    });
    let { rows } = await DB.executeQuery(q);
    if (!rows.length || rows.length === 0) {
      return apiResponse.ErrorResponse(
        res,
        "There is no dataflow exist with this id"
      );
    }
    let response = rows;
    let tempDP = _.uniqBy(response, "datapackageid");
    let tempDS = _.uniqBy(response, "datasetid");
    let newArr = [];
    for (const each of tempDP) {
      for (const el of tempDS) {
        if (el.datapackageid === each.datapackageid) {
          let datapackageObj = {
            externalID: each.ExternalId,
            type: each.type,
            sasXptMethod: each.sasxptmethod,
            path: each.path,
            password: each.password,
            noPackageConfig: each.nopackageconfig,
            name: each.datapackagename,
            dataSet: [],
            active: each.active,
          };
          if (el.datasetid === each.datasetid) {
            let datasetObj = {
              columncount: el.columncount,
              externalID: el.ExternalId,
              customQuery: el.customsql_yn,
              customSql: el.customsql,
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
              active: el.active,
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
      protocolNumberStandard: rows[0].prot_nbr_stnd,
      type: rows[0].type,
      name: rows[0].dataflowname,
      externalID: rows[0].externalid,
      externalSystemName: rows[0].externalsystemname,
      connectionType: rows[0].connectiontype,
      location: rows[0].src_loc_id,
      locationName: rows[0].locationName,
      exptDtOfFirstProdFile: rows[0].expt_fst_prd_dt,
      testFlag: rows[0].test_flag,
      prodFlag: rows[0].test_flag === 1 ? 1 : 0,
      description: rows[0].description,
      // connectiondriver: rows[0].connectiondriver,
      fsrstatus: rows[0].fsrstatus,
      vend_id: rows[0].vend_id,
      src_loc_id: rows[0].src_loc_id,
      data_in_cdr: rows[0].data_in_cdr,
      configured: rows[0].configured,
      active: rows[0].active,
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

exports.hardDeleteNew = async (req, res) => {
  try {
    const { dataFlowId, userId, version, studyId, dataFlowName, fsrStatus } =
      req.body;
    const curDate = helper.getCurrentTime();
    const $q2 = `UPDATE ${schemaName}.dataflow SET updt_tm=$2, del_flg=1 WHERE dataflowid=$1`;
    const $q4 = `INSERT INTO ${schemaName}.dataflow_audit_log (dataflowid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt) 
    VALUES($1, $2, $3, $4, $5, $6, $7)`;

    Logger.info({ message: "hardDeleteNew" });
    const q2 = await DB.executeQuery($q2, [dataFlowId, curDate]);
    const q4 = await DB.executeQuery($q4, [
      dataFlowId,
      version,
      "del_flg",
      0,
      1,
      userId,
      curDate,
    ]);
    // await DB.executeQuery(
    //   `DELETE from ${schemaName}.dataflow_action WHERE df_id = $1`,
    //   [dataFlowId]
    // );
    const q3 = await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_action (df_id, df_nm, action_typ, df_status, action_usr, insrt_tmstmp, prot_id, df_versn)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        dataFlowId,
        dataFlowName,
        "delete",
        fsrStatus || "QUEUE", //"temp", //fsrStatus, // we are not getting any fsr status as of now
        userId,
        curDate,
        studyId,
        version,
      ]
    );
    return apiResponse.successResponseWithData(
      res,
      "Dataflow deleted successfully",
      {
        success: true,
      }
    );
  } catch (err) {
    Logger.error("catch :hardDeleteNew");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateDataflowConfig = async (req, res) => {
  try {
    let {
      connectionType,
      dataStructure,
      description,
      externalSystemName,
      firstFileDate,
      locationName,
      protocolNumberStandard,
      serviceOwners,
      testFlag,
      vendorID,
      dataflowId,
      userId,
    } = req.body;

    if (
      vendorID !== null &&
      protocolNumberStandard !== null &&
      description !== "" &&
      dataflowId &&
      userId
    ) {
      const { rows: existDfRows } = await DB.executeQuery(
        `SELECT vend_id as "vendorID", src_loc_id as "locationName", testflag as "testFlag", type as "dataStructure", description, connectiontype as "connectionType", serv_ownr as "serviceOwners", expt_fst_prd_dt as "firstFileDate" from ${schemaName}.dataflow WHERE dataflowid='${dataflowId}';`
      );
      if (!existDfRows?.length) {
        return apiResponse.ErrorResponse(res, "Dataflow doesn't exist");
      }
      const existDf = existDfRows[0];
      const dFTimestamp = helper.getCurrentTime();
      if (testFlag) testFlag = helper.stringToBoolean(testFlag) ? 1 : 0;
      serviceOwners =
        serviceOwners && Array.isArray(serviceOwners)
          ? serviceOwners.join()
          : "";
      const dFBody = [
        dataflowId,
        vendorID,
        dataStructure,
        description,
        locationName,
        testFlag,
        connectionType,
        externalSystemName,
        dFTimestamp,
        serviceOwners,
        moment(firstFileDate).isValid() ? firstFileDate : null,
      ];
      // update dataflow schema into db
      const updatedDF = await DB.executeQuery(
        `update ${schemaName}.dataflow set vend_id=$2, type=$3, description=$4, src_loc_id=$5, testflag=$6, connectiontype=$7, externalsystemname=$8, updt_tm=$9, serv_ownr=$10, expt_fst_prd_dt=$11 WHERE dataflowid=$1 returning *;`,
        dFBody
      );
      if (!updatedDF?.rowCount) {
        return apiResponse.ErrorResponse(res, "Something went wrong on update");
      }
      const dataflowObj = updatedDF.rows[0];
      const comparisionObj = {
        vendorID,
        dataStructure,
        description,
        locationName,
        testFlag,
        connectionType,
        serviceOwners,
      };
      if (!moment(firstFileDate).isSame(existDf.firstFileDate, "day")) {
        comparisionObj.firstFileDate = firstFileDate;
      }
      const diffObj = helper.getdiffKeys(comparisionObj, existDf);
      const updatedLogs = await addDataflowHistory({
        dataflowId,
        externalSystemName,
        userId,
        config_json: dataflowObj,
        diffObj,
        existDf,
      });

      if (updatedLogs) {
        return apiResponse.successResponseWithData(
          res,
          "Dataflow config updated successfully.",
          { ...dataflowObj, version: updatedLogs }
        );
      }
    } else {
      return apiResponse.ErrorResponse(
        res,
        "Vendor name , protocol number and description is required"
      );
    }
    return apiResponse.ErrorResponse(res, "Something went wrong");
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :createDataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
