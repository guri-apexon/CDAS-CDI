const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { addDataflowHistory } = require("./CommonController");
const { Console } = require("winston/lib/winston/transports");
const { DB_SCHEMA_NAME: schemaName } = constants;

const packageLevelInsert = async (
  data,
  externalID,
  DFId,
  version,
  ConnectionType
) => {
  try {
    // console.log(data, externalID, DFId, version, ConnectionType);
    var LocationType = ConnectionType;
    let msg = [];
    let status = true;
    let ts = new Date().toLocaleString();
    var ResponseBody = {};

    if (externalID !== null && externalID !== "" && externalID !== undefined) {
      console.log("data need to validate");
      if (LocationType === "SFTP" || LocationType === "FTPS") {
        // if (LocationType === "Hive CDH") {
        const dpArray = [
          { key: "Package type", value: data.type, type: "string" },
          {
            key: "SAS XPT Method ",
            value: data.sasXptMethod,
            type: "string",
          },
          { key: "Package Path ", value: data.path, type: "string" },
          {
            key: "No Package Level Config ",
            value: data.noPackageConfig,
            type: "boolean",
          },
          {
            key: "Package Naming Convention",
            value: data.name,
            type: "string",
          },
          {
            key: "active",
            value: data.active,
            type: "boolean",
          },
        ];

        if (
          data.type === "7Z" ||
          data.type == "ZIP" ||
          data.type == "RAR" ||
          data.type == "SAS"
        ) {
        } else {
          msg.push({
            text: " Package type's Supported values : 7Z, ZIP, RAR, SAS ",
          });
          status = false;
        }

        if (msg.length > 0) {
          return { validate: msg, status: status };
        } else {
          let dpRes = helper.validation(dpArray);

          if (dpRes.length > 0) {
            msg.push(dpRes);
            status = false;
            return { validate: msg, status: status };
          }
        }
      }
      if (msg.length > 0) {
        return { validate: msg, status: status };
      } else {
        ResponseBody.data_packages = [];
        let DpObj = {};
        const dpUid = createUniqueID();
        let passwordStatus = "No";
        let dPTimestamp = new Date();
        let { password } = data;

        if (password) {
          passwordStatus = "Yes";
          helper.writeVaultData(`${DFId}/${dpUid}`, {
            password,
          });
        }

        let dPBody = [
          dpUid,
          data.type || null,
          data.name || null,
          data.path || null,
          data.sasXptMethod || null,
          passwordStatus,
          helper.stringToBoolean(data.active) ? 1 : 0,
          helper.stringToBoolean(data.noPackageConfig) ? 1 : 0,
          data.externalID || null,
          dPTimestamp,
          DFId,
        ];

        let createDP = await DB.executeQuery(
          `INSERT INTO ${constants.DB_SCHEMA_NAME}.datapackage(datapackageid, type, name, path, sasxptmethod, password, active, nopackageconfig, externalid, insrt_tm, updt_tm, dataflowid)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10, $11)`,
          dPBody
        );

        DpObj.timestamp = ts;
        DpObj.externalId = externalID;
        DpObj.datapackageid = dpUid;
        DpObj.action = "Data package created successfully.";
        ResponseBody.data_packages.push(DpObj);
        // // each.datapackageid = dpUid;

        if (data.dataSet && data.dataSet.length > 0) {
          ResponseBody.data_sets = [];
          for (let obj of data.dataSet) {
            if (LocationType === "SFTP" || LocationType === "FTPS") {
              // if (LocationType === "Hive CDH") {
              const dsArray = [
                {
                  key: "Data Set Name (Mnemonic) ",
                  value: obj.mnemonic,
                  type: "string",
                },
                {
                  key: "Clinical Data Type ",
                  value: obj.dataKind,
                  type: "string",
                },
                { key: "File Type", value: obj.type, type: "string" },
                {
                  key: "File Naming Convention ",
                  value: obj.name,
                  type: "string",
                },
                {
                  key: "Delimiter",
                  value: obj.delimiter,
                  type: "string",
                },
                { key: "Quote", value: obj.quote, type: "string" },
                {
                  key: "Data Set Level, Path",
                  value: obj.path,
                  type: "string",
                },
                {
                  key: "Row Decrease Allowed",
                  value: obj.rowDecreaseAllowed,
                  type: "number",
                },
                {
                  key: "Escape Character",
                  value: obj.escapeCode,
                  type: "string",
                },
                {
                  key: "New Data Frequency (Days)",
                  value: obj.dataTransferFrequency,
                  type: "number",
                },
                {
                  key: "active",
                  value: obj.active,
                  type: "boolean",
                },
                {
                  key: "Column Count",
                  value: obj.columncount,
                  type: "number",
                },
              ];

              if (
                obj.externalID !== null &&
                obj.externalID !== "" &&
                obj.externalID !== undefined
              ) {
              } else {
                msg.push({
                  text: " Data Set Level, External Id  is required and data type should be string or Number ",
                });
                status = false;
              }

              let dsRes = helper.validation(dsArray);
              if (dsRes.length > 0) {
                msg.push(dsRes);
                status = false;
                return { validate: msg, status: status };
              }

              if (msg.length > 0) {
                return { validate: msg, status: status };
              } else {
                console.log("insert data");

                let dsObj = {};

                let dataKind = null;
                if (obj.dataKind) {
                  let checkDataKind = await DB.executeQuery(
                    `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}';`
                  );
                  dataKind = checkDataKind.rows[0].datakindid;
                }

                const dsUid = createUniqueID();
                let dsPasswordStatus;
                if (obj.filePwd) {
                  let { filePwd } = obj;
                  dsPasswordStatus = "Yes";
                  helper.writeVaultData(`${DFId}/${dpUid}/${dsUid}`, {
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
                  obj.headerRowNumber && obj.headerRowNumber != "" ? 1 : 0,
                  obj.footerRowNumber && obj.footerRowNumber != "" ? 1 : 0,
                  obj.headerRowNumber || 0,
                  obj.footerRowNumber || 0,
                  sqlQuery || null,
                  obj.customQuery || null,
                  obj.tableName || null,
                  obj.externalID || null,
                  dsPasswordStatus || "No",
                  new Date(),
                  obj.delimiter || "",
                  helper.convertEscapeChar(
                    obj.escapeCode || obj.escapeCharacter
                  ) || "",
                  obj.quote || "",
                  obj.rowDecreaseAllowed || 0,
                  obj.dataTransferFrequency || "",
                  obj.conditionalExpression,
                ];
                let createDS = await DB.executeQuery(
                  `insert into ${schemaName}.dataset(datasetid, datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
                offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
                customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", escapecode, "quote", rowdecreaseallowed, data_freq, dataset_fltr ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $22, $22, $23, $24, $25, $26, $27, $28)`,
                  DSBody
                );
                dsObj.timestamp = ts;
                dsObj.externalId = obj.externalID;
                dsObj.datasetid = dsUid;
                dsObj.action = "Data set created successfully.";
                ResponseBody.data_sets.push(dsObj);
                if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                  ResponseBody.column_definition = [];
                  for (let el of obj.columnDefinition) {
                    const clArray = [
                      {
                        key: "Column Name or Designator ",
                        value: el.name,
                        type: "string",
                      },
                      {
                        key: "Data Type",
                        value: el.dataType,
                        type: "string",
                      },
                      {
                        key: "Primary Key",
                        value: el.primaryKey,
                        type: "boolean",
                      },
                      {
                        key: "Required",
                        value: el.required,
                        type: "boolean",
                      },
                      {
                        key: "Unique",
                        value: el.required,
                        type: "boolean",
                      },
                    ];

                    let clRes = helper.validation(clArray);
                    if (clRes.length > 0) {
                      msg.push(clRes);
                      status = false;
                      return { validate: msg, status: status };
                    }

                    let cdObj = {};
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
                      new Date(),
                    ];
                    await DB.executeQuery(
                      `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                    primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                    insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
                      CDBody
                    );

                    cdObj.timestamp = ts;
                    cdObj.colmunid = CDUid;
                    cdObj.externalId = obj.externalID;
                    cdObj.action = "column definition created successfully.";
                    // //el.colmunid = CDUid;
                    ResponseBody.column_definition.push(cdObj);
                  }
                }

                // return { validate: msg, status: status };
              }
            } else {
              const dsArray = [
                {
                  key: "Data Set Name (Mnemonic) ",
                  value: obj.mnemonic,
                  type: "string",
                },
                {
                  key: "Clinical Data Type ",
                  value: obj.dataKind,
                  type: "string",
                },
                {
                  key: "active",
                  value: obj.active,
                  type: "boolean",
                },
                {
                  key: "Custom Query",
                  value: obj.customQuery,
                  type: "boolean",
                },
                {
                  key: "Column Count",
                  value: obj.columncount,
                  type: "number",
                },
              ];

              if (obj.customQuery === "yes") {
                if (
                  obj.customSql !== null &&
                  obj.customSql !== "" &&
                  obj.customSql !== undefined
                ) {
                } else {
                  msg.push({
                    text: " Custom Sql  is required  ",
                  });
                  status = false;
                }
              } else {
                if (
                  obj.tableName !== null &&
                  obj.tableName !== "" &&
                  obj.tableName !== undefined
                ) {
                  if (obj.tableName.length <= 255) {
                  } else {
                    msg.push({
                      text: " Table Name  Max of 255 characters  ",
                    });
                    status = false;
                  }
                } else {
                  msg.push({
                    text: " Table Name  is required ",
                  });
                  status = false;
                }
              }

              if (
                obj.externalID !== null &&
                obj.externalID !== "" &&
                obj.externalID !== undefined
              ) {
              } else {
                msg.push({
                  text: " Data Set Level, External Id  is required and data type should be string or Number ",
                });
                status = false;
              }

              let dsRes = helper.validation(dsArray);
              if (dsRes.length > 0) {
                msg.push(dsRes);
                status = false;
                return { validate: msg, status: status };
              }

              if (msg.length > 0) {
                return { validate: msg, status: status };
              } else {
                console.log("else tesst insert data");
                let dsObj = {};

                let dataKind = null;
                if (obj.dataKind) {
                  let checkDataKind = await DB.executeQuery(
                    `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}';`
                  );
                  dataKind = checkDataKind.rows[0].datakindid;
                }

                const dsUid = createUniqueID();
                let dsPasswordStatus;
                if (obj.filePwd) {
                  let { filePwd } = obj;
                  dsPasswordStatus = "Yes";
                  helper.writeVaultData(`${DFId}/${dpUid}/${dsUid}`, {
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
                  obj.headerRowNumber && obj.headerRowNumber != "" ? 1 : 0,
                  obj.footerRowNumber && obj.footerRowNumber != "" ? 1 : 0,
                  obj.headerRowNumber || 0,
                  obj.footerRowNumber || 0,
                  sqlQuery || null,
                  obj.customQuery || null,
                  obj.tableName || null,
                  obj.externalID || null,
                  dsPasswordStatus || "No",
                  new Date(),
                  obj.delimiter || "",
                  helper.convertEscapeChar(
                    obj.escapeCode || obj.escapeCharacter
                  ) || "",
                  obj.quote || "",
                  obj.rowDecreaseAllowed || 0,
                  obj.dataTransferFrequency || "",
                  obj.conditionalExpression,
                ];
                let createDS = await DB.executeQuery(
                  `insert into ${schemaName}.dataset(datasetid, datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
                offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
                customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", escapecode, "quote", rowdecreaseallowed, data_freq, dataset_fltr ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $22, $22, $23, $24, $25, $26, $27, $28)`,
                  DSBody
                );
                dsObj.timestamp = ts;
                dsObj.externalId = obj.externalID;
                dsObj.datasetid = dsUid;
                dsObj.action = "Data set created successfully.";
                ResponseBody.data_sets.push(dsObj);

                if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                  ResponseBody.column_definition = [];
                  for (let el of obj.columnDefinition) {
                    const clArray = [
                      {
                        key: "Column Name or Designator ",
                        value: el.name,
                        type: "string",
                      },
                      {
                        key: "Data Type",
                        value: el.dataType,
                        type: "string",
                      },
                      {
                        key: "Primary Key",
                        value: el.primaryKey,
                        type: "boolean",
                      },
                      {
                        key: "Required",
                        value: el.required,
                        type: "boolean",
                      },
                      {
                        key: "Unique",
                        value: el.required,
                        type: "boolean",
                      },
                    ];

                    let clRes = helper.validation(clArray);
                    if (clRes.length > 0) {
                      msg.push(clRes);
                      status = false;
                      return { validate: msg, status: status };
                    }

                    let cdObj = {};
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
                      new Date(),
                    ];
                    await DB.executeQuery(
                      `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                    primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                    insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
                      CDBody
                    );

                    cdObj.timestamp = ts;
                    cdObj.colmunid = CDUid;
                    cdObj.externalId = obj.externalID;
                    cdObj.action = "column definition created successfully.";
                    // //el.colmunid = CDUid;
                    ResponseBody.column_definition.push(cdObj);
                  }
                }
              }
              // test
            }
          }
        }
        return { validate: ResponseBody, status: status };
        // return;
      }
    } else {
      msg.push({
        text: " Data Package, Level External Id  is required and data type should be string or Number ",
      });
      status = false;
      return { validate: msg, status: status };
    }
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :createDataflow");
    Logger.error(err);
  }
};

const datasetLevelInsert = async (
  obj,
  externalID,
  DPId,
  DFId,
  version,
  ConnectionType
) => {
  try {
    var LocationType = ConnectionType;
    let msg = [];
    let status = true;
    let ts = new Date().toLocaleString();
    var ResponseBody = {};
    ResponseBody.data_sets = [];

    if (LocationType === "SFTP" || LocationType === "FTPS") {
      // if (LocationType === "Hive CDH") {
      const dsArray = [
        {
          key: "Data Set Name (Mnemonic) ",
          value: obj.mnemonic,
          type: "string",
        },
        {
          key: "Clinical Data Type ",
          value: obj.dataKind,
          type: "string",
        },
        { key: "File Type", value: obj.type, type: "string" },
        {
          key: "File Naming Convention ",
          value: obj.name,
          type: "string",
        },
        {
          key: "Delimiter",
          value: obj.delimiter,
          type: "string",
        },
        { key: "Quote", value: obj.quote, type: "string" },
        {
          key: "Data Set Level, Path",
          value: obj.path,
          type: "string",
        },
        {
          key: "Row Decrease Allowed",
          value: obj.rowDecreaseAllowed,
          type: "number",
        },
        {
          key: "Escape Character",
          value: obj.escapeCode,
          type: "string",
        },
        {
          key: "New Data Frequency (Days)",
          value: obj.dataTransferFrequency,
          type: "number",
        },
        {
          key: "active",
          value: obj.active,
          type: "boolean",
        },
        {
          key: "Column Count",
          value: obj.columncount,
          type: "number",
        },
      ];

      if (
        obj.externalID !== null &&
        obj.externalID !== "" &&
        obj.externalID !== undefined
      ) {
      } else {
        msg.push({
          text: " Data Set Level, External Id  is required and data type should be string or Number ",
        });
        status = false;
      }

      let dsRes = helper.validation(dsArray);
      if (dsRes.length > 0) {
        msg.push(dsRes);
        status = false;
        return { validate: msg, status: status };
      }

      if (msg.length > 0) {
        return { validate: msg, status: status };
      } else {
        console.log("insert data");

        let dsObj = {};

        let dataKind = null;
        if (obj.dataKind) {
          let checkDataKind = await DB.executeQuery(
            `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}';`
          );
          dataKind = checkDataKind.rows[0].datakindid;
        }

        const dsUid = createUniqueID();
        let dsPasswordStatus;
        if (obj.filePwd) {
          let { filePwd } = obj;
          dsPasswordStatus = "Yes";
          helper.writeVaultData(`${DFId}/${DPId}/${dsUid}`, {
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
          DPId,
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
          obj.headerRowNumber && obj.headerRowNumber != "" ? 1 : 0,
          obj.footerRowNumber && obj.footerRowNumber != "" ? 1 : 0,
          obj.headerRowNumber || 0,
          obj.footerRowNumber || 0,
          sqlQuery || null,
          obj.customQuery || null,
          obj.tableName || null,
          obj.externalID || null,
          dsPasswordStatus || "No",
          new Date(),
          obj.delimiter || "",
          helper.convertEscapeChar(obj.escapeCode || obj.escapeCharacter) || "",
          obj.quote || "",
          obj.rowDecreaseAllowed || 0,
          obj.dataTransferFrequency || "",
          obj.conditionalExpression,
        ];
        let createDS = await DB.executeQuery(
          `insert into ${schemaName}.dataset(datasetid, datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
                offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
                customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", escapecode, "quote", rowdecreaseallowed, data_freq, dataset_fltr ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $22, $22, $23, $24, $25, $26, $27, $28)`,
          DSBody
        );
        dsObj.timestamp = ts;
        dsObj.externalId = obj.externalID;
        dsObj.datasetid = dsUid;
        dsObj.action = "Data set created successfully.";
        ResponseBody.data_sets.push(dsObj);
        if (obj.columnDefinition && obj.columnDefinition.length > 0) {
          ResponseBody.column_definition = [];
          for (let el of obj.columnDefinition) {
            const clArray = [
              {
                key: "Column Name or Designator ",
                value: el.name,
                type: "string",
              },
              {
                key: "Data Type",
                value: el.dataType,
                type: "string",
              },
              {
                key: "Primary Key",
                value: el.primaryKey,
                type: "boolean",
              },
              {
                key: "Required",
                value: el.required,
                type: "boolean",
              },
              {
                key: "Unique",
                value: el.required,
                type: "boolean",
              },
            ];

            let clRes = helper.validation(clArray);
            if (clRes.length > 0) {
              msg.push(clRes);
              status = false;
              return { validate: msg, status: status };
            }

            let cdObj = {};
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
              new Date(),
            ];
            await DB.executeQuery(
              `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                    primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                    insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
              CDBody
            );

            cdObj.timestamp = ts;
            cdObj.colmunid = CDUid;
            cdObj.externalId = obj.externalID;
            cdObj.action = "column definition created successfully.";
            // //el.colmunid = CDUid;
            ResponseBody.column_definition.push(cdObj);
          }
        }

        // return { validate: msg, status: status };
      }
    } else {
      const dsArray = [
        {
          key: "Data Set Name (Mnemonic) ",
          value: obj.mnemonic,
          type: "string",
        },
        {
          key: "Clinical Data Type ",
          value: obj.dataKind,
          type: "string",
        },
        {
          key: "active",
          value: obj.active,
          type: "boolean",
        },
        {
          key: "Custom Query",
          value: obj.customQuery,
          type: "boolean",
        },
        {
          key: "Column Count",
          value: obj.columncount,
          type: "number",
        },
      ];

      if (obj.customQuery === "yes") {
        if (
          obj.customSql !== null &&
          obj.customSql !== "" &&
          obj.customSql !== undefined
        ) {
        } else {
          msg.push({
            text: " Custom Sql  is required  ",
          });
          status = false;
        }
      } else {
        if (
          obj.tableName !== null &&
          obj.tableName !== "" &&
          obj.tableName !== undefined
        ) {
          if (obj.tableName.length <= 255) {
          } else {
            msg.push({
              text: " Table Name  Max of 255 characters  ",
            });
            status = false;
          }
        } else {
          msg.push({
            text: " Table Name  is required ",
          });
          status = false;
        }
      }

      if (
        obj.externalID !== null &&
        obj.externalID !== "" &&
        obj.externalID !== undefined
      ) {
      } else {
        msg.push({
          text: " Data Set Level, External Id  is required and data type should be string or Number ",
        });
        status = false;
      }

      let dsRes = helper.validation(dsArray);
      if (dsRes.length > 0) {
        msg.push(dsRes);
        status = false;
        return { validate: msg, status: status };
      }

      if (msg.length > 0) {
        return { validate: msg, status: status };
      } else {
        console.log("else tesst insert data");
        let dsObj = {};

        let dataKind = null;
        if (obj.dataKind) {
          let checkDataKind = await DB.executeQuery(
            `select datakindid from ${schemaName}.datakind where name='${obj.dataKind}';`
          );
          dataKind = checkDataKind.rows[0].datakindid;
        }

        const dsUid = createUniqueID();
        let dsPasswordStatus;
        if (obj.filePwd) {
          let { filePwd } = obj;
          dsPasswordStatus = "Yes";
          helper.writeVaultData(`${DFId}/${DPId}/${dsUid}`, {
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
          DPId,
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
          obj.headerRowNumber && obj.headerRowNumber != "" ? 1 : 0,
          obj.footerRowNumber && obj.footerRowNumber != "" ? 1 : 0,
          obj.headerRowNumber || 0,
          obj.footerRowNumber || 0,
          sqlQuery || null,
          obj.customQuery || null,
          obj.tableName || null,
          obj.externalID || null,
          dsPasswordStatus || "No",
          new Date(),
          obj.delimiter || "",
          helper.convertEscapeChar(obj.escapeCode || obj.escapeCharacter) || "",
          obj.quote || "",
          obj.rowDecreaseAllowed || 0,
          obj.dataTransferFrequency || "",
          obj.conditionalExpression,
        ];
        let createDS = await DB.executeQuery(
          `insert into ${schemaName}.dataset(datasetid, datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
                offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
                customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", escapecode, "quote", rowdecreaseallowed, data_freq, dataset_fltr ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $22, $22, $23, $24, $25, $26, $27, $28)`,
          DSBody
        );
        dsObj.timestamp = ts;
        dsObj.externalId = obj.externalID;
        dsObj.datasetid = dsUid;
        dsObj.action = "Data set created successfully.";
        ResponseBody.data_sets.push(dsObj);

        if (obj.columnDefinition && obj.columnDefinition.length > 0) {
          ResponseBody.column_definition = [];
          for (let el of obj.columnDefinition) {
            const clArray = [
              {
                key: "Column Name or Designator ",
                value: el.name,
                type: "string",
              },
              {
                key: "Data Type",
                value: el.dataType,
                type: "string",
              },
              {
                key: "Primary Key",
                value: el.primaryKey,
                type: "boolean",
              },
              {
                key: "Required",
                value: el.required,
                type: "boolean",
              },
              {
                key: "Unique",
                value: el.required,
                type: "boolean",
              },
            ];

            let clRes = helper.validation(clArray);
            if (clRes.length > 0) {
              msg.push(clRes);
              status = false;
              return { validate: msg, status: status };
            }

            let cdObj = {};
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
              new Date(),
            ];
            await DB.executeQuery(
              `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                    primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                    insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
              CDBody
            );

            cdObj.timestamp = ts;
            cdObj.colmunid = CDUid;
            cdObj.externalId = obj.externalID;
            cdObj.action = "column definition created successfully.";
            // //el.colmunid = CDUid;
            ResponseBody.column_definition.push(cdObj);
          }
        }
      }
      // test
    }

    return { validate: ResponseBody, status: status };
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :createDataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

const columnLevelInsert = async (req, res) => {
  try {
    var validate = [];

    if (validate.length > 0) {
      console.log("testt 245");

      return apiResponse.ErrorResponse(res, validate);
    } else {
      console.log("Column Inseert Function");
      // return;
      //  commonInsertFunction(req, res);
    }
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :createDataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

const dataflowUpdate = async (data, externalID, DFId, version) => {
  // console.log(data);
  // console.log(externalID, DFId, version);
  try {
    const columnArray = [];
    const valueArry = [];

    let msg = [];
    let status = true;
    let ts = new Date().toLocaleString();
    var ResponseBody = {};
    const dfObj = {
      DFTestname: "name",
      externalSystemName: "vend_id",
      type: "type",
      description: "description",
      // externalSystemName === "CDI"
      //         ? src_loc_id
      //         : data[0]?.src_loc_id || null,
      protocolNumberStandard: "protocolNumberStandard",
      active: "active",
      configured: "configured",
      exptDtOfFirstProdFile: "expt_fst_prd_dt",
      testFlag: "testflag",
      data_in_cdr: "data_in_cdr",
      connectionType: "connectiontype",
      externalSystemName: "externalsystemname",
      fsrstatus: "fsrstatus",
      protocolNumber: "prot_id",
    };

    // for (let key in data) {
    //   columnArray.push(dsObj[k]);
    //   valueArry.push(data[k]);
    // }

    // for (let k in data) {
    //   columnArray.push(dfObj[k]);
    // }

    // columnArray.push("insrt_tm", "updt_tm", "refreshtimestamp");

    // columnArray.push("updt_tm");
    // const dpColData = columnArray.filter(function (element) {
    //   return element !== undefined;
    // });

    // let Count = 1;
    // const resultData = dpColData.reduce((prev, cur) => {
    //   prev += cur.toString() + " =$" + Count + ", ";
    //   Count += 1;
    //   return prev;
    // }, "");

    // const fData = resultData.slice(0, -2);

    // let updateQueryDF = `UPDATE ${schemaName}.dataflow set ${fData} where externalid='${externalID}'`;

    // console.log(updateQueryDF);

    if (msg.length > 0) {
      return { validate: msg, status: status };
    } else {
      // let dataFlowUpdate = await DB.executeQuery(updateQueryDF, [...valueArry]);
      // ResponseBody.timestamp = ts;
      // ResponseBody.externalId = externalID;
      // ResponseBody.dataSetid = DSId;
      // ResponseBody.action = "Data Flow update successfully.";
      // return { validate: ResponseBody, status: status };
    }
  } catch (e) {
    console.log(e);
  }
};

const packageUpdate = async (
  data,
  externalID,
  DPId,
  DFId,
  version,
  ConnectionType
) => {
  try {
    const dpColumn = [];
    const dpColumnData = [];
    const columnArray = [];
    const valueArry = [];
    var LocationType = ConnectionType;
    let msg = [];
    let status = true;
    let ts = new Date().toLocaleString();
    var ResponseBody = {};
    var newObj = {};
    const dpObj = {
      type: "type",
      name: "name",
      path: "path",
      sasXptMethod: "sasxptmethod",
      password: "password",
      active: "active",
      noPackageConfig: "nopackageconfig",
    };

    for (let key in data) {
      if (LocationType === "SFTP" || LocationType === "FTPS") {
        // if (LocationType === "Hive CDH") {
        if (key === "path" || key === "name" || key === "sasXptMethod") {
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof data[key] === "string"
          ) {
            valueArry.push(data[key]);
            columnArray.push(dpObj[key]);
          } else {
            msg.push({
              text: ` ${key} is required and data type should be string `,
            });
            status = false;
          }
        }

        if (key === "type") {
          if (
            data[key] === "7Z" ||
            data[key] == "ZIP" ||
            data[key] == "RAR" ||
            data[key] == "SAS"
          ) {
            valueArry.push(data[key]);
            columnArray.push(dpObj[key]);
          } else {
            msg.push({
              text: " Package type's is required and Supported values : 7Z, ZIP, RAR, SAS ",
            });
            status = false;
          }
        }

        if (key === "noPackageConfig" || key === "active") {
          keyValue = helper.stringToBoolean(data[key]);
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof keyValue === "boolean"
          ) {
            valueArry.push(data[key]);
            columnArray.push(dpObj[key]);
          } else {
            msg.push({
              text: ` ${key} is required and data type should be boolean `,
            });
            status = false;
          }
        }

        if (key === "password") {
          if (data[key] == undefined) {
            valueArry.push(null);
          } else {
            valueArry.push(data[key]);
          }

          columnArray.push(dpObj[key]);
        }
      } else {
        if (key === "type") {
          if (
            data[key] === "7Z" ||
            data[key] == "ZIP" ||
            data[key] == "RAR" ||
            data[key] == "SAS"
          ) {
            valueArry.push(data[key]);
            columnArray.push(dpObj[key]);
          } else {
            msg.push({
              text: " Package type's Supported values : 7Z, ZIP, RAR, SAS ",
            });
            status = false;
          }
        } else {
          if (
            key === "path" ||
            key === "name" ||
            key === "sasXptMethod" ||
            key === "password"
          ) {
            if (data[key] == undefined) {
              valueArry.push(null);
            } else {
              valueArry.push(data[key]);
            }

            columnArray.push(dpObj[key]);
          }
          if (key === "noPackageConfig" || key === "active") {
            keyValue = helper.stringToBoolean(data[key]);
            if (typeof keyValue === "boolean") {
              valueArry.push(data[key]);
              columnArray.push(dpObj[key]);
            } else {
              msg.push({
                text: ` ${key} data type should be boolean `,
              });
              status = false;
            }
          }
        }
      }
    }

    columnArray.push("updt_tm");
    valueArry.push(new Date());

    let Count = 1;
    const resultData = columnArray.reduce((prev, cur) => {
      prev += cur.toString() + " =$" + Count + ", ";
      Count += 1;
      return prev;
    }, "");

    const fData = resultData.slice(0, -2);

    let updateQueryDP = `UPDATE ${schemaName}.datapackage set ${fData} where externalid='${externalID}'`;

    if (msg.length > 0) {
      return { validate: msg, status: status };
    } else {
      let dataPackageUpdate = await DB.executeQuery(updateQueryDP, [
        ...valueArry,
      ]);
      ResponseBody.data_packages = [];
      newObj.timestamp = ts;
      newObj.externalId = externalID;
      newObj.datapackageid = DPId;
      newObj.action = "Data package update successfully.";
      ResponseBody.data_packages.push(newObj);
      return { validate: ResponseBody, status: status };
    }
  } catch (e) {
    console.log(e);
  }
};

const datasetUpdate = async (
  data,
  externalID,
  DSId,
  DPId,
  DFId,
  version,
  ConnectionType
) => {
  try {
    // console.log(data, externalID, DSId, DPId, DFId, version, ConnectionType);
    const columnArray = [];
    const valueArry = [];
    var LocationType = ConnectionType;
    let msg = [];
    let status = true;
    let ts = new Date().toLocaleString();
    var ResponseBody = {};
    var newObj = {};
    const dsObj = {
      dataKind: "datakindid",
      mnemonic: "mnemonic",
      fileNamingConvention: "name",
      active: "active",
      columnCount: "columncount",
      incremental: "incremental",
      offsetColumn: "offsetcolumn",
      type: "type",
      path: "path",
      OverrideStaleAlert: "ovrd_stale_alert",
      headerRowNumber: "headerrow",
      footerRowNumber: "footerrow",
      headerRowNumber: "headerrownumber",
      footerRowNumber: "footerrownumber",
      customSql: "customsql",
      customQuery: "customsql_yn",
      tableName: "tbl_nm",
      dsPasswordStatus: "file_pwd",
      delimiter: "delimiter",
      escapeCode: "escapecode",
      quote: "quote",
      rowDecreaseAllowed: "rowdecreaseallowed",
      dataTransferFrequency: "data_freq",
    };

    // Request Filed validation loop
    for (let key in data) {
      if (LocationType === "SFTP" || LocationType === "FTPS") {
        // if (LocationType === "Hive CDH") {
        if (
          key == "mnemonic" ||
          key == "dataKind" ||
          key == "type" ||
          key == "name" ||
          key == "delimiter" ||
          key == "quote" ||
          key == "path" ||
          key == "escapeCode"
        ) {
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof data[key] === "string"
          ) {
            console.log("Fields Validation Success");
          } else {
            msg.push({
              text: ` ${key} is required and data type should be string `,
            });
            status = false;
          }
        }

        if (
          key == "rowDecreaseAllowed" ||
          key == "dataTransferFrequency" ||
          key == "columncount"
        ) {
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof data[key] === "number"
          ) {
            console.log("Fields Validation Success");
          } else {
            msg.push({
              text: ` ${key} is required and data type should be string `,
            });
            status = false;
          }
        }

        if (key === "active") {
          keyValue = helper.stringToBoolean(data[key]);
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof keyValue === "boolean"
          ) {
            console.log("Fields Validation Success");
          } else {
            msg.push({
              text: ` ${key} is required and data type should be boolean `,
            });
            status = false;
          }
        }
      } else {
        if (key == "mnemonic" || key == "dataKind") {
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof data[key] === "string"
          ) {
            console.log("Fields Validation Success");
          } else {
            msg.push({
              text: ` ${key} is required and data type should be string `,
            });
            status = false;
          }
        }

        if (key == "columncount") {
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof data[key] === "number"
          ) {
            console.log("Fields Validation Success");
          } else {
            msg.push({
              text: ` ${key} is required and data type should be string `,
            });
            status = false;
          }
        }

        if (key === "active" || key === "customQuery") {
          keyValue = helper.stringToBoolean(data[key]);
          if (
            data[key] !== null &&
            data[key] !== "" &&
            data[key] !== undefined &&
            typeof keyValue === "boolean"
          ) {
            console.log("Fields Validation Success");
          } else {
            msg.push({
              text: ` ${key} is required and data type should be boolean `,
            });
            status = false;
          }
        }

        if (key === "customQuery") {
          if (
            data[key] == "yes" ||
            data[key] == "Yes" ||
            data[key] == "YES" ||
            data[key] == "YEs" ||
            data[key] == "yES" ||
            data[key] == "yeS"
          ) {
            if (
              data.customSql !== null &&
              data.customSql !== "" &&
              data.customSql !== undefined
            ) {
              console.log("Fields Validation Success");
            } else {
              msg.push({
                text: ` Custom Sql is required  `,
              });
              status = false;
            }
            if (data.customSql.length <= 131072) {
              console.log("Fields Validation Success");
            } else {
              msg.push({
                text: ` Custom Sql Max of 131072 characters  `,
              });
              status = false;
            }
          }
          if (
            data[key] == "no" ||
            data[key] == "No" ||
            data[key] == "nO" ||
            data[key] == "NO"
          ) {
            if (
              data.tableName !== null &&
              data.tableName !== "" &&
              data.tableName !== undefined
            ) {
              console.log("Fields Validation Success");
            } else {
              msg.push({
                text: ` Table Name is required `,
              });
              status = false;
            }
            if (data.tableName.length <= 255) {
              console.log("Fields Validation Success");
            } else {
              msg.push({
                text: ` Table Name  Max of 255 characters  `,
              });
              status = false;
            }
          }
        }
      }
    }

    // for (let k in data) {
    //   columnArray.push(dsObj[k]);
    //   valueArry.push(data[k]);
    // }

    // console.log(columnArray, valueArry);
    // columnArray.push("updt_tm");
    // const dpColData = columnArray.filter(function (element) {
    //   return element !== undefined;
    // });

    // let Count = 1;
    // const resultData = dpColData.reduce((prev, cur) => {
    //   prev += cur.toString() + " =$" + Count + ", ";
    //   Count += 1;
    //   return prev;
    // }, "");

    // console.log(resultData);
    // console.log(resultData.slice(0, -2));

    // const fData = resultData.slice(0, -2);
    // console.log(fData);

    // let updateQueryDS = `UPDATE ${schemaName}.dataset set ${fData} where externalid='${externalID}'`;

    if (msg.length > 0) {
      return { validate: msg, status: status };
    }
    //else {
    //   let dataSetUpdate = await DB.executeQuery(updateQueryDS, [...valueArry]);

    //   ResponseBody.data_set = [];
    //   newObj.timestamp = ts;
    //   newObj.externalId = externalID;
    //   newObj.dataSetid = DSId;
    //   newObj.action = "Data Set update successfully.";
    //   ResponseBody.data_set.push(newObj);
    //   return { validate: ResponseBody, status: status };
    // }
  } catch (e) {
    console.log(e);
  }
};

const columnUpdate = async (data, externalID, DFId, version) => {};

const versionUpdate = async (data, externalID, DFId, version) => {};

exports.updateDataFlow = async (req, res) => {
  try {
    var validate = [];

    // if (req.body.externalSystemName !== "CDI") {
    //   var dataRes = insertValidation(req.body);
    //   if (dataRes.length > 0) {
    //     validate.push(dataRes);
    //     return apiResponse.ErrorResponse(res, validate);
    //   }
    // }

    const dataFlowExternalId = req.body.externalID;

    let selectDataFlow = `select * from ${schemaName}.dataflow where externalid='${dataFlowExternalId}'`;
    let selectVersion = `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = $1 order by version DESC limit 1`;

    let { rows } = await DB.executeQuery(selectDataFlow);
    let { rows: version } = await DB.executeQuery(selectVersion, [
      rows[0].dataflowid,
    ]);

    const DFVer = version[0].version;
    const ConnectionType = rows[0].connectiontype;
    const DFId = rows[0].dataflowid;

    if (rows.length > 0) {
      console.log("Update Query");

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

      var ResponseBody = {};
      // dataFlow update function Call
      var ReturnDFUpdate = await dataflowUpdate(
        req.body,
        dataFlowExternalId,
        DFId,
        DFVer
      );

      if (ReturnDFUpdate.status == false) {
        console.log("error");
        return apiResponse.ErrorResponse(res, ReturnDFUpdate.validate);
      }
      //  else {
      //   console.log("success", ReturnDFUpdate.validate);
      // }

      if (dataPackage && dataPackage.length > 0) {
        ResponseBody.data_packages = [];
        // if datapackage exists
        for (let each of dataPackage) {
          let selectDP = `select * from ${schemaName}.datapackage where externalid='${each.externalID}'`;
          let dpRows = await DB.executeQuery(selectDP);
          const packageExternalId = each.externalID;

          if (dpRows.rows.length > 0) {
            console.log("data package Update Function");
            const DPId = dpRows.rows[0].datapackageid;

            // Function call for update dataPackage data
            // var ReturnDPUpdate = await packageUpdate(
            //   each,
            //   packageExternalId,
            //   DPId,
            //   DFId,
            //   DFVer,
            //   ConnectionType
            // );

            // if (ReturnDPUpdate.status == false) {
            //   console.log("error");
            //   return apiResponse.ErrorResponse(res, ReturnDPUpdate.validate);
            // } else {
            //   console.log("success", ReturnDPUpdate.validate);
            // }

            if (each.dataSet && each.dataSet.length > 0) {
              ResponseBody.data_sets = [];
              // if datasets exists
              for (let obj of each.dataSet) {
                var newobj = {};
                let selectDS = `select * from ${schemaName}.dataset where externalid='${obj.externalID}'`;
                let { rows: dsRows } = await DB.executeQuery(selectDS);

                const datasetExternalId = obj.externalID;
                if (dsRows.length > 0) {
                  console.log("Data set update function");
                  const DSId = dsRows[0].datasetid;
                  //Function call for update dataSet data
                  // var ReturnDSUpdate = await datasetUpdate(
                  //   obj,
                  //   datasetExternalId,
                  //   DSId,
                  //   DPId,
                  //   DFId,
                  //   DFVer,
                  //   ConnectionType
                  // );

                  // if (ReturnDSUpdate.status == false) {
                  //   console.log("error line 1688");
                  //   return apiResponse.ErrorResponse(
                  //     res,
                  //     ReturnDSUpdate.validate
                  //   );
                  // }
                  // else {
                  //   console.log("success", ReturnDSUpdate.validate);
                  // }

                  // if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                  //   ResponseBody.column_definition = [];
                  //   for (let el of obj.columnDefinition) {
                  //     let clobj = {};
                  //     let selectDS = `select * from ${schemaName}.dataset where externalid='${obj.externalID}'`;
                  //     let { rows: dsRows } = await DB.executeQuery(selectDS);
                  //   }
                  // }
                } else {
                  console.log("Data set level Insert Function");
                  // Function call for insert dataSet level data
                  var ReturnDSUpdate = await datasetLevelInsert(
                    obj,
                    datasetExternalId,
                    DPId,
                    DFId,
                    DFVer,
                    ConnectionType
                  );

                  if (ReturnDSUpdate.status == false) {
                    console.log("error");
                    return apiResponse.ErrorResponse(
                      res,
                      ReturnDSUpdate.validate
                    );
                  } else {
                    console.log("success", ReturnDSUpdate.validate);
                  }
                }
              }
            }
          } else {
            console.log(" Package Level insert Function");
            var ReturnDPUpdate = await packageLevelInsert(
              each,
              packageExternalId,
              DFId,
              DFVer,
              ConnectionType
            );

            if (ReturnDPUpdate.status == false) {
              console.log("error");
              return apiResponse.ErrorResponse(res, ReturnDPUpdate.validate);
            } else {
              console.log("success", ReturnDPUpdate.validate);
            }
          }
        }
      }

      // return apiResponse.successResponseWithData(res, "Success", rows);
    } else {
      console.log("insert Query");
    }
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :update dataflow");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
