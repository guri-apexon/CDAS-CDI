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

const creatDataflow = (exports.createDataflow = async (req, res) => {
  // return; // this return need to delete
  try {
    var validate = [];

    if (req.body.externalSystemName !== "CDI") {
      // var dataRes = insertValidation(req.body);
      var dataRes = externalFunction.insertValidation(req.body);

      if (dataRes.length > 0) {
        validate.push(dataRes);
        return apiResponse.ErrorResponse(res, validate);
      }
    }

    const uid = createUniqueID();
    let {
      active,
      connectionType,
      exptDtOfFirstProdFile,
      vendorName,
      protocolNumber,
      type,
      name,
      externalID,
      location,
      testFlag,
      userId,
      description,
      dataPackage,
      dataStructure,
      externalSystemName,
      src_loc_id,
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
    var ResponseBody = {};
    if (!type && dataStructure) type = dataStructure;

    let studyId = null;
    let dFTimestamp = helper.getCurrentTime();
    if (
      vendorName !== null &&
      protocolNumberStandard !== null &&
      description !== ""
    ) {
      const { rows: studyRows } = await DB.executeQuery(
        `select prot_id from study where prot_nbr_stnd ='${protocolNumberStandard}';`
      );
      if (!studyRows?.length) {
        return apiResponse.ErrorResponse(res, "Study not found");
      }
      testFlag = helper.stringToBoolean(testFlag);
      studyId = studyRows[0].prot_id;

      var DFTestname = `${vendorName}-${protocolNumberStandard}-${description}`;
      if (testFlag === true) {
        DFTestname = "TST-" + DFTestname;
      }
      //check for dataflowname && sequence logic
      const checkDFQuery = `select name from ${schemaName}.dataflow where name LIKE '${DFTestname}%';`;
      const executeCheckDf = await DB.executeQuery(checkDFQuery);
      if (executeCheckDf.rows.length > 0) {
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
      let q = `select vend_id from ${schemaName}.vendor where vend_nm='${vendorName}';`;
      let { rows } = await DB.executeQuery(q);
      let q1 = `select src_loc_id from ${schemaName}.source_location where cnn_url='${location}';`;
      let { rows: data } = await DB.executeQuery(q1);
      // if (rows.length > 0 && data.length > 0) {
      DFBody = [
        uid,
        DFTestname,
        externalSystemName === "CDI" ? vend_id : rows[0].vend_id,
        type || null,
        description || null,
        externalSystemName === "CDI" ? src_loc_id : data[0]?.src_loc_id || null,
        helper.stringToBoolean(active) ? 1 : 0,
        configured || 0,
        exptDtOfFirstProdFile || null,
        helper.stringToBoolean(testFlag) ? 1 : 0,
        data_in_cdr || "N",
        connectionType || null,
        externalSystemName || null,
        externalID || null,
        fsrstatus || null,
        studyId,
        dFTimestamp,
        serviceOwners && Array.isArray(serviceOwners)
          ? serviceOwners.join()
          : "",
      ];
      // insert dataflow schema into db
      let createDF = await DB.executeQuery(
        `insert into ${schemaName}.dataflow 
      (dataflowid,name,vend_id,type,description,src_loc_id,active,configured,expt_fst_prd_dt,
        testflag,data_in_cdr,connectiontype,externalsystemname,externalid,
        fsrstatus,prot_id,insrt_tm,updt_tm, refreshtimestamp, serv_ownr) VALUES 
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$17,$17, $18) returning dataflowid as "dataFlowId", name as "dataFlowName", type as adapter, description, active as status, testflag, connectiontype as "locationType", fsrstatus as "fsrStatus", prot_id as "studyId", externalsystemname as "externalSourceSystem";`,
        DFBody
      );
      let ts = dFTimestamp;
      ResponseBody.action = "Data flow created successfully.";
      ResponseBody.status = helper.stringToBoolean(active)
        ? "Active"
        : "Inactive";
      ResponseBody.timestamp = ts;
      ResponseBody.version = 1;
      ResponseBody.dataflowDetails = createDF.rows?.length
        ? createDF?.rows[0]
        : null;
      if (dataPackage && dataPackage.length > 0) {
        ResponseBody.data_packages = [];
        // if datapackage exists
        for (let each of dataPackage) {
          let newObj = {};
          const dpUid = createUniqueID();

          // if (each.name !== "" && each.path !== "" && each.type !== "") {

          let passwordStatus = "No";
          let { password } = each;

          if (password) {
            passwordStatus = "Yes";
            helper.writeVaultData(`${uid}/${dpUid}`, {
              password,
            });
          }

          let dPBody = [
            dpUid,
            each.type || null,
            each.name || null,
            each.path || null,
            each.sasXptMethod || null,
            passwordStatus,
            helper.stringToBoolean(each.active) ? 1 : 0,
            helper.stringToBoolean(each.noPackageConfig) ? 1 : 0,
            each.externalID || null,
            dFTimestamp,
            uid,
          ];
          let createDP = await DB.executeQuery(
            `INSERT INTO ${constants.DB_SCHEMA_NAME}.datapackage(datapackageid, type, name, path, sasxptmethod, password, active, nopackageconfig, externalid, insrt_tm, updt_tm, dataflowid)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10, $11)`,
            dPBody
          );
          newObj.timestamp = ts;
          newObj.externalId = each.externalID;
          newObj.datapackageid = dpUid;
          newObj.action = "Data package created successfully.";
          each.datapackageid = dpUid;
          ResponseBody.data_packages.push(newObj);

          await DB.executeQuery(
            `INSERT INTO ${schemaName}.dataflow_audit_log
          ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
            [
              uid,
              dpUid,
              null,
              null,
              1,
              "New Datapackage",
              "",
              "",
              externalSystemName === "CDI" ? userId : externalSystemName,
              dFTimestamp,
            ]
          );
          if (each.dataSet && each.dataSet.length > 0) {
            ResponseBody.data_sets = [];
            // if datasets exists
            for (let obj of each.dataSet) {
              // console.log("dataSet ", obj);
              let newobj = {};
              // if (
              //   obj.name !== "" &&
              //   obj.path !== "" &&
              //   obj.mnemonic !== "" &&
              // ) {
              let dataKind = null;
              if (obj.dataKind) {
                let checkDataKind = await DB.executeQuery(
                  `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}';`
                );
                dataKind = checkDataKind.rows[0]?.datakindid;
              }

              const dsUid = createUniqueID();
              let dsPasswordStatus;
              if (obj.filePwd) {
                let { filePwd } = obj;
                dsPasswordStatus = "Yes";
                helper.writeVaultData(`${uid}/${dpUid}/${dsUid}`, {
                  password: filePwd,
                });
              } else {
                dsPasswordStatus = "No";
              }

              let sqlQuery = "";
              if (obj.customQuery === "No") {
                if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                  const cList = obj.columnDefinition
                    .map((el) => el.name || el.columnName)
                    .join(", ");

                  sqlQuery = `Select ${cList} from ${obj.tableName} ${
                    obj.conditionalExpression
                      ? obj.conditionalExpression
                      : "where 1=1"
                  }`;
                } else {
                  sqlQuery = `Select from ${obj.tableName} ${
                    obj.conditionalExpression
                      ? obj.conditionalExpression
                      : "where 1=1"
                  }`;
                }
              } else {
                sqlQuery = obj.customSql;
              }

              let DSBody = [
                dsUid,
                dpUid,
                dataKind || null,
                obj.mnemonic || obj.datasetName || null,
                obj.fileNamingConvention || "",
                helper.stringToBoolean(obj.active) ? 1 : 0,
                typeof obj.columnCount != "undefined" ? obj.columnCount : 0,
                helper.stringToBoolean(obj.incremental) ? "Y" : "N",
                obj.offsetColumn || null,
                obj.type || obj.fileType || null,
                obj.path || null,
                obj.OverrideStaleAlert || null,
                obj.headerRowNumber > 0 ? 1 : 0,
                obj.footerRowNumber > 0 ? 1 : 0,
                obj.headerRowNumber || 0,
                obj.footerRowNumber || 0,
                sqlQuery || null,
                obj.customQuery || null,
                obj.tableName || null,
                obj.externalID || null,
                dsPasswordStatus || "No",
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
              ];
              let createDS = await DB.executeQuery(
                `insert into ${schemaName}.dataset(datasetid, datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
                offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
                customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", charset, escapecode, "quote", rowdecreaseallowed, data_freq, dataset_fltr ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $22, $22, $23, $24, $25, $26, $27, $28, $29)`,
                DSBody
              );
              newobj.timestamp = ts;
              newobj.externalId = obj.externalID;
              newobj.datasetid = dsUid;
              newobj.action = "Data set created successfully.";
              ResponseBody.data_sets.push(newobj);
              obj.datasetid = dsUid;
              await DB.executeQuery(
                `INSERT INTO ${schemaName}.dataflow_audit_log
              ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
              VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
                [
                  uid,
                  dpUid,
                  dsUid,
                  null,
                  1,
                  "New Dataset",
                  "",
                  "",
                  externalSystemName === "CDI" ? userId : externalSystemName,
                  dFTimestamp,
                ]
              );

              if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                ResponseBody.column_definition = [];
                for (let el of obj.columnDefinition) {
                  // console.log("column ", el);
                  let newobj = {};
                  const CDUid = createUniqueID();
                  let CDBody = [
                    dsUid,
                    CDUid,
                    el.name || el.columnName || null,
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
                  ];
                  await DB.executeQuery(
                    `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                    primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                    insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
                    CDBody
                  );

                  // dataflow audit
                  let dataflow_aduit_query = `INSERT INTO ${schemaName}.dataflow_audit_log
                  ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`;
                  let audit_body = [
                    uid,
                    dpUid,
                    dsUid,
                    CDUid,
                    1,
                    "New Column definition",
                    "",
                    "",
                    externalSystemName === "CDI" ? userId : externalSystemName,
                    dFTimestamp,
                  ];
                  await DB.executeQuery(dataflow_aduit_query, audit_body);

                  newobj.timestamp = ts;
                  newobj.colmunid = CDUid;
                  newobj.externalId = obj.externalID;
                  newobj.action = "column definition created successfully.";
                  el.colmunid = CDUid;
                  ResponseBody.column_definition.push(newobj);
                }
              }
            }
          }
        }
      }
    } else {
      return apiResponse.ErrorResponse(
        res,
        "Vendor name , protocol number and description is required"
      );
    }

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
    ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        uid,
        null,
        null,
        null,
        1,
        "New Dataflow",
        "",
        "",
        externalSystemName === "CDI" ? userId : externalSystemName,
        dFTimestamp,
      ]
    );
    let config_json = {
      dataFlowId: uid,
      vendorName: vendorName,
      protocolNumber: studyId,
      type: type,
      name: name,
      externalID: externalID,
      externalSystemName: externalSystemName,
      connectionType: connectionType,
      location: src_loc_id,
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
      uid,
      1,
      JSON.stringify(config_json),
      externalSystemName === "CDI" ? userId : externalSystemName,
      dFTimestamp,
    ];
    await DB.executeQuery(dataflow_version_query, aduit_version_body);

    let q = `INSERT INTO ${schemaName}.cdr_ta_queue
    (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
    VALUES($1, 'CONFIG', $2, 'QUEUE', $3, $3, '', 1, '', 1, '', 0)`;

    await DB.executeQuery(q, [
      uid,
      externalSystemName === "CDI" ? userId : externalSystemName,
      dFTimestamp,
    ]);

    await DB.executeQuery(
      `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
      [uid, dFTimestamp]
    );

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
});

exports.updateDataFlow = async (req, res) => {
  try {
    var validate = [];

    // console.log(req.body);
    let {
      active,
      connectionType,
      exptDtOfFirstProdFile,
      vendorName,
      protocolNumber,
      type,
      name,
      externalID,
      location,
      testFlag,
      userId,
      description,
      dataPackage,
      dataStructure,
      externalSystemName,
      src_loc_id,
      vend_id,
      fsrstatus,
      // connectiondriver,
      data_in_cdr,
      configured,
      sponsorNameStandard,
      sponsorName,
      externalVersion,
      protocolNumberStandard,
    } = req.body;

    // Dataflow External Id validation
    if (!externalID) {
      return apiResponse.ErrorResponse(
        res,
        "Data flow Level External Id required and data type should be string or Number"
      );
    }

    // Data Package External Id validation
    if (dataPackage && dataPackage.length > 0) {
      for (let each of dataPackage) {
        if (!each.externalID) {
          return apiResponse.ErrorResponse(
            res,
            "Data Package Level External Id required and data type should be string or Number"
          );
        }
        // Data Set External Id validation
        if (each.dataSet && each.dataSet.length > 0) {
          for (let obj of each.dataSet) {
            if (!obj.externalID) {
              return apiResponse.ErrorResponse(
                res,
                "Data Set Level External Id required and data type should be string or Number"
              );
            }
          }
        }
      }
    }

    // return;
    if (vendorName) {
      let q2 = `select vend_id from ${schemaName}.vendor where vend_nm=$1;`;
      let { rows } = await DB.executeQuery(q2, [vendorName]);
      if (rows.length <= 0) {
        return apiResponse.ErrorResponse(
          res,
          "This Vendor Name is not exist in DB"
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
          "This Protocol Number doesn't exist "
        );
      }
    }

    const valData = [];
    if (typeof type != "undefined") {
      valData.push({ key: "Type ", value: type, type: "string" });
    }
    if (typeof name != "undefined") {
      valData.push({ key: "name ", value: name, type: "string" });
    }
    if (typeof externalSystemName != "undefined") {
      valData.push({
        key: "externalSystemName ",
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

    const returnData = helper.validation(valData);

    if (returnData.length > 0) {
      return apiResponse.ErrorResponse(res, returnData);
    }

    let selectDataFlow = `select * from ${schemaName}.dataflow where externalid='${externalID}'`;
    let { rows } = await DB.executeQuery(selectDataFlow);

    if (rows.length > 0) {
      let selectVersion = `SELECT version from ${schemaName}.dataflow_version
        WHERE dataflowid = $1 order by version DESC limit 1`;

      const DFId = rows[0].dataflowid;
      let { rows: versions } = await DB.executeQuery(selectVersion, [DFId]);

      const Ver = versions[0].version || 0;
      const DFVer = Ver + 1;
      const ConnectionType = rows[0].connectiontype;
      const externalSysName = rows[0].externalsystemname;

      const cData = { dataFlowId: DFId };
      const conf_data = Object.assign(cData, req.body);

      var ResponseBody = {};
      ResponseBody.success = [];
      ResponseBody.errors = [];

      //dataFlow update function Call
      var updateDataflow = await externalFunction
        .dataflowUpdate(
          req.body,
          externalID,
          DFId,
          DFVer,
          externalSysName,
          conf_data
        )
        .then((res) => {
          ResponseBody.success.push(res.sucRes);
        });

      if (dataPackage && dataPackage.length > 0) {
        for (let each of dataPackage) {
          let selectDP = `select * from ${schemaName}.datapackage where externalid='${each.externalID}'`;
          let dpRows = await DB.executeQuery(selectDP);
          const packageExternalId = each.externalID;

          if (dpRows.rows.length > 0) {
            const DPId = dpRows.rows[0].datapackageid;

            var updatePackage = await externalFunction
              .packageUpdate(
                each,
                packageExternalId,
                DPId,
                DFId,
                DFVer,
                ConnectionType,
                externalSysName
              )
              .then((res) => {
                ResponseBody.errors.push(res.errRes);
                ResponseBody.success.push(res.sucRes);
              });

            if (each.dataSet && each.dataSet.length > 0) {
              // if datasets exists
              for (let obj of each.dataSet) {
                let selectDS = `select * from ${schemaName}.dataset where externalid='${obj.externalID}'`;
                let { rows: dsRows } = await DB.executeQuery(selectDS);

                const datasetExternalId = obj.externalID;
                if (dsRows.length > 0) {
                  const DSId = dsRows[0].datasetid;
                  const custSql = dsRows[0].customsql;
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
                      externalSysName
                    )
                    .then((res) => {
                      ResponseBody.errors.push(res.errRes);
                      ResponseBody.success.push(res.sucRes);
                    });

                  // if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                  //   ResponseBody.column_definition = [];
                  //   for (let el of obj.columnDefinition) {

                  //   }
                  // }
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
                      externalSysName
                    )
                    .then((res) => {
                      ResponseBody.errors.push(res.errRes);
                      ResponseBody.success.push(res.sucRes);
                    });
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
                externalSysName
              )
              .then((res) => {
                ResponseBody.errors.push(res.errRes);
                ResponseBody.success.push(res.sucRes);
              });
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
        "Data flow Update successfully.",
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
      "Sync Pipeline configs successfully written to Kafka",
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
            externalID: each.externalid,
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
              externalID: el.externalid,
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
    return apiResponse.successResponseWithData(res, "Operation success", {
      success: true,
    });
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
