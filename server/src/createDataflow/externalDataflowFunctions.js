const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const { addDataflowHistory } = require("../controller/CommonController");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");

const { Console } = require("winston/lib/winston/transports");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.insertValidation = (req) => {
  var validate = [];
  var error = [];

  const Data = [
    {
      key: " Protocol Number Standard ",
      value: req.protocolNumberStandard,
      type: "string",
    },
    { key: "Vendor Name", value: req.vendorName, type: "string" },
    { key: "Data Structure ", value: req.type, type: "string" },
    { key: "Data Flow Name ", value: req.name, type: "string" },

    {
      key: "External System Name",
      value: req.externalSystemName,
      type: "string",
    },

    {
      key: "Test Flag",
      value: req.testFlag,
      type: "boolean",
    },
    { key: "Description", value: req.description, type: "string", length: 30 },
    {
      key: "active",
      value: req.active,
      type: "boolean",
    },
  ];

  // Validating Connection Type and externalID
  var ConnectionType = req.connectionType;
  const description = req.description;
  const externalID = req.externalID;

  if (externalID !== null && externalID !== "" && externalID !== undefined) {
  } else {
    validate.push({
      err: " External Id  is required and data type should be string or Number ",
    });
  }
  if (!ConnectionType) {
    validate.push({
      err: " ConnectionType is required and data type should be string ",
    });
  } else {
    if (!helper.isConnectionType(ConnectionType)) {
      validate.push({
        err: " ConnectionType's Supported values : SFTP, FTPS, Oracle, Hive CDP, Hive CDH, Impala, MySQL, PostgreSQL, SQL Server ",
      });
    }
  }

  if (description.length <= 30) {
  } else {
    validate.push({
      err: " Description length , Max of 30 characters  ",
    });
  }

  // Validation Function call for dataFlow data
  let dataRes = helper.validation(Data);
  if (dataRes.length > 0) {
    validate.push(dataRes);
  } else {
    if (req.dataPackage && req.dataPackage.length > 0) {
      // console.log("data package data", req.body.dataPackage.length);
      for (let each of req.dataPackage) {
        var LocationType = req.connectionType;
        if (
          each.externalID === null ||
          each.externalID === "" ||
          each.externalID === undefined
        ) {
          validate.push({
            err: " Data Package, Level External Id  is required and data type should be string or Number ",
          });
        } else {
          if (helper.isSftp(LocationType)) {
            // if (LocationType === "Hive CDH") {
            // console.log("data");
            const dpArray = [
              {
                key: "No Package Level Config ",
                value: each.noPackageConfig,
                type: "boolean",
              },
              {
                key: "Package Path  ",
                value: each.path,
                type: "string",
              },
              {
                key: "Package Naming Convention",
                value: each.name,
                type: "string",
              },
              {
                key: "active",
                value: each.active,
                type: "boolean",
              },
            ];

            if (helper.stringToBoolean(each.noPackageConfig) === false) {
              const dpArrayST = [
                { key: "Package type", value: each.type, type: "string" },
                {
                  key: "SAS XPT Method ",
                  value: each.sasXptMethod,
                  type: "string",
                },
              ];
              if (!helper.isPackageType(each.type)) {
                validate.push({
                  err: " Package type's Supported values : 7Z, ZIP, RAR, SAS ",
                });
              }

              let dpResST = helper.validation(dpArrayST);
              if (dpResST.length > 0) {
                validate.push(dpResST);
              }
            }

            if (each.type) {
              if (!helper.isPackageType(each.type)) {
                validate.push({
                  err: " Package type's Supported values : 7Z, ZIP, RAR, SAS ",
                });
              }
            }
            let dpRes = helper.validation(dpArray);
            if (dpRes.length > 0) {
              validate.push(dpRes);
            } else {
              if (each.dataSet && each.dataSet.length > 0) {
                for (let obj of each.dataSet) {
                  if (
                    obj.externalID !== null &&
                    obj.externalID !== "" &&
                    obj.externalID !== undefined
                  ) {
                  } else {
                    validate.push({
                      err: " Data Set Level, External Id  is required and data type should be string or Number ",
                    });
                  }

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
                      key: "New Data Frequency (Days)",
                      value: obj.dataTransferFrequency,
                      type: "number",
                    },
                    {
                      key: "active",
                      value: obj.active,
                      type: "boolean",
                    },
                  ];

                  if (
                    obj.customQuery ||
                    obj.customSql ||
                    obj.conditionalExpression ||
                    obj.incremental ||
                    obj.offsetColumn
                  ) {
                    validate.push({
                      err: " In SFTP/FTPS customQuery, customSQL, conditionalExpression, incremental, offsetColumn should be blank ",
                    });
                  }

                  if (obj.incremental === 0) {
                    validate.push({
                      err: " In SFTP/FTPS incremental should be blank ",
                    });
                  }

                  // console.log("line 373", obj.type.toLowerCase());
                  if (obj.type.toLowerCase() === "delimited") {
                    const dsArrayDt = [
                      {
                        key: "Delimiter",
                        value: obj.delimiter,
                        type: "string",
                      },
                      { key: "Quote", value: obj.quote, type: "string" },

                      {
                        key: "Escape Character",
                        value: obj.escapeCode,
                        type: "string",
                      },
                    ];

                    let dsResdt = helper.validation(dsArrayDt);
                    if (dsResdt.length > 0) {
                      validate.push(dsResdt);
                    }
                  }

                  let dsRes = helper.validation(dsArray);
                  if (dsRes.length > 0) {
                    validate.push(dsRes);
                  } else {
                    if (
                      obj.columnDefinition &&
                      obj.columnDefinition.length > 0
                    ) {
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
                            value: el.unique,
                            type: "boolean",
                          },
                        ];

                        // Validation Function call for column defination
                        let clRes = helper.validation(clArray);
                        if (clRes.length > 0) {
                          validate.push(clRes);
                        }

                        if (
                          typeof el.characterMin != "undefined" &&
                          typeof el.characterMax != "undefined"
                        ) {
                          if (el.characterMin <= el.characterMax) {
                          } else {
                            validate.push({
                              err: " MinCharacter always less than MaxCharacter  ",
                            });
                          }
                        }
                      }

                      // If Column is not = 0 then Column Comunt is not null
                      dsArray.push({
                        key: "columncount",
                        value: obj.columncount,
                        type: "number",
                      });

                      // Validation Function call for column Number fields
                      let cnRes = helper.validation(dsArray);
                      if (cnRes.length > 0) {
                        validate.push(cnRes);
                      }
                    }
                  }
                }
              }
            }
          } else {
            if (
              helper.stringToBoolean(each.noPackageConfig) === true &&
              helper.stringToBoolean(each.active) === true
            ) {
            } else {
              validate.push({
                err: " In JDBC noPackageConfig, active should be True ",
              });
            }

            if (each.type || each.sasXptMethod || each.path || each.name) {
              validate.push({
                err: " In JDBC Data Package Level type, sasXptMethod, path, name should be blank ",
              });
            }

            if (each.dataSet && each.dataSet.length > 0) {
              for (let obj of each.dataSet) {
                if (
                  obj.externalID !== null &&
                  obj.externalID !== "" &&
                  obj.externalID !== undefined
                ) {
                } else {
                  validate.push({
                    err: " Data Set Level, External Id  is required and data type should be string or Number ",
                  });
                }

                if (
                  obj.type ||
                  obj.name ||
                  obj.delimiter ||
                  obj.quote ||
                  obj.rowDecreaseAllowed ||
                  obj.dataTransferFrequency ||
                  obj.escapeCode ||
                  obj.path
                ) {
                  validate.push({
                    err: " In JDBC Data Set Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, escapeCode, path should be blank ",
                  });
                }

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
                ];

                if (obj.customQuery.toLowerCase() == "yes") {
                  if (
                    obj.customSql !== null &&
                    obj.customSql !== "" &&
                    obj.customSql !== undefined
                  ) {
                  } else {
                    validate.push({
                      err: " Custom Sql  is required ",
                    });
                  }
                }
                if (obj.customQuery.toLowerCase() == "no") {
                  if (
                    obj.tableName !== null &&
                    obj.tableName !== "" &&
                    obj.tableName !== undefined
                  ) {
                    if (obj.tableName.length <= 255) {
                    } else {
                      validate.push({
                        err: " Table Name  Max of 255 characters  ",
                      });
                    }
                  } else {
                    validate.push({
                      err: " Table Name  is required ",
                    });
                  }
                  if (helper.stringToBoolean(obj.incremental) === true) {
                    if (
                      obj.offsetColumn !== null &&
                      obj.offsetColumn !== "" &&
                      obj.offsetColumn !== undefined &&
                      typeof obj.offsetColumn === "string"
                    ) {
                    } else {
                      validate.push({
                        err: " offsetColumn  is required and data type should be string",
                      });
                    }
                  }
                }

                // Validation Function call for data set
                let dsRes = helper.validation(dsArray);
                if (dsRes.length > 0) {
                  validate.push(dsRes);
                } else {
                  // console.log("data set data", dsData);

                  if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                    for (let el of obj.columnDefinition) {
                      const clArray = [
                        {
                          key: "Include Flag",
                          value: el.includeFlag,
                          type: "boolean",
                        },
                        {
                          key: "Column Name or Designator ",
                          value: el.name,
                          type: "string",
                        },
                        {
                          key: "Data Type ",
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
                          value: el.unique,
                          type: "boolean",
                        },
                      ];

                      // Validation Function call for column defination
                      let clRes = helper.validation(clArray);
                      if (clRes.length > 0) {
                        validate.push(clRes);
                      }

                      if (
                        el.characterMin ||
                        el.characterMax ||
                        el.lov ||
                        el.position
                      ) {
                        validate.push({
                          err: " In JDBC characterMin, characterMax, position, lov should be blank ",
                        });
                      }
                    }

                    // If Column is not = 0 then Column Comunt is not null
                    dsArray.push({
                      key: "columncount",
                      value: obj.columncount,
                      type: "number",
                    });

                    // Validation Function call for column Number fields
                    let cnRes = helper.validation(dsArray);
                    if (cnRes.length > 0) {
                      validate.push(cnRes);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return validate;
};

exports.packageLevelInsert = async (
  data,
  DFId,
  version,
  ConnectionType,
  externalSysName
) => {
  try {
    const { externalID } = data;
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorPackage = [];
    var dataPackage = [];

    if (helper.isSftp(LocationType)) {
      // if (LocationType === "MySQL") {
      const dpArray = [
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
        {
          key: "Package Path  ",
          value: data.path,
          type: "string",
        },
      ];

      if (!helper.stringToBoolean(data.noPackageConfig)) {
        const dpArrayST = [
          { key: "Package type", value: data.type, type: "string" },
          {
            key: "SAS XPT Method ",
            value: data.sasXptMethod,
            type: "string",
          },
        ];
        if (!helper.isPackageType(data.type)) {
          errorPackage.push(
            " Package type's Supported values : 7Z, ZIP, RAR, SAS "
          );
        }

        let dpResST = helper.validation(dpArrayST);

        if (dpResST.length > 0) {
          errorPackage.push(dpResST);
        }
      }

      if (data.type) {
        if (!helper.isPackageType(data.type)) {
          errorPackage.push(
            " Package type's Supported values : 7Z, ZIP, RAR, SAS "
          );
        }
      }

      let dpRes = helper.validation(dpArray);

      if (dpRes.length > 0) {
        errorPackage.push(dpRes);
      }
    } else {
      if (
        !helper.stringToBoolean(data.noPackageConfig) ||
        !helper.stringToBoolean(data.active)
      ) {
        errorPackage.push(" In JDBC noPackageConfig, active should be True ");
      }

      if (data.type || data.sasXptMethod || data.path || data.name) {
        errorPackage.push(
          " In JDBC type, sasXptMethod path name should be blank "
        );
      }
    }

    if (errorPackage.length > 0) {
      errorPackage.splice(0, 0, `Datapackage External Id -${externalID} `);
      return { sucRes: dataPackage, errRes: errorPackage };
    }

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

    DpObj.externalId = externalID;
    DpObj.datapackageid = dpUid;
    DpObj.action = "Data package created successfully.";
    DpObj.timestamp = ts;
    dataPackage.push(DpObj);
    // // each.datapackageid = dpUid;

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
          ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        DFId,
        dpUid,
        null,
        null,
        version,
        "New Datapackage",
        "",
        "",
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    if (data.dataSet && data.dataSet.length > 0) {
      dataPackage.data_sets = [];

      for (let obj of data.dataSet) {
        if (helper.isSftp(LocationType)) {
          // if (LocationType === "MySQL") {
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
              key: "columncount",
              value: obj.columncount,
              type: "number",
            },
          ];

          const dsreqSftp = helper.validation(dsArray);
          if (dsreqSftp.length > 0) {
            errorPackage.push(dsreqSftp);
          }

          if (obj.type.toLowerCase() === "delimited") {
            const dsArrayDt = [
              {
                key: "Delimiter",
                value: obj.delimiter,
                type: "string",
              },
              { key: "Quote", value: obj.quote, type: "string" },

              {
                key: "Escape Character",
                value: obj.escapeCode,
                type: "string",
              },
            ];

            let dsResdt = helper.validation(dsArrayDt);
            if (dsResdt.length > 0) {
              errorPackage.push(dsResdt);
            }
          }
          if (
            obj.customQuery ||
            obj.customSql ||
            obj.incremental ||
            obj.conditionalExpression ||
            obj.offsetColumn
          ) {
            errorPackage.push(
              "For SFTP/FTPS customQuery, customSql, incremental, conditionalExpression, offsetColumn fields should be Blank "
            );
          }

          if (typeof obj.incremental != "undefined") {
            if (obj.incremental === 0) {
              errorPackage.push(" In SFTP/FTPS incremental should be blank ");
            }
          }
        } else {
          if (
            obj.type ||
            obj.name ||
            obj.delimiter ||
            obj.quote ||
            obj.rowDecreaseAllowed ||
            obj.dataTransferFrequency ||
            obj.path ||
            obj.escapeCode
          ) {
            errorPackage.push(
              " In JDBC Dataset Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, path, escapeCode should be Blank "
            );
          }

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
              key: "columncount",
              value: obj.columncount,
              type: "number",
            },
          ];

          const dsreq = helper.validation(dsArray);
          if (dsreq.length > 0) {
            errorPackage.push(dsreq);
          }

          if (obj.customQuery.toLowerCase() == "yes") {
            if (!obj.customSql) {
              errorPackage.push(" Custom Sql  is required  ");
            }
          }
          if (obj.customQuery.toLowerCase() == "no") {
            if (!obj.tableName) {
              errorPackage.push(" Table Name  is required  ");
            } else {
              if (obj.tableName.length >= 255) {
                errorPackage.push(" Table Name  Max of 255 characters  ");
              }
            }
            if (helper.stringToBoolean(obj.incremental)) {
              if (!obj.offsetColumn) {
                errorPackage.push(
                  " offsetColumn  is required and data type should be string  "
                );
              }
            }
          }
        }
        // console.log("insert data set");

        if (errorPackage.length > 0) {
          errorPackage.splice(0, 0, `Dataset External Id -${obj.externalID} `);
          return { sucRes: dataPackage, errRes: errorPackage };
        }

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
        if (obj.customQuery.toLowerCase() === "no") {
          if (obj.columnDefinition?.length > 0) {
            const cList = obj.columnDefinition.map(
              (el) => el.name || el.columnName
            );
            sqlQuery = helper.createCustomSql(
              cList,
              obj.tableName,
              obj.conditionalExpression
            );
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
          helper.getCurrentTime(),
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

        dsObj.externalId = obj.externalID;
        dsObj.datasetid = dsUid;
        dsObj.PackageExternalId = externalID;
        dsObj.action = "Data set created successfully.";
        dsObj.timestamp = ts;
        dataPackage.data_sets.push(dsObj);

        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_audit_log
                ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
          [
            DFId,
            dpUid,
            dsUid,
            null,
            version,
            "New Dataset",
            "",
            "",
            externalSysName,
            helper.getCurrentTime(),
          ]
        );

        if (obj.columnDefinition && obj.columnDefinition.length > 0) {
          dataPackage.column_definition = [];
          for (let el of obj.columnDefinition) {
            // console.log("insert Column Definition");

            if (helper.isSftp(LocationType)) {
              const clArrayif = [
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
                  value: el.unique,
                  type: "boolean",
                },
              ];

              let clResif = helper.validation(clArrayif);
              if (clResif.length > 0) {
                errorPackage.push(clResif);
              }

              if (
                typeof el.characterMin !== "undefined" &&
                typeof el.characterMax !== "undefined"
              ) {
                if (el.characterMin <= el.characterMax) {
                  errorPackage.push(
                    "MinCharacter always less than MaxCharacter "
                  );
                }
              }
            } else {
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
                  key: "Include Flag",
                  value: el.includeFlag,
                  type: "boolean",
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
                  value: el.unique,
                  type: "boolean",
                },
              ];

              let clRes = helper.validation(clArray);
              if (clRes.length > 0) {
                errorPackage.push(clRes);
              }

              if (el.characterMin || el.characterMax || el.lov || el.position) {
                // console.log(val.key, val.value);
                errorPackage.push(
                  "For JBDC characterMin, characterMax, lov, position fields should be Blank "
                );
              }
            }

            if (errorPackage.length > 0) {
              errorPackage.splice(
                0,
                0,
                `Dataset External Id -${obj.externalID} `
              );
              return { sucRes: dataPackage, errRes: errorPackage };
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
              helper.getCurrentTime(),
            ];
            await DB.executeQuery(
              `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                  primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                  insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
              CDBody
            );

            cdObj.colmunid = CDUid;
            cdObj.dataSetExternalId = obj.externalID;
            cdObj.action = "column definition created successfully.";
            cdObj.timestamp = ts;
            dataPackage.column_definition.push(cdObj);

            await DB.executeQuery(
              `INSERT INTO ${schemaName}.dataflow_audit_log
                      ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
              [
                DFId,
                dpUid,
                dsUid,
                null,
                version,
                "New Column Definition",
                "",
                "",
                externalSysName,
                helper.getCurrentTime(),
              ]
            );
          }
        }
      }
    }
    return { sucRes: dataPackage, errRes: errorPackage };
    // return;
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :DataPackage Level Insert");
    Logger.error(err);
  }
};

exports.datasetLevelInsert = async (
  obj,
  externalID,
  DPId,
  DFId,
  version,
  ConnectionType,
  externalSysName
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorDataset = [];
    var dataSet = [];

    if (helper.isSftp(LocationType)) {
      // if (LocationType == "Hive CDH") {

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
          key: "New Data Frequency (Days)",
          value: obj.dataTransferFrequency,
          type: "number",
        },
        {
          key: "active",
          value: obj.active,
          type: "boolean",
        },
      ];

      let dsArrRes = helper.validation(dsArray);
      if (dsArrRes.length > 0) {
        errorDataset.push(dsArrRes);
      }

      if (obj.type.toLowerCase() === "delimited") {
        const dsArrayDt = [
          {
            key: "Delimiter",
            value: obj.delimiter,
            type: "string",
          },
          { key: "Quote", value: obj.quote, type: "string" },

          {
            key: "Escape Character",
            value: obj.escapeCode,
            type: "string",
          },
        ];

        let dsResdt = helper.validation(dsArrayDt);
        if (dsResdt.length > 0) {
          errorDataset.push(dsResdt);
        }
      }

      if (
        obj.customQuery ||
        obj.customSql ||
        obj.incremental ||
        obj.conditionalExpression ||
        obj.offsetColumn
      ) {
        errorDataset.push(
          "For SFTP/FTPS customQuery, customSql, incremental, conditionalExpression, offsetColumn fields should be Blank "
        );
      }
      if (typeof data.incremental != "undefined") {
        if (data.incremental === 0) {
          errorDataset.push("In SFTP/FTPS incremental should be blank");
        }
      }
    } else {
      // console.log("else data set1");
      if (
        obj.type ||
        obj.name ||
        obj.delimiter ||
        obj.quote ||
        obj.rowDecreaseAllowed ||
        obj.dataTransferFrequency ||
        obj.path ||
        obj.escapeCode
      ) {
        errorDataset.push(
          " In JDBC Dataset Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, Path, escapeCode should be Blank "
        );
      }

      const dsElse = [
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
          key: "columncount",
          value: obj.columncount,
          type: "number",
        },
      ];

      const dsreqElse = helper.validation(dsElse);

      if (dsreqElse.length > 0) {
        errorDataset.push(dsreqElse);
      }

      if (obj.customQuery.toLowerCase() == "yes") {
        if (!obj.customSql) {
          errorDataset.push(" Custom Sql  is required  ");
        }
      }
      if (obj.customQuery.toLowerCase() == "no") {
        if (!obj.tableName) {
          errorDataset.push(" Table Name  is required  ");
        } else {
          if (obj.tableName.length >= 255) {
            errorDataset.push(" Table Name  Max of 255 characters  ");
          }
        }
        if (helper.stringToBoolean(obj.incremental)) {
          if (!obj.offsetColumn) {
            errorDataset.push(
              " offsetColumn  is required and data type should be string  "
            );
          }
        }
      }
    }
    // console.log("insert data set");
    if (errorDataset.length > 0) {
      errorDataset.splice(0, 0, `DataSet External Id -${externalID} `);
      return { sucRes: dataSet, errRes: errorDataset };
    }

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
    if (obj.customQuery.toLowerCase() === "no") {
      if (obj.columnDefinition?.length > 0) {
        const cList = obj.columnDefinition.map(
          (el) => el.name || el.columnName
        );
        sqlQuery = helper.createCustomSql(
          cList,
          obj.tableName,
          obj.conditionalExpression
        );
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
      helper.getCurrentTime(),
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
    dsObj.externalId = obj.externalID;
    dsObj.datasetid = dsUid;
    dsObj.action = "Data set created successfully.";
    dsObj.timestamp = ts;
    dataSet.push(dsObj);

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
                ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        DFId,
        DPId,
        dsUid,
        null,
        version,
        "New Dataset",
        "",
        "",
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    if (obj.columnDefinition && obj.columnDefinition.length > 0) {
      dataSet.column_definition = [];
      for (let el of obj.columnDefinition) {
        if (helper.isSftp(LocationType)) {
          const clArrayIf = [
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
              value: el.unique,
              type: "boolean",
            },
          ];

          let clResIf = helper.validation(clArrayIf);
          if (clResIf.length > 0) {
            errorDataset.push(clResIf);
          }

          if (
            typeof el.characterMin != "undefined" &&
            typeof el.characterMax != "undefined"
          ) {
            if (el.characterMin >= el.characterMax) {
              errorDataset.push("MinCharacter always less than MaxCharacter ");
            }
          }
        } else {
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
              value: el.unique,
              type: "boolean",
            },
            {
              key: "includeFlag",
              value: el.includeFlag,
              type: "boolean",
            },
          ];

          let clRes = helper.validation(clArray);
          if (clRes.length > 0) {
            errorDataset.push(clRes);
          }

          if (el.characterMin || el.characterMax || el.lov || el.position) {
            // console.log(val.key, val.value);
            errorDataset.push(
              "For JBDC characterMin, characterMax, lov, position fields should be Blank "
            );
          }
        }

        if (errorDataset.length > 0) {
          errorDataset.splice(0, 0, `Dataset External Id -${obj.externalID} `);
          return { sucRes: dataSet, errRes: errorDataset };
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
          helper.getCurrentTime(),
        ];
        await DB.executeQuery(
          `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                  primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                  insrt_tm, updt_tm) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14);`,
          CDBody
        );

        cdObj.colmunid = CDUid;
        cdObj.externalId = obj.externalID;
        cdObj.action = "column definition created successfully.";
        cdObj.timestamp = ts;
        dataSet.column_definition.push(cdObj);

        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_audit_log
                      ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
          [
            DFId,
            DPId,
            dsUid,
            null,
            version,
            "New Column Definition",
            "",
            "",
            externalSysName,
            helper.getCurrentTime(),
          ]
        );
      }
    }

    return { sucRes: dataSet, errRes: errorDataset };
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :Data Set Level Insert");
    Logger.error(err);
  }
};

exports.columnLevelInsert = async (req, res) => {
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

exports.dataflowUpdate = async (
  data,
  externalID,
  DFId,
  version,
  externalSysName,
  conf_data
) => {
  try {
    let ts = new Date().toLocaleString();
    var dataflow = [];
    let studyId;
    let vendorId;
    let vName;
    let ptNum;
    let desc;
    var newDfobj = {};

    const q1 = `select * from ${schemaName}.dataflow where externalid='${externalID}'`;
    let q3 = `select vend_nm from ${schemaName}.vendor where vend_id=$1;`;
    let q4 = `select prot_nbr_stnd  from study where prot_id=$1;`;

    if (data.vendorName) {
      let q2 = `select vend_id from ${schemaName}.vendor where vend_nm=$1;`;
      let { rows } = await DB.executeQuery(q2, [data.vendorName]);
      vendorId = rows[0].vend_id;
    }
    const dataflowData = await DB.executeQuery(q1);

    const vendorData = await DB.executeQuery(q3, [
      dataflowData.rows[0].vend_id,
    ]);
    const protocolData = await DB.executeQuery(q4, [
      dataflowData.rows[0].prot_id,
    ]);

    if (data.vendorName) {
      vName = data.vendorName;
    } else {
      vName = vendorData.rows[0].vend_nm;
    }

    if (data.protocolNumberStandard) {
      ptNum = data.protocolNumberStandard;
      const studyRows = await DB.executeQuery(
        `select prot_id from study where prot_nbr_stnd ='${data.protocolNumberStandard}';`
      );

      if (studyRows.rows.length > 0) {
        studyId = studyRows.rows[0].prot_id;
      }
    } else {
      ptNum = protocolData.rows[0].prot_nbr_stnd;
    }

    if (data.description) {
      desc = data.description;
    } else {
      desc = dataflowData.rows[0].description;
    }
    var DFTestname = `${vName}-${ptNum}-${desc}`;
    var testFlag = helper.stringToBoolean(data.testFlag);

    if (testFlag === true) {
      DFTestname = "TST-" + DFTestname;
    }

    let updateQueryDF = `update ${schemaName}.dataflow set updt_tm=NOW(), refreshtimestamp=NOW()`;

    if (data.type) {
      updateQueryDF += `,type='${data.type}'`;
    }

    if (data.description) {
      updateQueryDF += `,description='${data.description}'`;
    }
    if (data.externalSystemName) {
      updateQueryDF += `,externalsystemname='${data.externalSystemName}'`;
    }
    if (data.exptDtOfFirstProdFile) {
      updateQueryDF += `,expt_fst_prd_dt='${data.exptDtOfFirstProdFile}'`;
    }
    if (typeof data.testFlag != undefined && data.testFlag === null) {
      updateQueryDF += `,testflag=${
        helper.stringToBoolean(data.testFlag) ? 1 : 0
      }`;
    }
    if (typeof data.active != undefined) {
      updateQueryDF += `,active=${helper.stringToBoolean(data.active) ? 1 : 0}`;
    }
    if (data.protocolNumberStandard) {
      updateQueryDF += ` ,prot_id='${studyId}'`;
    }
    if (data.vendorName) {
      updateQueryDF += ` ,vend_id= '${vendorId}'`;
    }
    if (data.protocolNumberStandard || data.type || data.vendorName) {
      updateQueryDF += `,name='${DFTestname}'`;
    }

    updateQueryDF += ` where externalid='${externalID}' returning *;`;

    const { rows: existDfRows } = await DB.executeQuery(
      `SELECT type, description, externalsystemname , expt_fst_prd_dt ,
       testflag , active, prot_id , vend_id , name
       from ${schemaName}.dataflow where externalid='${externalID}';`
    );
    const existDf = existDfRows[0];
    const dataflowupdate = await DB.executeQuery(updateQueryDF);
    const dataflowObj = dataflowupdate.rows[0];
    const diffObj = helper.getdiffKeys(existDf, dataflowObj);

    // console.log("dada", diffObj);

    // Version Table enrty
    let dataflow_version_query = `INSERT INTO ${schemaName}.dataflow_version
        ( dataflowid, "version", config_json, created_by, created_on)
        VALUES($1,$2,$3,$4,$5);`;
    let aduit_version_body = [
      DFId,
      version,
      JSON.stringify(conf_data),
      externalSysName,
      new Date(),
    ];
    await DB.executeQuery(dataflow_version_query, aduit_version_body);

    // Audit Log Table enrty
    for (let key of Object.keys(diffObj)) {
      let oldData = diffObj[key];
      let newData = dataflowObj[key];
      await DB.executeQuery(
        `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
        [
          DFId,
          null,
          null,
          null,
          version,
          key,
          oldData,
          newData,
          externalSysName,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return { sucRes: dataflow };
    } else {
      newDfobj.externalId = externalID;
      newDfobj.dataSetid = DFId;
      newDfobj.action = "Data Flow update successfully.";
      newDfobj.timestamp = ts;
      dataflow.push(newDfobj);
      return { sucRes: dataflow };
    }
  } catch (e) {
    console.log(e);
    Logger.error("catch :Data Flow Update");
    Logger.error(e);
  }
};

exports.packageUpdate = async (
  data,
  externalID,
  DPId,
  DFId,
  version,
  ConnectionType,
  externalSysName
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    const valData = [];
    let errorPackage = [];
    var newObj = {};
    var data_packages = [];

    if (helper.isSftp(LocationType)) {
      // if (LocationType == "Hive CDH") {
      if (typeof data.path != "undefined") {
        valData.push({ key: "path ", value: data.path, type: "string" });
      }
      if (typeof data.name != "undefined") {
        valData.push({ key: "name ", value: data.name, type: "string" });
      }
      if (typeof data.noPackageConfig != "undefined") {
        valData.push({
          key: "noPackageConfig ",
          value: data.noPackageConfig,
          type: "boolean",
        });
      }

      let dpResUpdate = helper.validation(valData);

      if (dpResUpdate.length > 0) {
        errorPackage.push(dpResUpdate);
      }

      if (!helper.stringToBoolean(data.noPackageConfig)) {
        const TypeSas = [];
        if (typeof data.type != "undefined") {
          TypeSas.push({
            key: "Package type",
            value: data.type,
            type: "string",
          });
        }
        if (typeof data.sasXptMethod != "undefined") {
          TypeSas.push({
            key: "sasXptMethod",
            value: data.sasXptMethod,
            type: "string",
          });
        }

        if (typeof data.type != "undefined") {
          if (!helper.isPackageType(data.type)) {
            errorPackage.push(
              " Package type's Supported values : 7Z, ZIP, RAR, SAS "
            );
          }
        }

        let TypeSasRes = helper.validation(TypeSas);

        if (TypeSasRes.length > 0) {
          errorPackage.push(TypeSasRes);
        }
      }

      if (typeof data.type != "undefined") {
        if (!helper.isPackageType(data.type)) {
          errorPackage.push(
            " Package type's Supported values : 7Z, ZIP, RAR, SAS "
          );
        }
      }
    } else {
      if (
        !helper.stringToBoolean(data.noPackageConfig) ||
        !helper.stringToBoolean(data.active)
      ) {
        errorPackage.push(" In JDBC noPackageConfig, active should be True ");
      }
      if (data.type || data.sasXptMethod || data.path || data.name) {
        errorPackage.push(
          " In JDBC type, sasXptMethod, path, name should be blank "
        );
      }
    }

    if (errorPackage.length > 0) {
      errorPackage.splice(0, 0, `Datapackage External Id -${externalID} `);
      return { sucRes: data_packages, errRes: errorPackage };
    }

    let updateQueryDP = `update ${schemaName}.datapackage set updt_tm=NOW()`;
    if (data.type) {
      updateQueryDP += `, type='${data.type}'`;
    }
    if (data.name) {
      updateQueryDP += `, name='${data.name}'`;
    }
    if (data.path) {
      updateQueryDP += `, path='${data.path}'`;
    }
    if (data.sasXptMethod) {
      updateQueryDP += `, sasxptmethod='${data.sasXptMethod}'`;
    }
    if (data.password) {
      updateQueryDP += `, password='${data.password}'`;
    }
    if (data.noPackageConfig) {
      updateQueryDP += `, nopackageconfig='${data.noPackageConfig}'`;
    }
    updateQueryDP += ` where externalid='${externalID}' returning *;`;

    const { rows: existDPRows } = await DB.executeQuery(
      `SELECT type, name, path, sasxptmethod ,password, nopackageconfig 
       from ${schemaName}.datapackage where externalid='${externalID}';`
    );

    const existDP = existDPRows[0];
    const dataPackageupdate = await DB.executeQuery(updateQueryDP);
    const dataPackageObj = dataPackageupdate.rows[0];
    const diffObj = helper.getdiffKeys(existDP, dataPackageObj);

    // console.log("dada", diffObj);

    for (let key of Object.keys(diffObj)) {
      let oldData = diffObj[key];
      let newData = dataPackageObj[key];
      await DB.executeQuery(
        `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
        [
          DFId,
          DPId,
          null,
          null,
          version,
          key,
          oldData,
          newData,
          externalSysName,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return { sucRes: data_packages, errRes: errorPackage };
    } else {
      newObj.externalId = externalID;
      newObj.datapackageid = DPId;
      newObj.action = "Data package update successfully.";
      newObj.timestamp = ts;
      data_packages.push(newObj);

      return { sucRes: data_packages, errRes: errorPackage };
    }
  } catch (e) {
    console.log(e);
    Logger.error("catch :Data package update");
    Logger.error(e);
  }
};

exports.datasetUpdate = async (
  data,
  externalID,
  DSId,
  DPId,
  DFId,
  version,
  ConnectionType,
  custSql,
  externalSysName
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    var dataset_update = [];
    var newObj = {};
    const valDataset = [];
    var dataKi_Id;
    let errorDataset = [];

    if (data.dataKind) {
      let checkDataKind = await DB.executeQuery(
        `select datakindid from ${schemaName}.datakind where name='${data.dataKind}';`
      );
      if (checkDataKind.rows.length > 0) {
        dataKi_Id = checkDataKind.rows[0].datakindid;
      } else {
        errorDataset.push(" This datakindid is not exist ");
      }
    }

    // Request Filed validation loop

    if (helper.isSftp(LocationType)) {
      // if (LocationType === "Hive CDH") {
      if (typeof data.mnemonic != "undefined") {
        valDataset.push({
          key: "mnemonic ",
          value: data.mnemonic,
          type: "string",
        });
      }
      if (typeof data.dataKind != "undefined") {
        valDataset.push({
          key: "dataKind ",
          value: data.dataKind,
          type: "string",
        });
      }
      if (typeof data.type != "undefined") {
        valDataset.push({
          key: "type ",
          value: data.type,
          type: "string",
        });
      }
      if (typeof data.name != "undefined") {
        valDataset.push({
          key: "name ",
          value: data.name,
          type: "string",
        });
      }
      if (typeof data.path != "undefined") {
        valDataset.push({
          key: "path ",
          value: data.path,
          type: "string",
        });
      }
      if (typeof data.rowDecreaseAllowed != "undefined") {
        valDataset.push({
          key: "rowDecreaseAllowed ",
          value: data.rowDecreaseAllowed,
          type: "number",
        });
      }
      if (typeof data.dataTransferFrequency != "undefined") {
        valDataset.push({
          key: "dataTransferFrequency ",
          value: data.dataTransferFrequency,
          type: "number",
        });
      }
      if (typeof data.columncount != "undefined") {
        valDataset.push({
          key: "columncount ",
          value: data.columncount,
          type: "number",
        });
      }
      if (typeof data.active != "undefined") {
        valDataset.push({
          key: "active ",
          value: data.active,
          type: "boolean",
        });
      }

      let dataSetRes = helper.validation(valDataset);

      if (dataSetRes.length > 0) {
        errorDataset.push(dataSetRes);
      }

      if (data.type) {
        if (data.type.toLowerCase() === "delimited") {
          const dlData = [];
          if (typeof data.delimiter != "undefined") {
            dlData.push({
              key: "delimiter ",
              value: data.delimiter,
              type: "string",
            });
          }
          if (typeof data.quote != "undefined") {
            dlData.push({
              key: "quote ",
              value: data.quote,
              type: "string",
            });
          }
          if (typeof data.escapeCode != "undefined") {
            dlData.push({
              key: "escapeCode ",
              value: data.escapeCode,
              type: "string",
            });
          }

          let dlRes = helper.validation(dlData);
          if (dlRes.length > 0) {
            errorDataset.push(dlRes);
          }
        }
      }

      if (
        data.customQuery ||
        data.customSql ||
        data.incremental ||
        data.conditionalExpression ||
        data.offsetColumn
      ) {
        errorDataset.push(
          " For SFTP/FTPS, customQuery, customSql incremental, conditionalExpression, offsetColumn fields should be Blank "
        );
      }

      if (typeof data.incremental != "undefined") {
        if (data.incremental === 0) {
          errorDataset.push("In SFTP/FTPS incremental should be blank");
        }
      }
    } else {
      if (typeof data.mnemonic != "undefined") {
        valDataset.push({
          key: "mnemonic ",
          value: data.mnemonic,
          type: "string",
        });
      }
      if (typeof data.dataKind != "undefined") {
        valDataset.push({
          key: "dataKind ",
          value: data.dataKind,
          type: "string",
        });
      }
      if (typeof data.columncount != "undefined") {
        valDataset.push({
          key: "columncount ",
          value: data.columncount,
          type: "number",
        });
      }
      if (typeof data.customQuery != "undefined") {
        valDataset.push({
          key: "customQuery ",
          value: data.customQuery,
          type: "boolean",
        });
      }

      let dataSetRes = helper.validation(valDataset);

      if (dataSetRes.length > 0) {
        errorDataset.push(dataSetRes);
      }

      if (
        data.type ||
        data.name ||
        data.delimiter ||
        data.quote ||
        data.rowDecreaseAllowed ||
        data.dataTransferFrequency ||
        data.path ||
        data.escapeCode
      ) {
        errorDataset.push(
          " In JDBC Dataset Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, Path, escapeCode should be Blank "
        );
      }

      if (data.customQuery) {
        if (data.customQuery.toLowerCase() == "yes") {
          if (!data.customSql) {
            errorDataset.push(" Custom Sql  is required  ");
          }
        }
        if (data.customQuery.toLowerCase() == "no") {
          if (!data.tableName) {
            errorDataset.push(" Table Name  is required  ");
          } else {
            if (data.tableName.length >= 255) {
              errorDataset.push(" Table Name  Max of 255 characters  ");
            }
          }
          if (helper.stringToBoolean(data.incremental)) {
            if (!data.offsetColumn) {
              errorDataset.push(
                " offsetColumn  is required and data type should be string "
              );
            }
          }
        }
      }
    }

    if (errorDataset.length > 0) {
      errorDataset.splice(0, 0, `DataSet External Id -${externalID} `);
      return { sucRes: dataset_update, errRes: errorDataset };
    }

    let sqlQuery = custSql;
    if (data.customQuery) {
      if (data.customQuery.toLowerCase() === "no") {
        if (data.columnDefinition?.length > 0) {
          const cList = data.columnDefinition.map(
            (el) => el.name || el.columnName
          );
          sqlQuery = helper.createCustomSql(
            cList,
            data.tableName,
            data.conditionalExpression
          );
        }
      } else {
        sqlQuery = data.customSql;
      }
    }

    let updateQueryDS = `UPDATE ${schemaName}.dataset set updt_tm=NOW() `;

    if (data.dataKind) {
      updateQueryDS += `,datakindid='${dataKi_Id}'`;
    }
    if (data.mnemonic) {
      updateQueryDS += `,mnemonic='${data.mnemonic}'`;
    }
    if (data.name) {
      updateQueryDS += `,name='${data.name}'`;
    }
    if (data.columnCount) {
      updateQueryDS += `,columncount='${data.columnCount}'`;
    }
    if (data.incremental) {
      updateQueryDS += `,incremental='${
        helper.stringToBoolean(data.incremental) ? "Y" : "N"
      }'`;
    }
    if (data.offsetColumn) {
      updateQueryDS += `,offsetcolumn='${data.offsetColumn}'`;
    }
    if (data.type) {
      updateQueryDS += `,type='${data.type}'`;
    }
    if (data.path) {
      updateQueryDS += `,path='${data.path}'`;
    }
    if (data.OverrideStaleAlert) {
      updateQueryDS += `,ovrd_stale_alert='${data.OverrideStaleAlert}'`;
    }
    if (data.headerRowNumber) {
      updateQueryDS += `,headerrow='${data.headerRowNumber}'`;
      updateQueryDS += `,headerrownumber='${data.headerRowNumber}'`;
    }
    if (data.footerRowNumber) {
      updateQueryDS += `,footerrow='${data.footerRowNumber}'`;
      updateQueryDS += `,footerrownumber='${data.footerRowNumber}'`;
    }
    if (data.customSql) {
      updateQueryDS += `,customsql='${sqlQuery}'`;
    }

    if (data.customQuery) {
      updateQueryDS += `,customsql_yn='${data.customQuery}'`;
    }
    if (data.tableName) {
      updateQueryDS += `,tbl_nm='${data.tableName}'`;
    }
    if (data.delimiter) {
      updateQueryDS += `,delimiter='${data.delimiter}'`;
    }
    if (data.escapeCode) {
      updateQueryDS += `,escapecode='${helper.convertEscapeChar(
        data.escapeCode
      )}'`;
    }
    if (data.quote) {
      updateQueryDS += `,quote='${data.quote}'`;
    }
    if (data.rowDecreaseAllowed) {
      updateQueryDS += `,rowdecreaseallowed='${data.rowDecreaseAllowed}'`;
    }
    if (data.dataTransferFrequency) {
      updateQueryDS += `,data_freq='${data.dataTransferFrequency}'`;
    }

    updateQueryDS += ` where externalid='${externalID}' returning *;`;

    // console.log(updateQueryDS);

    const { rows: existDSRows } = await DB.executeQuery(
      `SELECT datakindid , mnemonic, name, columncount, incremental, offsetcolumn , type, 
       path, ovrd_stale_alert ,headerrow , headerrownumber ,footerrow , footerrownumber ,
       customsql ,customsql_yn , tbl_nm , delimiter, escapecode ,quote, 
       rowdecreaseallowed , data_freq from ${schemaName}.dataset where externalid='${externalID}';`
    );

    const existDs = existDSRows[0];
    const dataSetupdate = await DB.executeQuery(updateQueryDS);
    const dataSetObj = dataSetupdate.rows[0];
    const diffObj = helper.getdiffKeys(existDs, dataSetObj);

    // console.log("dada", diffObj);

    for (let key of Object.keys(diffObj)) {
      let oldData = diffObj[key];
      let newData = dataSetObj[key];
      await DB.executeQuery(
        `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
        [
          DFId,
          DPId,
          DSId,
          null,
          version,
          key,
          oldData,
          newData,
          externalSysName,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return { sucRes: dataset_update, errRes: errorDataset };
    } else {
      newObj.externalId = externalID;
      newObj.dataSetid = DSId;
      newObj.action = "Data Set update successfully.";
      newObj.timestamp = ts;
      dataset_update.push(newObj);

      return { sucRes: dataset_update, errRes: errorDataset };
    }
  } catch (e) {
    console.log(e);
    Logger.error("catch :Data set update");
    Logger.error(e);
  }
};

const columnUpdate = async (data, externalID, DFId, version) => {};
