const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const helper = require("../helpers/customFunctions");
const { trim } = require("lodash");
const constants = require("../config/constants");
const { addDataflowHistory } = require("./CommonController");
const { DB_SCHEMA_NAME: schemaName } = constants;
const externalFunction = require("../createDataflow/externalDataflowFunctions");
const datasetHelper = require("../helpers/datasetHelper");
const { checkPermissionStudy } = require("../helpers/userHelper");
const { Console } = require("winston/lib/winston/transports");

exports.getStudyDataflows = async (req, res) => {
  try {
    const { protocolId } = req.body;
    if (protocolId) {
      const query = `select 
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
      df.dataflowid as "dataFlowId",
      dp.datapackageid ,
      ds.datasetid ,
      s.prot_nbr as "studyName",
      dh."version",
      df.name as "dataFlowName",
      df.fsrstatus as "fsrStatus",
      df.testflag as "type",
      df.insrt_tm as "dateCreated",
      v.vend_nm as "vendorSource",
      df.description,
      df.type as "adapter",
      df.active as "status",
      df.externalsystemname as "externalSourceSystem",
      sl.loc_typ as "locationType",
      df.updt_tm as "lastModified",
      df.refreshtimestamp as "lastSyncDate"
      from ${schemaName}.study s 
      Inner JOIN ${schemaName}.dataflow df on s.prot_id = df.prot_id
      inner join ${schemaName}.vendor v on df.vend_id = v.vend_id
      inner join ${schemaName}.source_location sl on sl.src_loc_id = df.src_loc_id
      inner join ${schemaName}.datapackage dp on dp.dataflowid = df.dataflowid
      left join ${schemaName}.dataset ds on (ds.datapackageid= dp.datapackageid)
      left join (select dataflowid,max("version") as "version" from ${schemaName}.dataflow_version dv group by dataflowid ) dh on dh.dataflowid = df.dataflowid
      where s.prot_id = $1
      and coalesce (df.del_flg,0) != 1
      ) as df
      group by "studyId","dataFlowId","studyName","version","dataFlowName","type","dateCreated","vendorSource",description,adapter,status,"externalSourceSystem",
      "fsrStatus","locationType","lastModified","lastSyncDate";`;

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
              locationType: r.locationType || "",
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
const createDataflowName = async (
  vendorId,
  prtNbrStnd,
  desc,
  testFlag = false
) => {
  if (!vendorId || !prtNbrStnd || !desc) {
    return false;
  }
  const {
    rows: [selectedVendor],
  } = await DB.executeQuery(
    `select vend_id,active,vend_nm from ${schemaName}.vendor where vend_id='${vendorId}';`
  );
  if (!selectedVendor) return false;

  let dfNewName = `${selectedVendor.vend_nm}-${prtNbrStnd}-${desc}`;
  if (testFlag) {
    dfNewName = `TST-${dfNewName}`;
  }
  //check for dataflowname && sequence logic
  const { rows: dfRows } = await DB.executeQuery(
    `select name from ${schemaName}.dataflow where name LIKE '${dfNewName}%';`
  );
  if (dfRows?.length) {
    let dfNewVersion;
    const dfVersions = dfRows
      .map((d) => parseInt(d.name.split("-").pop()))
      .filter((d) => !isNaN(d));
    dfNewVersion = dfVersions.length ? Math.max(...dfVersions) + 1 : 1;
    dfNewName = `${dfNewName}-${dfNewVersion}`;
  }
  return dfNewName;
};

const creatDataflow = (exports.createDataflow = async (req, res, isCDI) => {
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

    let errorBody = {
      timestamp: helper.getCurrentTime(),
      ExternalId: ExternalId,
      externalSystemName: externalSystemName,
    };
    errorBody.errors = [];

    const permission = await checkPermissionStudy(
      userId,
      "Data Flow Configuration",
      protocolNumberStandard
    );

    if (!permission)
      return apiResponse.unauthorizedResponse(res, "Unauthorized Access");

    if (externalSystemName !== "CDI") {
      var dataRes = await externalFunction.insertValidation(req.body);
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
        errorBody.errors = errorBody.errors.concat(dataRes);
        return apiResponse.validationErrorWithData(
          res,
          "Data flow key validation message.",
          errorBody
        );
      }
    }

    console.log("Success");
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
    studyId = studyRows[0].prot_id;

    // check for duplicate mnemonics
    if (!ExternalId && dataPackage && Array.isArray(dataPackage)) {
      for (let i = 0; i < dataPackage.length; i++) {
        if (dataPackage[i].dataSet && Array.isArray(dataPackage[i].dataSet)) {
          for (let j = 0; j < dataPackage[i].dataSet.length; j++) {
            if (
              studyId &&
              vendorid &&
              (testFlag != null || testFlag != undefined) &&
              dataPackage[i].dataSet[j]?.dataKindID &&
              dataPackage[i].dataSet[j]?.datasetName
            ) {
              const comp = await datasetHelper.findByMnemonic(
                studyId,
                testFlag,
                vendorid,
                dataPackage[i].dataSet[j].dataKindID,
                dataPackage[i].dataSet[j].datasetName
              );

              if (comp) {
                return apiResponse.validationErrorWithData(
                  res,
                  `Mnemonic ${dataPackage[i].dataSet[j].datasetName} is not unique.`
                );
              }
            }
          }
        }
      }
    }

    // check for primaryKey
    if (dataStructure !== "TabularRaveSOD") {
      let saveflagyes = false;
      if (dataPackage && Array.isArray(dataPackage)) {
        for (let i = 0; i < dataPackage.length; i++) {
          if (dataPackage[i].dataSet && Array.isArray(dataPackage[i].dataSet)) {
            for (let k = 0; k < dataPackage[i].dataSet.length; k++) {
              /// Below value check is for incremental instead of loadtype
              if (dataPackage[i].dataSet[k].incremental === true) {
                if (
                  dataPackage[i].dataSet[k].columnDefinition &&
                  Array.isArray(dataPackage[i].dataSet[k].columnDefinition)
                ) {
                  for (
                    let j = 0;
                    j < dataPackage[i].dataSet[k].columnDefinition.length;
                    j++
                  ) {
                    if (
                      dataPackage[i].dataSet[k].columnDefinition[j]
                        .primaryKey === "Yes"
                    )
                      saveflagyes = true;
                  }
                }
                if (!saveflagyes)
                  return apiResponse.ErrorResponse(
                    res,
                    `At least one primaryKey column must be identified when incremental is true.`
                  );
              }
            }
          }
        }
      }
    }
    testFlag = helper.stringToBoolean(testFlag);

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
      dataStructure || null,
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

      // status: helper.stringToBoolean(active) ? "Active" : "Inactive",
      version: 1,
      timestamp: ts,
      // dataflowDetails: createdDF,

      ExternalId: ExternalId,
      dataFlowName: DFTestname,
      ID: createdDF.dataFlowId,
      // ResponseCode: "00000",
      // ResponseMessage: "Dataflow created successfully",
      externalSystemName: externalSystemName,
      errors: [],
    };

    if (isCDI) {
      ResponseBody.dataflowDetails = createdDF;
    }

    if (dataPackage?.length) {
      ResponseBody.dataPackages = [];

      let dfErrNewobj = {
        ExternalId: ExternalId,
      };
      dfErrNewobj.dataPackages = [];
      // if datapackage exists
      for (let each of dataPackage) {
        var PackageInsert = await externalFunction.packageLevelInsert(
          each,
          createdDF.dataFlowId,
          1,
          connectionType,
          externalSystemName,
          testFlag,
          userId,
          true
        );
        if (PackageInsert.sucRes) {
          // console.log("dataflow", PackageInsert.sucRes);
          ResponseBody.dataPackages.push(PackageInsert.sucRes);
        }
        // if (PackageInsert.errRes.length)
        if (PackageInsert.errRes && Object.keys(PackageInsert.errRes)?.length) {
          // return apiResponse.errResponse(res, PackageInsert.errRes);

          dfErrNewobj.dataPackages.push(PackageInsert.errRes);
          errorBody.errors.push(dfErrNewobj);
          return apiResponse.validationErrorWithData(
            res,
            "Data flow key validation message.",
            errorBody
          );
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
      ResponseBody,
      "00000"
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
      protocolNumberStandard,
      delFlag,
    } = req.body;

    // if (externalSystemName === "CDI") {
    //   await creatDataflow(req, res);
    //   return false;
    // }
    const isCDI = externalSystemName === "CDI" ? true : false;

    var validate = [];
    let returnData = [];
    let valData = [];
    let ts = new Date().toLocaleString();

    let errorBody = {
      timestamp: ts,
      ExternalId: ExternalId,
      externalSystemName: externalSystemName,
    };
    errorBody.errors = [];
    let dfErrObj = {
      ExternalId: ExternalId,
    };

    if (!ExternalId && !isCDI) {
      dfErrObj.message =
        "Dataflow level ExternalId required and data type should be string or number";
      errorBody.errors.push(dfErrObj);
      return apiResponse.validationErrorWithData(
        res,
        "Data flow key validation message.",
        errorBody
      );
    }

    if (!userId) {
      dfErrObj.message =
        "userId required and data type should be string or Number";
      errorBody.errors.push(dfErrObj);
      return apiResponse.validationErrorWithData(
        res,
        "Data flow key validation message.",
        errorBody
      );
    }

    if (!isCDI) {
      if (
        typeof delFlag === "undefined" ||
        !["0", "1"].includes(delFlag?.toString())
      ) {
        dfErrObj.message =
          "Data flow Level delFlag required and it's either 0 or 1 New";
        errorBody.errors.push(dfErrObj);
        return apiResponse.validationErrorWithData(
          res,
          "Data flow key validation message.",
          errorBody
        );
      }
    }

    if (!externalSystemName) {
      dfErrObj.message =
        "externalSystemName required and data type should be string";
      errorBody.errors.push(dfErrObj);
      return apiResponse.validationErrorWithData(
        res,
        "Data flow key validation message.",
        errorBody
      );
    }

    // Data Package External Id validation
    if (dataPackage && dataPackage.length && !isCDI) {
      dfErrObj.dataPackages = [];
      let dpErrArray = [];
      let isval = false;

      for (let each of dataPackage) {
        let dpNewObj = {
          ExternalId: each.ExternalId,
        };
        if (!each.ExternalId) {
          dpErrArray.push(
            "Datapackage level ExternalId required and data type should be string or number"
          );
        }

        if (
          typeof each.delFlag === "undefined" ||
          !["0", "1"].includes(each.delFlag?.toString())
        ) {
          dpErrArray.push(
            "Data Package Level delFlag required and it's either 0 or 1"
          );
        }

        if (dpErrArray.length > 0) {
          let dpErrRes = dpErrArray.join(" '|' ");
          dpNewObj.message = dpErrRes;
          isval = true;
        }
        dfErrObj.dataPackages.push(dpNewObj);
        // Data Set External Id validation
        if (each.dataSet?.length) {
          dpNewObj.dataSets = [];
          let dsErrArray = [];

          for (let obj of each.dataSet) {
            let dsNewObj = {
              ExternalId: obj.ExternalId,
            };

            if (!obj.ExternalId) {
              dsErrArray.push(
                "Dataset level ExternalId required and data type should be string or number"
              );
            }
            if (
              typeof obj.delFlag === "undefined" ||
              !["0", "1"].includes(obj.delFlag?.toString())
            ) {
              dsErrArray.push(
                "Data Set Level delFlag  required and it's either 0 or 1"
              );
            }

            if (obj.conditionalExpressions?.length) {
              if (!obj.qcType || obj.qcType?.toLowerCase() !== "vlc") {
                dsErrArray.push("qcType required and Value should be VLC");
              }
            }

            if (dsErrArray.length > 0) {
              let dsErrRes = dsErrArray.join(" '|' ");
              dsNewObj.message = dsErrRes;
              isval = true;
            }
            dpNewObj.dataSets.push(dsNewObj);

            if (obj.columnDefinition?.length) {
              dsNewObj.columnDefinition = [];
              let clErrArray = [];
              for (let el of obj.columnDefinition) {
                let clNewObj = {
                  ExternalId: el.ExternalId,
                };

                if (!el.ExternalId) {
                  clErrArray.push(
                    "Column Definition Level ExternalId required and data type should be string or Number"
                  );
                }
                if (
                  typeof el.delFlag === "undefined" ||
                  !["0", "1"].includes(el.delFlag?.toString())
                ) {
                  clErrArray.push(
                    "Column Definition Level delFlag  required and it's either 0 or 1"
                  );
                }

                if (clErrArray.length > 0) {
                  let clErrRes = clErrArray.join(" '|' ");
                  clNewObj.message = clErrRes;
                  isval = true;
                }
                dsNewObj.columnDefinition.push(clNewObj);
              }
            }

            if (obj.qcType) {
              if (obj.conditionalExpressions?.length) {
                dsNewObj.vlc = [];

                for (let vl of obj.conditionalExpressions) {
                  let vlcNewObj = {
                    conditionalExpressionNumber: vl.conditionalExpressionNumber,
                  };
                  if (
                    !vl.conditionalExpressionNumber ||
                    typeof vl.conditionalExpressionNumber != "number"
                  ) {
                    (vlcNewObj.message =
                      "conditionalExpressionNumber required and Data Type should be Number"),
                      (isval = true);
                  }
                  dsNewObj.vlc.push(vlcNewObj);
                }
              }
            }
          }
        }
        if (isval) {
          errorBody.errors.push(dfErrObj);
          return apiResponse.validationErrorWithData(
            res,
            "Data flow key validation message.",
            errorBody
          );
        }
      }
    }

    // data package configuration validatiaon for both internal and external system
    if (
      !ExternalId &&
      dataPackage &&
      Array.isArray(dataPackage) &&
      (helper.isSftp(connectionType) || helper.isSftp(locationType))
    ) {
      const errorPackage = [];

      for (let each of dataPackage) {
        if (each.noPackageConfig === 0) {
          const errorMessages = helper.validateNoPackagesChecked(each);

          const messageCount = errorMessages.length;
          if (messageCount > 0) {
            messageCount === 1
              ? errorPackage.push(errorMessages[0])
              : errorPackage.push(errorMessages.join(" '|' "));
          }
        }
        if (each && each.noPackageConfig === 1) {
          const errorMessages = helper.validateNoPackagesUnChecked(each);
          const messageCount = errorMessages.length;
          if (messageCount > 0) {
            messageCount === 1
              ? errorPackage.push(errorMessages[0])
              : errorPackage.push(errorMessages.join(" '|' "));
          }
        }

        if (each && each.noPackageConfig === 0) {
          if (
            !each.type ||
            (!each.name && !each.namingConvention) ||
            trim(each.type).length === 0 ||
            (trim(each.name).length === 0 &&
              trim(each.namingConvention).length === 0)
          ) {
            errorPackage.push(
              "If Package is opted, Package name and type are mandatory and can not be blank"
            );
          }
        }
      }
      if (errorPackage.length > 0) {
        return apiResponse.validationErrorWithData(res, errorPackage);
      }
    }
    // // return;

    // // const resErr = helper.validation(valData);
    // if (resErr.length) {
    //   returnData.push(resErr);
    // }

    // if (returnData.length) {
    //   return apiResponse.validationErrorWithData(res, returnData);
    // }
    if (!isCDI) {
    }
    let {
      rows: [existDf],
    } = await DB.executeQuery(
      `select * from ${schemaName}.dataflow where UPPER(externalsystemname)='${externalSystemName.toUpperCase()}' and externalid='${ExternalId}'`
    );

    if (existDf && !isCDI) {
      const DFId = existDf.dataflowid;
      let { rows: versions } = await DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = $1 order by version DESC limit 1`,
        [DFId]
      );

      const DFVer = (versions[0]?.version || 0) + 1;
      const ConnectionType = existDf.connectiontype;
      const externalSysName = existDf.externalsystemname;
      const dataflowHelper = require("../helpers/dataflowHelper");
      const datasetHelper = require("../helpers/datasetHelper");

      const cData = { dataFlowId: DFId };
      const conf_data = Object.assign(cData, req.body);

      let isSomthingUpdate = false;
      let isAnyError = false;
      let ResponseBody = {
        version: DFVer,
        timestamp: ts,
        ExternalId: ExternalId,
        dataFlowName: existDf.name,
        ID: DFId,
        // ResponseCode: "00000",
        // ResponseMessage: "Dataflow update successfully",
        externalSystemName: existDf.externalsystemname,
        dataPackages: [],
        errors: [],
      };
      // ResponseBody.success = [];
      // ResponseBody.errors = [];
      let errRes = {
        ExternalId: ExternalId,
        ID: DFId,
      };

      if (existDf.del_flg === 1) {
        errRes.message = "This dataFlow already removed";
        isAnyError = true;
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
            if (res && res.sucRes) {
              isSomthingUpdate = true;
            }
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
            userId,
            ConnectionType
          )
          .then((res) => {
            if (res && res.errRes?.length) {
              let dfErrRes = res.errRes.join(" '|' ");
              errRes.message = dfErrRes;
              isAnyError = true;
            }

            if (res && res.sucRes) {
              // console.log("res.sucRes", res.sucRes);
              (ResponseBody.dataFlowName = res.sucRes.name),
                (isSomthingUpdate = true);
            }
          });

        if (dataPackage && Array.isArray(dataPackage) && dataPackage.length) {
          errRes.dataPackages = [];
          for (let each of dataPackage) {
            let dpResObj = {};
            let dpErrObj = {};

            let dpRows = await DB.executeQuery(
              `select * from ${schemaName}.datapackage where dataflowid='${DFId}' and externalid='${each.ExternalId}'`
            );

            const packageExternalId = each.ExternalId;
            const currentDp = dpRows.rows ? dpRows.rows[0] : null;

            dpErrObj.ExternalId = packageExternalId;

            if (currentDp) {
              const DPId = currentDp.datapackageid;
              dpResObj.ExternalId = packageExternalId;
              dpResObj.ID = DPId;

              dpErrObj.ID = DPId;

              if (currentDp.del_flg == 1) {
                (dpErrObj.message = `This Data package already removed`),
                  (isAnyError = true);
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
                      if (res && res.sucRes) {
                        // ResponseBody.dataPackage.push(res.sucRes);
                        isSomthingUpdate = true;
                      }
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
                      // if (res.sucRes?.length) {
                      //   ResponseBody.success.push(res.sucRes);
                      // }
                      if (res && res.sucRes) {
                        // dpResObj = res.sucRes;
                        isSomthingUpdate = true;
                      }
                      if (res && res.errRes?.length) {
                        let dpErrRes = res.errRes.join(" '|' ");
                        dpErrObj.message = dpErrRes;
                        isAnyError = true;
                      }
                    });

                  if (each.dataSet?.length) {
                    let dpRowsUpdated = await DB.executeQuery(
                      `select * from ${schemaName}.datapackage where dataflowid='${DFId}' and externalid='${each.ExternalId}'`
                    );
                    const noPackageConfig =
                      dpRowsUpdated?.rows[0].nopackageconfig;
                    // if datasets exists
                    dpResObj.dataSets = [];
                    dpErrObj.dataSets = [];

                    for (let obj of each.dataSet) {
                      let dsResObj = {};
                      let dsErrObj = {};
                      let selectDS = `select * from ${schemaName}.dataset where datapackageid='${DPId}' and externalid='${obj.ExternalId}'`;
                      let { rows: dsRows } = await DB.executeQuery(selectDS);

                      const datasetExternalId = obj.ExternalId;
                      const currentDs = dsRows ? dsRows[0] : null;

                      if (currentDs) {
                        const DSId = currentDs.datasetid;
                        const custSql = currentDs.customsql;
                        const DSheaderRow = currentDs.headerrow;
                        const dataflow = await dataflowHelper.findById(DFId);
                        const dataset = await datasetHelper.findById(DSId);

                        // check for primaryKey for Prod
                        let saveyesflag = false;
                        if (testFlag === 0) {
                          for (let i = 0; i < dataPackage.length; i++) {
                            if (
                              dataPackage[i].dataSet[i].incremental === true
                            ) {
                              for (
                                let j = 0;
                                j <
                                dataPackage[0].dataSet[0].columnDefinition
                                  .length;
                                j++
                              ) {
                                if (
                                  dataPackage[0].dataSet[0].columnDefinition[j]
                                    .primaryKey === "Yes"
                                )
                                  saveyesflag = true;
                              }
                              if (!saveyesflag)
                                return apiResponse.ErrorResponse(
                                  res,
                                  `Cannot switch to Incremental if a primaryKey has not been defined as primaryKey is mandatory for incremental.`
                                );
                            }
                          }
                        }
                        if (
                          dataflow.data_in_cdr === "Y" &&
                          dataset.incremental === "Y" &&
                          testFlag === 0 &&
                          dataPackage[0].dataSet[0].incremental === false
                        ) {
                          return apiResponse.ErrorResponse(
                            res,
                            `Cannot switch to Cumulative if the dataflow has been synced once.`
                          );
                        }

                        dsResObj.ExternalId = datasetExternalId;
                        dsResObj.ID = DSId;

                        dsErrObj.ExternalId = datasetExternalId;
                        dsErrObj.ID = DSId;

                        if (currentDs.del_flg == 1) {
                          (dsErrObj.message = `This Data set already removed`),
                            (isAnyError = true);
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
                                if (res && res.sucRes) {
                                  // ResponseBody.success.push(res.sucRes);
                                  // dsResObj = res.sucRes;
                                  isSomthingUpdate = true;
                                }
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
                                userId,
                                noPackageConfig
                              )
                              .then((res) => {
                                // if (res.sucRes?.length) {
                                //   ResponseBody.success.push(res.sucRes);
                                // }

                                if (res && res.sucRes) {
                                  // dsResObj = res.sucRes;
                                  isSomthingUpdate = true;
                                }

                                if (res && res.errRes?.length) {
                                  let dsErrRes = res.errRes.join(" '|' ");
                                  dsErrObj.message = dsErrRes;
                                  isAnyError = true;
                                  // ResponseBody.errors.push(res.errRes);
                                }
                              });

                            if (obj.columnDefinition?.length) {
                              dsResObj.columnDefinition = [];
                              dsErrObj.columnDefinition = [];
                              for (let el of obj.columnDefinition) {
                                let selectCD = `select * from ${schemaName}.columndefinition where datasetid='${DSId}' and externalid='${el.ExternalId}'`;
                                let { rows: cdRows } = await DB.executeQuery(
                                  selectCD
                                );

                                const cdExternalId = el.ExternalId;
                                const currentCd = cdRows ? cdRows[0] : null;
                                let errObj = {};

                                if (currentCd) {
                                  let newObj = {};
                                  const cdId = currentCd.columnid;
                                  const oldDataType = currentCd.datatype;
                                  const oldFormat = currentCd.format;
                                  newObj.ExternalId = cdExternalId;
                                  newObj.ID = cdId;
                                  dsResObj.columnDefinition.push(newObj);

                                  errObj.ExternalId = cdExternalId;
                                  errObj.ID = cdId;

                                  if (currentCd.del_flg === 1) {
                                    (errObj.message = `This column definition already removed`),
                                      (isAnyError = true);
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
                                          // ResponseBody.success.push(res.sucRes);
                                          if (res && res.sucRes) {
                                            // dsResObj.columnDefinition.push(
                                            //   res.sucRes
                                            // );
                                            isSomthingUpdate = true;
                                          }
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
                                          userId,
                                          DSheaderRow,
                                          oldDataType,
                                          oldFormat
                                        )
                                        .then((res) => {
                                          if (res && res.sucRes) {
                                            // dsResObj.columnDefinition.push(
                                            //   res.sucRes
                                            // );
                                            isSomthingUpdate = true;
                                          }
                                          if (res && res.errRes?.length) {
                                            let clErrRes =
                                              res.errRes.join(" '|' ");
                                            errObj.message = clErrRes;
                                            isAnyError = true;
                                          }
                                        });
                                    }
                                  }
                                  dsErrObj.columnDefinition.push(errObj);
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
                                      userId,
                                      null,
                                      DSheaderRow
                                    )
                                    .then((res) => {
                                      // if (res.sucRes?.length) {
                                      //   ResponseBody.success.push(res.sucRes);
                                      // }
                                      if (res && res.sucRes) {
                                        dsResObj.columnDefinition.push(
                                          res.sucRes
                                        );
                                        isSomthingUpdate = true;
                                      }
                                      if (
                                        res &&
                                        Object.keys(res.errRes)?.length
                                      ) {
                                        dsErrObj.columnDefinition.push(
                                          res.errRes
                                        );

                                        isAnyError = true;
                                      }
                                    });
                                }
                              }
                            }

                            if (obj.qcType) {
                              if (obj.conditionalExpressions?.length) {
                                dsResObj.vlc = [];
                                dsErrObj.vlc = [];
                                for (let vlc of obj.conditionalExpressions) {
                                  let selectVLC = `select * from ${schemaName}.dataset_qc_rules where datasetid='${DSId}' and ext_ruleid='${vlc.conditionalExpressionNumber}'`;
                                  let { rows: vlcRows } = await DB.executeQuery(
                                    selectVLC
                                  );
                                  const currentVlc = vlcRows
                                    ? vlcRows[0]
                                    : null;

                                  let errObj = {};

                                  if (currentVlc) {
                                    let newObj = {};
                                    newObj.conditionalExpressionNumber =
                                      vlc.conditionalExpressionNumber;
                                    newObj.ID = currentVlc.dsqcruleid;
                                    dsResObj.vlc.push(newObj);

                                    errObj.conditionalExpressionNumber =
                                      vlc.conditionalExpressionNumber;
                                    errObj.ID = currentVlc.dsqcruleid;

                                    if (currentVlc.active_yn === "N") {
                                      (errObj.message = `This - Qc Rules already removed`),
                                        (isAnyError = true);
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
                                          if (res && res.sucRes) {
                                            // dsResObj.vlc.push(res.sucRes);
                                            isSomthingUpdate = true;
                                          }
                                          if (res && res.errRes?.length) {
                                            let vlcErrRes =
                                              res.errRes.join(" '|' ");
                                            errObj.message = vlcErrRes;
                                            isAnyError = true;
                                          }
                                        });
                                    }
                                    dsErrObj.vlc.push(errObj);
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
                                        // if (res.sucRes?.length) {
                                        //   ResponseBody.success.push(res.sucRes);
                                        // }

                                        if (res && res.sucRes) {
                                          dsResObj.vlc.push(res.sucRes);
                                          isSomthingUpdate = true;
                                        }
                                        if (
                                          res &&
                                          Object.keys(res.errRes)?.length
                                        ) {
                                          isAnyError = true;

                                          dsErrObj.vlc.push(res.errRes);
                                        }
                                      });
                                  }

                                  // dsErrObj.vlc.push(errObj);
                                }
                              }
                            }
                          }
                        }
                        dpResObj.dataSets.push(dsResObj);
                        dpErrObj.dataSets.push(dsErrObj);
                      } else {
                        // Function call for insert dataSet level data
                        const noPackageConfig = each.noPackageConfig;
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
                            userId,
                            null,
                            noPackageConfig
                          )
                          .then((res) => {
                            // if (res.sucRes?.length) {
                            //   ResponseBody.success.push(res.sucRes);
                            // }
                            if (res && res.sucRes) {
                              dsResObj = res.sucRes;

                              isSomthingUpdate = true;
                              dpResObj.dataSets.push(dsResObj);
                            }
                            if (res && Object.keys(res.errRes)?.length) {
                              isAnyError = true;

                              dpErrObj.dataSets.push(res.errRes);
                            }
                          });
                        // dpResObj.dataSet.push(dsResObj);
                      }
                    }
                  }
                }
              }

              ResponseBody.dataPackages.push(dpResObj);
              errRes.dataPackages.push(dpErrObj);
            } else {
              var PackageInsert = await externalFunction
                .packageLevelInsert(
                  each,
                  DFId,
                  DFVer,
                  ConnectionType,
                  externalSysName,
                  testFlag,
                  userId,
                  null
                )
                .then((res) => {
                  // if (res.sucRes?.length) {
                  //   ResponseBody.success.push(res.sucRes);
                  // }
                  if (res && res.sucRes) {
                    dpResObj = res.sucRes;
                    isSomthingUpdate = true;
                    ResponseBody.dataPackages.push(dpResObj);
                  }
                  if (res && Object.keys(res.errRes)?.length) {
                    isAnyError = true;
                    // ResponseBody.errors.push(res.errRes);
                    errRes.dataPackages.push(res.errRes);
                  }
                });
            }
          }
        }
      }
      // const sucData = ResponseBody.success;

      // // if (helper.isEmpty(sucData)) {

      if (!isSomthingUpdate) {
        const deleteQuery = `delete from ${schemaName}.dataflow_version where dataflowid='${DFId}' and
        version ='${DFVer}'`;
        await DB.executeQuery(deleteQuery);

        const deleteCdr = `delete from ${schemaName}.cdr_ta_queue where dataflowid='${DFId}' and
        "VERSION" ='${DFVer}'`;
        await DB.executeQuery(deleteCdr);

        Object.keys(ResponseBody).forEach((key) => {
          ResponseBody.version = DFVer - 1;
          // (ResponseBody.ResponseCode = "00001");
        });
      }

      if (isAnyError) {
        ResponseBody.errors.push(errRes);
      }
      return apiResponse.successResponseWithData(
        res,
        "Dataflow update successfully.",
        ResponseBody
      );
    } else {
      var dataRes = creatDataflow(req, res, isCDI);
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
    const { dataFlowId, userId, versionFreezed } = req.body;
    Logger.info({ message: "activateDataFlow" });

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataFlowId}' order by version DESC limit 1`
    );

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
        versionFreezed,
      });

      // console.log(oldVersion.version, updatedLogs);
      var resData = { ...dataflowObj, version: updatedLogs };
      if (oldVersion?.version === updatedLogs) {
        resData.versionBumped = false;
      } else {
        resData.versionBumped = true;
      }

      if (updatedLogs) {
        return apiResponse.successResponseWithData(
          res,
          "Dataflow config updated successfully.",
          // { ...dataflowObj, version: updatedLogs }
          resData
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
    console.log(err);
    Logger.error("catch :activateDataFlow");
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.inActivateDataFlow = async (req, res) => {
  try {
    const { dataFlowId, userId, versionFreezed } = req.body;
    Logger.info({ message: "inActivateDataFlow" });

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataFlowId}' order by version DESC limit 1`
    );

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
      versionFreezed,
    });

    var resData = { ...dataflowObj, version: updatedLogs };
    if (oldVersion?.version === updatedLogs) {
      resData.versionBumped = false;
    } else {
      resData.versionBumped = true;
    }

    if (updatedLogs) {
      return apiResponse.successResponseWithData(
        res,
        "Dataflow config updated successfully.",
        // { ...dataflowObj, version: updatedLogs }
        resData
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

    return apiResponse.successResponse(res, "Sync initiated successfully", {
      success: true,
    });
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
      if (dataflowDetail && dataflowDetail.exptfstprddt)
        dataflowDetail.exptfstprddt = moment(
          dataflowDetail.exptfstprddt
        ).format("DD-MMM-yyyy");

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
    let q = `select d."name",v.vend_nm as vendorName,sl.loc_typ as locationType ,d.description,d.vend_id ,d."type" , d.externalsystemname ,d.src_loc_id ,d.testflag ,d2."name" as datapackagename ,d3."mnemonic" as datasetname from ${schemaName}.dataflow d
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
    let q = `select d."name" as dataflowname,d."type" as datastructure, d.*,v.vend_nm,sl.loc_typ, d2."name" as datapackagename, d2."path" as datapackagepath,
    d2.* ,d3."name" as datasetname ,d3.*,c.*,d.testflag as test_flag, dk.name as datakind, d3.datasetid, S.prot_nbr_stnd
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
    const { rows: response } = await DB.executeQuery(q);
    if (!response.length) {
      return apiResponse.ErrorResponse(
        res,
        "There is no dataflow exist with this id"
      );
    }
    // console.log("el.datasetid", response);
    // return;
    const tempDP = _.uniqBy(response, "datapackageid");
    const tempDS = _.uniqBy(response, "datasetid");
    const dataflowObj = response[0];
    const packageArr = [];
    for (const each of tempDP) {
      const datapackageObj = {
        externalID: each.ExternalId,
        type: each.type,
        sasXptMethod: each.sasxptmethod,
        path: each.datapackagepath,
        password: each.password,
        noPackageConfig: each.nopackageconfig,
        name: each.datapackagename,
        dataSet: [],
        active: each.active,
      };
      for (const el of tempDS) {
        if (el.datapackageid === each.datapackageid) {
          // if (el.datasetid === each.datasetid) {
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
          for (let obj of response) {
            if (obj.datasetid === el.datasetid) {
              let columnObj = {
                columnName: obj.name,
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
          // }
        }
      }
      packageArr.push(datapackageObj);
    }
    let myobj = {
      vendorName: dataflowObj.vend_nm,
      protocolNumberStandard: dataflowObj.prot_nbr_stnd,
      type: dataflowObj.type,
      name: dataflowObj.dataflowname,
      externalID: dataflowObj.externalid,
      externalSystemName: dataflowObj.externalsystemname,
      connectionType: dataflowObj.connectiontype,
      location: dataflowObj.src_loc_id,
      locationName: dataflowObj.locationName,
      exptDtOfFirstProdFile: dataflowObj.expt_fst_prd_dt,
      testFlag: dataflowObj.test_flag,
      prodFlag: dataflowObj.test_flag === 1 ? 1 : 0,
      description: dataflowObj.description,
      // connectiondriver: dataflowObj.connectiondriver,
      fsrstatus: dataflowObj.fsrstatus,
      vend_id: dataflowObj.vend_id,
      src_loc_id: dataflowObj.src_loc_id,
      data_in_cdr: dataflowObj.data_in_cdr,
      configured: dataflowObj.configured,
      active: dataflowObj.active,
      dataPackage: packageArr,
      dataStructure: dataflowObj.datastructure,
      protocolNumberStandard: dataflowObj.prot_nbr_stnd,
      serviceOwners: dataflowObj?.serv_ownr?.split(","),
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
      versionFreezed,
    } = req.body;

    const {
      rows: [dataFlowCount],
    } = await DB.executeQuery(
      `SELECT count(1) from ${schemaName}.dataflow WHERE dataflowid='${dataflowId}' and active=1`
    );

    let dataSet_count = 0;
    const dataPackage = await DB.executeQuery(
      `SELECT datapackageid from ${schemaName}.datapackage WHERE dataflowid='${dataflowId}'`
    );
    const DPID = dataPackage.rows;

    if (DPID) {
      for (let id of DPID) {
        const {
          rows: [datasetCount],
        } = await DB.executeQuery(
          `SELECT count(1) from ${schemaName}.dataset where datapackageid='${id.datapackageid}' and active=1`
        );

        dataSet_count += parseInt(datasetCount.count);
      }
    }

    if (dataFlowCount.count == 0) {
      return apiResponse.ErrorResponse(
        res,
        "Please make dataFlow active in order to save the configuration"
      );
    }
    if (dataStructure !== "TabularRaveSOD" && dataSet_count == 0) {
      return apiResponse.ErrorResponse(
        res,
        "Please add or active at-least one dataset in order to save the configuration"
      );
    }

    const {
      rows: [oldVersion],
    } = await DB.executeQuery(
      `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataflowId}' order by version DESC limit 1`
    );

    if (
      vendorID !== null &&
      protocolNumberStandard !== null &&
      description !== "" &&
      dataflowId &&
      userId
    ) {
      const {
        rows: [existDf],
      } = await DB.executeQuery(
        `SELECT vend_id as "vendorID", src_loc_id as "locationName", testflag as "testFlag", type as "dataStructure", description, connectiontype as "connectionType", serv_ownr as "serviceOwners", expt_fst_prd_dt as "firstFileDate" from ${schemaName}.dataflow WHERE dataflowid='${dataflowId}';`
      );
      if (!existDf) {
        return apiResponse.ErrorResponse(res, "Dataflow doesn't exist");
      }

      // NOTE: getting protocol id in protocolNumberStandard, this is to be fixed by the original developer
      const checkUnique = await datasetHelper.isNotUniqueAmongstDatasets(
        protocolNumberStandard,
        testFlag === "true" ? "1" : "0",
        vendorID,
        dataflowId
      );

      if (checkUnique)
        return apiResponse.validationErrorWithData(
          res,
          "Changes will make duplicate mnemonic",
          {
            success: false,
          }
        );

      let dfUpdatedName = false;
      if (
        existDf.vendorID != vendorID ||
        existDf.description != description ||
        helper.stringToBoolean(existDf.testFlag) !==
          helper.stringToBoolean(testFlag)
      ) {
        dfUpdatedName = await createDataflowName(
          vendorID,
          protocolNumberStandard,
          description,
          helper.stringToBoolean(testFlag)
        );
      }
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
      let fieldsStr = `vend_id=$2, type=$3, description=$4, src_loc_id=$5, testflag=$6, connectiontype=$7, externalsystemname=$8, updt_tm=$9, serv_ownr=$10, expt_fst_prd_dt=$11`;
      if (dfUpdatedName) {
        fieldsStr = `${fieldsStr}, name=$12`;
        dFBody.push(dfUpdatedName);
      }
      // update dataflow schema into db
      const updatedDF = await DB.executeQuery(
        `update ${schemaName}.dataflow set ${fieldsStr} WHERE dataflowid=$1 returning *;`,
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

      // console.log("diffObj", diffObj, "existDf", existDf);

      if (!Object.keys(diffObj).length) {
        return apiResponse.ErrorResponse(
          res,
          "Please change some values to update dataflow config"
        );
      }

      const updatedLogs = await addDataflowHistory({
        dataflowId,
        externalSystemName,
        userId,
        config_json: dataflowObj,
        diffObj,
        existDf,
        versionFreezed,
      });

      var resData = { ...dataflowObj, version: updatedLogs };

      if (oldVersion?.version === updatedLogs) {
        resData.versionBumped = false;
      } else {
        resData.versionBumped = true;
      }

      if (updatedLogs) {
        return apiResponse.successResponseWithData(
          res,
          "Dataflow config updated successfully.",
          // { ...dataflowObj, version: updatedLogs }
          resData
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
