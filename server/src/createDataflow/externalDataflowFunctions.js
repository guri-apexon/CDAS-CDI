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
  var str1 = /[~]/;
  var str2 = /[.]/;
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
    { key: "location ", value: req.location, type: "string" },

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
  if (req.del_flg !== 0) {
    validate.push({
      err: " Data flow Level del_flg required and value should be 0 ",
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
        if (each.del_flg !== 0) {
          validate.push({
            err: " Data Package Level del_flg required and value should be 0 ",
          });
        }
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
                {
                  key: "Package Naming Convention",
                  value: each.name,
                  type: "string",
                },
                {
                  key: "Package Path  ",
                  value: each.path,
                  type: "string",
                },
              ];

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

            if (each.name && each.type) {
              const name = each.name.split(".")[1];

              // if (each.type.toLowerCase() === "rar") {
              //   if (name.toLowerCase() !== "rar") {
              //     validate.push({
              //       err: " If Package type is RAR then package naming convention should be end with (.rar) ",
              //     });
              //   }
              // }

              // if (each.type.toLowerCase() === "7z") {
              //   if (name.toLowerCase() !== "7z") {
              //     validate.push({
              //       err: " If Package type is 7z then package naming convention should be end with (.7z) ",
              //     });
              //   }
              // }

              // if (each.type.toLowerCase() === "zip") {
              //   if (name.toLowerCase() !== "zip") {
              //     validate.push({
              //       err: " If Package type is Zip then package naming convention should be end with (.zip) ",
              //     });
              //   }
              // }

              // if (each.type.toLowerCase() === "sas") {
              //   if (name.toLowerCase() !== "xpt") {
              //     validate.push({
              //       err: " If Package type is SAS then package naming convention should be end with (.xpt) ",
              //     });
              //   }
              // }

              const last = each.name.charAt(each.name.length - 1);
              const first = each.name.charAt(each.name.charAt(0));
              if (str2.test(each.name) === false) {
                validate.push({
                  err: " package naming convention should be end with dot Extension ",
                });
              } else {
                if (last === "." || first === ".") {
                  validate.push({
                    err: " Dot(.) can't be used start or end of string ",
                  });
                }
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

                  if (obj.del_flg !== 0) {
                    validate.push({
                      err: " Data Set Level del_flg required and value should be 0 ",
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
                    {
                      key: "columnCount",
                      value: obj.columnCount,
                      type: "number",
                    },
                  ];

                  // point - 28 story - 7277
                  // if (obj.columnCount === 0) {
                  //   validate.push({
                  //     err: " columnCount must be greater than zero ",
                  //   });
                  // }

                  if (obj.name) {
                    const last = obj.name.charAt(obj.name.length - 1);
                    const first = obj.name.charAt(obj.name.charAt(0));
                    if (str2.test(obj.name) === false) {
                      validate.push({
                        err: " File Naming Convention should be end with dot Extension ",
                      });
                    } else {
                      if (last === "." || first === ".") {
                        validate.push({
                          err: " Dot(.) can't be used start or end of string ",
                        });
                      }
                    }
                  }

                  if (obj.dataTransferFrequency === 0) {
                    validate.push({
                      err: " dataTransferFrequency must be greater than zero ",
                    });
                  }

                  if (obj.headerRowNumber) {
                    if (typeof obj.headerRowNumber != "number") {
                      validate.push({
                        err: " In SFTP/FTPS headerRowNumber is Optional and data type should be Number ",
                      });
                    }
                  }

                  if (obj.footerRowNumber) {
                    if (typeof obj.footerRowNumber != "number") {
                      validate.push({
                        err: " In SFTP/FTPS footerRowNumber is Optional and data type should be Number ",
                      });
                    }
                  }

                  if (obj.OverrideStaleAlert) {
                    if (typeof obj.OverrideStaleAlert != "number") {
                      validate.push({
                        err: " In SFTP/FTPS OverrideStaleAlert is Optional and data type should be Number ",
                      });
                    }
                  }

                  if (
                    obj.customQuery ||
                    obj.customQuery === 0 ||
                    obj.incremental === 0 ||
                    obj.customSql ||
                    obj.conditionalExpression ||
                    obj.incremental ||
                    obj.offsetColumn
                  ) {
                    validate.push({
                      err: " In SFTP/FTPS customQuery, customSQL, conditionalExpression, incremental, offsetColumn should be blank ",
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
                        if (
                          el.externalID === null ||
                          el.externalID === "" ||
                          el.externalID === undefined
                        ) {
                          validate.push({
                            err: " Column Definition Level, External Id  is required and data type should be string or Number ",
                          });
                        }

                        if (el.del_flg !== 0) {
                          validate.push({
                            err: " Column Definition Level del_flg required and value should be 0 ",
                          });
                        }

                        const clArray = [
                          {
                            key: "Column Name or Designator ",
                            value: el.name,
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
                            key: "Alphanumeric, Numeric or Date",
                            value: el.dataType,
                            type: "string",
                          },
                        ];

                        if (!helper.isColumnType(el.dataType)) {
                          validate.push({
                            err: " Data type's Supported values : Numeric, Alphanumeric or Date",
                          });
                        }

                        // Validation Function call for column defination
                        let clRes = helper.validation(clArray);
                        if (clRes.length > 0) {
                          validate.push(clRes);
                        }

                        if (el.characterMin) {
                          if (typeof el.characterMin != "number") {
                            validate.push({
                              err: " In SFTP/FTPS characterMin is Optional and data type should be Number ",
                            });
                          }
                        }

                        if (el.characterMax) {
                          if (typeof el.characterMax != "number") {
                            validate.push({
                              err: " In SFTP/FTPS characterMax is Optional and data type should be Number ",
                            });
                          }
                        }
                        if (el.characterMin) {
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
                        if (el.lov) {
                          const last = el.lov.charAt(el.lov.length - 1);
                          const first = el.lov.charAt(el.lov.charAt(0));

                          if (str1.test(el.lov) === false) {
                            validate.push({
                              err: " LOV should be seperated by tilde(~) ",
                            });
                          } else {
                            if (last === "~" || first === "~") {
                              validate.push({
                                err: " Tilde(~) can't be used start or end of string ",
                              });
                            }
                          }
                        }
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

                if (obj.del_flg !== 0) {
                  validate.push({
                    err: " Data Set Level del_flg required and value should be 0 ",
                  });
                }

                if (
                  obj.type ||
                  obj.name ||
                  obj.delimiter ||
                  obj.quote ||
                  obj.rowDecreaseAllowed ||
                  obj.rowDecreaseAllowed === 0 ||
                  obj.dataTransferFrequency === 0 ||
                  obj.dataTransferFrequency ||
                  obj.headerRowNumber ||
                  obj.footerRowNumber ||
                  obj.OverrideStaleAlert ||
                  obj.headerRowNumber === 0 ||
                  obj.footerRowNumber === 0 ||
                  obj.OverrideStaleAlert === 0 ||
                  obj.escapeCode ||
                  obj.path
                ) {
                  validate.push({
                    err: " In JDBC Data Set Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, escapeCode, path, headerRowNumber, footerRowNumber, OverrideStaleAlert should be blank ",
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
                  {
                    key: "columnCount",
                    value: obj.columnCount,
                    type: "number",
                  },
                ];

                // point - 28 story - 7277
                // if (obj.columnCount === 0) {
                //   validate.push({
                //     err: " columnCount must be greater than zero ",
                //   });
                // }

                if (obj.customQuery.toLowerCase() == "yes") {
                  if (
                    obj.customSql !== null &&
                    obj.customSql !== "" &&
                    obj.customSql !== undefined
                  ) {
                    if (obj.customSql.length <= 131072) {
                    } else {
                      validate.push({
                        err: " Custom Sql  Max of 131072 characters  ",
                      });
                    }
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
                      if (
                        el.externalID === null ||
                        el.externalID === "" ||
                        el.externalID === undefined
                      ) {
                        validate.push({
                          err: " Column Definition Level, External Id  is required and data type should be string or Number ",
                        });
                      }

                      if (el.del_flg !== 0) {
                        validate.push({
                          err: " Column Definition Level del_flg required and value should be 0 ",
                        });
                      }

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
                          key: "Alphanumeric, Numeric or Date",
                          value: el.dataType,
                          type: "string",
                        },
                      ];

                      if (!helper.isColumnType(el.dataType)) {
                        validate.push({
                          err: " Data type's Supported values : Numeric, Alphanumeric or Date",
                        });
                      }

                      // Validation Function call for column defination
                      let clRes = helper.validation(clArray);
                      if (clRes.length > 0) {
                        validate.push(clRes);
                      }

                      if (
                        el.characterMin ||
                        el.characterMax ||
                        el.characterMin === 0 ||
                        el.characterMax === 0 ||
                        el.lov ||
                        el.position
                      ) {
                        validate.push({
                          err: " In JDBC characterMin, characterMax, position, lov should be blank ",
                        });
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
    var str1 = /[~]/;
    var str2 = /[.]/;

    if (helper.isSftp(LocationType)) {
      // if (LocationType === "MySQL") {
      if (data.del_flg !== 0) {
        errorPackage.push(
          " Data Package Level del_flg required and value should be 0 "
        );
      }

      const dpArray = [
        {
          key: "No Package Level Config ",
          value: data.noPackageConfig,
          type: "boolean",
        },

        {
          key: "active",
          value: data.active,
          type: "boolean",
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
          {
            key: "Package Naming Convention",
            value: data.name,
            type: "string",
          },
          {
            key: "Package Path  ",
            value: data.path,
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

      if (data.name && data.type) {
        const name = data.name.split(".")[1];
        // if (data.type.toLowerCase() === "rar") {
        //   if (name.toLowerCase() !== "rar") {
        //     errorPackage.push(
        //       " If Package type is RAR then package naming convention should be end with (.rar) "
        //     );
        //   }
        // }

        // if (data.type.toLowerCase() === "7z") {
        //   if (name.toLowerCase() !== "7z") {
        //     errorPackage.push(
        //       " If Package type is 7z then package naming convention should be end with (.7z) "
        //     );
        //   }
        // }

        // if (data.type.toLowerCase() === "zip") {
        //   if (name.toLowerCase() !== "zip") {
        //     errorPackage.push(
        //       " If Package type is Zip then package naming convention should be end with (.zip) "
        //     );
        //   }
        // }

        // if (data.type.toLowerCase() === "sas") {
        //   if (name.toLowerCase() !== "xpt") {
        //     errorPackage.push(
        //       " If Package type is SAS then package naming convention should be end with (.xpt) "
        //     );
        //   }
        // }

        const last = data.name.charAt(data.name.length - 1);
        const first = data.name.charAt(data.name.charAt(0));
        if (str2.test(data.name) === false) {
          errorPackage.push(
            " package naming convention should be end with dot Extension "
          );
        } else {
          if (last === "." || first === ".") {
            errorPackage.push(" Dot(.) can't be used start or end of string ");
          }
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
      if (data.del_flg !== 0) {
        errorPackage.push(
          " Data Package Level del_flg required and value should be 0 "
        );
      }
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
        const dataSetExternalId = obj.externalID;
        await saveDataset(
          obj,
          dataSetExternalId,
          dpUid,
          DFId,
          version,
          ConnectionType,
          externalSysName
        ).then((res) => {
          errorPackage.push(res.errRes);
          dataPackage.push(res.sucRes);
        });
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

const saveDataset = (exports.datasetLevelInsert = async (
  obj,
  externalID,
  DPId,
  DFId,
  version,
  ConnectionType,
  externalSysName,
  testFlag
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorDataset = [];
    var dataSet = [];
    var str1 = /[~]/;
    var str2 = /[.]/;

    if (helper.isSftp(LocationType)) {
      // if (LocationType == "Hive CDH") {
      if (obj.del_flg !== 0) {
        errorDataset.push(
          " Data Set Level del_flg required and value should be 0 "
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
          key: "columnCount",
          value: obj.columnCount,
          type: "number",
        },
      ];

      // point - 28 story - 7277
      // if (obj.columnCount === 0) {
      //   errorDataset.push("columnCount must be greater than zero");
      // }

      if (obj.dataTransferFrequency === 0) {
        errorDataset.push("dataTransferFrequency must be greater than zero");
      }

      if (obj.name) {
        const last = obj.name.charAt(obj.name.length - 1);
        const first = obj.name.charAt(obj.name.charAt(0));
        if (str2.test(obj.name) === false) {
          errorDataset.push(
            " File Naming Convention should be end with dot Extension "
          );
        } else {
          if (last === "." || first === ".") {
            errorDataset.push(" Dot(.) can't be used start or end of string ");
          }
        }
      }

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

      if (obj.headerRowNumber) {
        if (typeof obj.headerRowNumber != "number") {
          errorDataset.push(
            " In SFTP/FTPS headerRowNumber is Optional and data type should be Number "
          );
        }
      }

      if (obj.footerRowNumber) {
        if (typeof obj.footerRowNumber != "number") {
          errorDataset.push(
            " In SFTP/FTPS footerRowNumber is Optional and data type should be Number "
          );
        }
      }

      if (obj.OverrideStaleAlert) {
        if (typeof obj.OverrideStaleAlert != "number") {
          errorDataset.push(
            " In SFTP/FTPS OverrideStaleAlert is Optional and data type should be Number "
          );
        }
      }

      if (
        obj.customQuery ||
        obj.customQuery === 0 ||
        obj.customSql ||
        obj.incremental ||
        obj.incremental === 0 ||
        obj.conditionalExpression ||
        obj.offsetColumn
      ) {
        errorDataset.push(
          "For SFTP/FTPS customQuery, customSql, incremental, conditionalExpression, offsetColumn fields should be Blank "
        );
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
        obj.headerRowNumber ||
        obj.footerRowNumber ||
        obj.OverrideStaleAlert ||
        obj.rowDecreaseAllowed === 0 ||
        obj.dataTransferFrequency === 0 ||
        obj.headerRowNumber === 0 ||
        obj.footerRowNumber === 0 ||
        obj.OverrideStaleAlert === 0 ||
        obj.path ||
        obj.escapeCode
      ) {
        errorDataset.push(
          " In JDBC Dataset Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, Path, escapeCode, headerRowNumber, footerRowNumber, OverrideStaleAlert should be Blank "
        );
      }

      if (obj.del_flg !== 0) {
        errorDataset.push(
          " Data Set Level del_flg required and value should be 0 "
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
          key: "columnCount",
          value: obj.columnCount,
          type: "number",
        },
      ];

      // point - 28 story - 7277
      // if (obj.columnCount === 0) {
      //   errorDataset.push("columnCount must be greater than zero");
      // }

      const dsreqElse = helper.validation(dsElse);

      if (dsreqElse.length > 0) {
        errorDataset.push(dsreqElse);
      }

      if (obj.customQuery.toLowerCase() == "yes") {
        if (!obj.customSql) {
          errorDataset.push(" Custom Sql  is required  ");
        } else {
          if (obj.customSql.length >= 131072) {
            errorDataset.push(" Custom Sql  Max of 131072 characters  ");
          }
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

    let dsObj = {};

    let dataKind = null;
    if (obj.dataKind) {
      let checkDataKind = await DB.executeQuery(
        `select datakindid,active from ${schemaName}.datakind where name='${obj.dataKind}';`
      );

      if (checkDataKind.rows.length > 0) {
        if (checkDataKind.rows[0].active === 1) {
          dataKind = checkDataKind.rows[0].datakindid;
        } else {
          errorDataset.push(
            `Clinical Data Type is inactive from ${externalSysName}, Description in TA cannot be integrated.`
          );
        }
      } else {
        errorDataset.push(
          `Clinical Data Type is missing from ${externalSysName}, Description in TA cannot be integrated.`
        );
      }
    }

    if (obj.mnemonic) {
      const tFlg = helper.stringToBoolean(testFlag) ? 1 : 0;
      let selectMnemonic = `select ds.mnemonic from ${schemaName}.dataset ds
                left join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
                left join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
                where ds.mnemonic ='${obj.mnemonic}' and df.testflag ='${tFlg}'`;

      let queryMnemonic = await DB.executeQuery(selectMnemonic);

      if (queryMnemonic.rows.length > 0) {
        errorDataset.push(
          "In this environment this mnemonic name already Exist!"
        );
      }
    }

    if (errorDataset.length > 0) {
      errorDataset.splice(0, 0, `DataSet External Id -${externalID} `);
      return { sucRes: dataSet, errRes: errorDataset };
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
        if (el.del_flg !== 0) {
          errorDataset.push(
            " Column Definition Level del_flg required and value should be 0 "
          );
        }

        if (helper.isSftp(LocationType)) {
          const clArrayIf = [
            {
              key: "Column Name or Designator ",
              value: el.name,
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
              key: "Alphanumeric, Numeric or Date",
              value: el.dataType,
              type: "string",
            },
          ];

          if (!helper.isColumnType(el.dataType)) {
            errorDataset.push(
              " Data type's Supported values : Numeric, Alphanumeric or Date"
            );
          }

          let clResIf = helper.validation(clArrayIf);
          if (clResIf.length > 0) {
            errorDataset.push(clResIf);
          }

          if (el.characterMin) {
            if (typeof el.characterMin != "number") {
              errorDataset.push(
                " In SFTP/FTPS characterMin is Optional and data type should be Number"
              );
            }
          }

          if (el.characterMax) {
            if (typeof el.characterMax != "number") {
              errorDataset.push(
                " In SFTP/FTPS characterMax is Optional and data type should be Number"
              );
            }
          }

          if (el.characterMin) {
            if (
              typeof el.characterMin != "undefined" &&
              typeof el.characterMax != "undefined"
            ) {
              if (el.characterMin >= el.characterMax) {
                errorDataset.push(
                  "MinCharacter always less than MaxCharacter "
                );
              }
            }
          }

          if (el.lov) {
            const last = el.lov.charAt(el.lov.length - 1);
            const first = el.lov.charAt(el.lov.charAt(0));

            if (str1.test(el.lov) === false) {
              errorDataset.push(" LOV should be seperated by tilde(~) ");
            } else {
              if (last === "~" || first === "~") {
                errorDataset.push(
                  " Tilde(~) can't be used start or end of string "
                );
              }
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
            {
              key: "Alphanumeric, Numeric or Date",
              value: el.dataType,
              type: "string",
            },
          ];

          if (!helper.isColumnType(el.dataType)) {
            errorDataset.push(
              " Data type's Supported values : Numeric, Alphanumeric or Date"
            );
          }

          let clRes = helper.validation(clArray);
          if (clRes.length > 0) {
            errorDataset.push(clRes);
          }

          if (
            el.characterMin ||
            el.characterMin === 0 ||
            el.characterMax ||
            el.characterMax === 0 ||
            el.lov ||
            el.position
          ) {
            // console.log(val.key, val.value);
            errorDataset.push(
              "For JBDC characterMin, characterMax, lov, position fields should be Blank "
            );
          }
        }

        // Column def Name check
        if (el.name) {
          let clName = await DB.executeQuery(
            `select name from ${schemaName}.columndefinition where datasetid='${dsUid}' and name='${el.name}';`
          );
          if (clName.rows.length > 0) {
            errorDataset.push(" This Column Definition Name already exist!");
          }
        }

        if (errorDataset.length > 0) {
          errorDataset.splice(
            0,
            0,
            `Column definition External Id -${el.externalID} `
          );
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
          el.externalID || null,
        ];
        await DB.executeQuery(
          `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                  primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                  insrt_tm, updt_tm,externalid) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14,$15);`,
          CDBody
        );

        // column count update
        const clDefCount = `select  count(*) from ${schemaName}.columndefinition where datasetid ='${dsUid}'`;
        const Count = await DB.executeQuery(clDefCount);

        const dsCountUpdate = `update ${schemaName}.dataset set columncount='${Count.rows[0].count}' where datasetid ='${dsUid}'`;
        const clCountUpdate = await DB.executeQuery(dsCountUpdate);

        cdObj.colmunid = CDUid;
        cdObj.externalId = el.externalID;
        cdObj.action = "column definition created successfully.";
        cdObj.timestamp = ts;
        dataSet.push(cdObj);

        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_audit_log
                      ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
          [
            DFId,
            DPId,
            dsUid,
            CDUid,
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
});

exports.columnDefinationInsert = async (
  el,
  cdExternalId,
  DPId,
  DFId,
  DSId,
  version,
  ConnectionType,
  externalSysName
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorColumnDef = [];
    var ColumnDef = [];
    var str1 = /[~]/;

    if (el.del_flg !== 0) {
      errorColumnDef.push(
        " Column Definition Level del_flg required and value should be 0 "
      );
    }

    if (helper.isSftp(LocationType)) {
      const clArrayIf = [
        {
          key: "Column Name or Designator ",
          value: el.name,
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
          key: "Alphanumeric, Numeric or Date",
          value: el.dataType,
          type: "string",
        },
      ];

      if (!helper.isColumnType(el.dataType)) {
        errorColumnDef.push(
          " Data type's Supported values : Numeric, Alphanumeric or Date"
        );
      }

      let clResIf = helper.validation(clArrayIf);
      if (clResIf.length > 0) {
        errorColumnDef.push(clResIf);
      }

      if (el.characterMin) {
        if (typeof el.characterMin != "number") {
          errorColumnDef.push(
            " In SFTP/FTPS characterMin is Optional and data type should be Number"
          );
        }
      }

      if (el.characterMax) {
        if (typeof el.characterMax != "number") {
          errorColumnDef.push(
            " In SFTP/FTPS characterMax is Optional and data type should be Number"
          );
        }
      }

      if (el.characterMin) {
        if (
          typeof el.characterMin != "undefined" &&
          typeof el.characterMax != "undefined"
        ) {
          if (el.characterMin >= el.characterMax) {
            errorColumnDef.push("MinCharacter always less than MaxCharacter ");
          }
        }
      }

      if (el.lov) {
        const last = el.lov.charAt(el.lov.length - 1);
        const first = el.lov.charAt(el.lov.charAt(0));

        if (str1.test(el.lov) === false) {
          errorColumnDef.push(" LOV should be seperated by tilde(~) ");
        } else {
          if (last === "~" || first === "~") {
            errorColumnDef.push(
              " Tilde(~) can't be used start or end of string "
            );
          }
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
        {
          key: "Alphanumeric, Numeric or Date",
          value: el.dataType,
          type: "string",
        },
      ];

      if (!helper.isColumnType(el.dataType)) {
        errorColumnDef.push(
          " Data type's Supported values : Numeric, Alphanumeric or Date"
        );
      }

      let clRes = helper.validation(clArray);
      if (clRes.length > 0) {
        errorColumnDef.push(clRes);
      }

      if (
        el.characterMin ||
        el.characterMin === 0 ||
        el.characterMax ||
        el.characterMax === 0 ||
        el.lov ||
        el.position
      ) {
        // console.log(val.key, val.value);
        errorColumnDef.push(
          "For JBDC characterMin, characterMax, lov, position fields should be Blank "
        );
      }
    }

    // Column Def Name check
    if (el.name) {
      let clName = await DB.executeQuery(
        `select name from ${schemaName}.columndefinition where datasetid='${DSId}' and name='${el.name}';`
      );
      if (clName.rows.length > 0) {
        errorColumnDef.push(" This Column Definition Name already exist!");
      }
    }

    if (errorColumnDef.length > 0) {
      errorColumnDef.splice(
        0,
        0,
        `Column definition External Id -${cdExternalId} `
      );
      return { sucRes: ColumnDef, errRes: errorColumnDef };
    }

    let cdObj = {};
    const CDUid = createUniqueID();

    let CDBody = [
      DSId,
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
      el.externalID || null,
    ];
    await DB.executeQuery(
      `insert into ${schemaName}.columndefinition(datasetid,columnid,name,datatype,
                  primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
                  insrt_tm, updt_tm, externalid) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14, $15);`,
      CDBody
    );

    const clDefCount = `select  count(*) from ${schemaName}.columndefinition where datasetid ='${DSId}'`;
    const Count = await DB.executeQuery(clDefCount);

    const dsCountUpdate = `update ${schemaName}.dataset set columncount='${Count.rows[0].count}' where datasetid ='${DSId}'`;
    const clCountUpdate = await DB.executeQuery(dsCountUpdate);

    cdObj.colmunid = CDUid;
    cdObj.externalId = cdExternalId;
    cdObj.action = "column definition created successfully.";
    cdObj.timestamp = ts;
    ColumnDef.push(cdObj);

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
                      ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        DFId,
        DPId,
        DSId,
        CDUid,
        version,
        "New Column Definition",
        "",
        "",
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: ColumnDef, errRes: errorColumnDef };
  } catch (e) {
    console.log(e);
    Logger.error("catch :New Column def add");
    Logger.error(e);
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
    let loc_id;
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

    if (data.location) {
      let q5 = `select src_loc_id from ${schemaName}.source_location where cnn_url='${data.location}';`;
      let { rows: srcId } = await DB.executeQuery(q5);
      loc_id = srcId[0].src_loc_id;
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
    if (typeof data.testFlag != "undefined") {
      updateQueryDF += `,testflag=${
        helper.stringToBoolean(data.testFlag) ? 1 : 0
      }`;
    }
    if (typeof data.active != "undefined") {
      updateQueryDF += `,active=${helper.stringToBoolean(data.active) ? 1 : 0}`;
    }
    if (data.protocolNumberStandard) {
      updateQueryDF += ` ,prot_id='${studyId}'`;
    }
    if (data.vendorName) {
      updateQueryDF += ` ,vend_id= '${vendorId}'`;
    }
    if (data.location) {
      updateQueryDF += ` ,src_loc_id= '${loc_id}'`;
    }
    if (data.protocolNumberStandard || data.type || data.vendorName) {
      updateQueryDF += `,name='${DFTestname}'`;
    }

    updateQueryDF += ` where externalid='${externalID}' returning *;`;
    // console.log(updateQueryDF);

    const { rows: existDfRows } = await DB.executeQuery(
      `SELECT type, description,src_loc_id, externalsystemname , expt_fst_prd_dt ,
       testflag , active, prot_id , vend_id , name
       from ${schemaName}.dataflow where externalsystemname='${externalSysName}' and externalid='${externalID}';`
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
      newDfobj.dataFlowId = DFId;
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
    var str1 = /[~]/;
    var str2 = /[.]/;

    if (helper.isSftp(LocationType)) {
      // if (LocationType == "Hive CDH") {

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

        TypeSas.push({
          key: "Package type",
          value: data.type,
          type: "string",
        });

        TypeSas.push({
          key: "sasXptMethod",
          value: data.sasXptMethod,
          type: "string",
        });

        TypeSas.push({
          key: "name",
          value: data.name,
          type: "string",
        });

        TypeSas.push({
          key: "path",
          value: data.path,
          type: "string",
        });

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

      if (typeof data.name != "undefined") {
        const last = data.name.charAt(data.name.length - 1);
        const first = data.name.charAt(data.name.charAt(0));
        if (str2.test(data.name) === false) {
          errorPackage.push(
            " package naming convention should be end with dot Extension "
          );
        } else {
          if (last === "." || first === ".") {
            errorPackage.push(" Dot(.) can't be used start or end of string ");
          }
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

    if (typeof data.noPackageConfig != "undefined") {
      updateQueryDP += `, nopackageconfig='
      ${helper.stringToBoolean(data.noPackageConfig) ? 1 : 0}'`;
    }
    updateQueryDP += ` where externalid='${externalID}' returning *;`;

    const { rows: existDPRows } = await DB.executeQuery(
      `SELECT type, name, path, sasxptmethod ,password, nopackageconfig 
       from ${schemaName}.datapackage where dataflowid='${DFId}' and externalid='${externalID}';`
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
  externalSysName,
  testFlag
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    var dataset_update = [];
    var newObj = {};
    const valDataset = [];
    var dataKi_Id;
    let errorDataset = [];
    var str2 = /[.]/;

    if (data.dataKind) {
      let checkDataKind = await DB.executeQuery(
        `select datakindid,active from ${schemaName}.datakind where name='${data.dataKind}';`
      );

      if (checkDataKind.rows.length > 0) {
        if (checkDataKind.rows[0].active === 0) {
          dataKi_Id = checkDataKind.rows[0].datakindid;
        } else {
          errorDataset.push(
            `Clinical Data Type is inactive from ${externalSysName}, Description in TA cannot be integrated.`
          );
        }
      } else {
        errorDataset.push(
          `Clinical Data Type is missing from ${externalSysName}, Description in TA cannot be integrated.`
        );
      }
    }

    if (data.mnemonic) {
      const tFlg = helper.stringToBoolean(testFlag) ? 1 : 0;
      let selectMnemonic = `select ds.mnemonic from ${schemaName}.dataset ds
                left join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
                left join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
                where ds.mnemonic ='${data.mnemonic}' and df.testflag ='${tFlg}'`;

      let queryMnemonic = await DB.executeQuery(selectMnemonic);

      if (queryMnemonic.rows.length > 0) {
        errorDataset.push(
          "In this environment this mnemonic name already Exist!"
        );
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

        if (data.name) {
          const last = data.name.charAt(data.name.length - 1);
          const first = data.name.charAt(data.name.charAt(0));
          if (str2.test(data.name) === false) {
            errorDataset.push(
              " File Naming Convention should be end with dot Extension "
            );
          } else {
            if (last === "." || first === ".") {
              errorDataset.push(
                " Dot(.) can't be used start or end of string "
              );
            }
          }
        }
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

        if (data.dataTransferFrequency === 0) {
          errorDataset.push(
            "dataTransferFrequency nmust be greater than zero "
          );
        }
      }
      if (typeof data.columnCount != "undefined") {
        valDataset.push({
          key: "columnCount ",
          value: data.columnCount,
          type: "number",
        });
        // point - 28 story - 7277
        // if (data.columnCount === 0) {
        //   errorDataset.push("columnCount must be greater than zero ");
        // }
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

      if (data.headerRowNumber) {
        if (typeof data.headerRowNumber != "number") {
          errorDataset.push(
            " In SFTP/FTPS headerRowNumber is Optional and data type should be Number "
          );
        }
      }

      if (data.footerRowNumber) {
        if (typeof data.footerRowNumber != "number") {
          errorDataset.push(
            " In SFTP/FTPS footerRowNumber is Optional and data type should be Number "
          );
        }
      }

      if (data.OverrideStaleAlert) {
        if (typeof data.OverrideStaleAlert != "number") {
          errorDataset.push(
            " In SFTP/FTPS OverrideStaleAlert is Optional and data type should be Number "
          );
        }
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
        data.customQuery === 0 ||
        data.customSql ||
        data.incremental ||
        data.incremental === 0 ||
        data.conditionalExpression ||
        data.offsetColumn
      ) {
        errorDataset.push(
          " For SFTP/FTPS, customQuery, customSql incremental, conditionalExpression, offsetColumn fields should be Blank "
        );
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
      if (typeof data.columnCount != "undefined") {
        valDataset.push({
          key: "columnCount ",
          value: data.columnCount,
          type: "number",
        });

        if (data.columnCount === 0) {
          errorDataset.push("columnCount not equal to zero ");
        }
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
        data.rowDecreaseAllowed === 0 ||
        data.dataTransferFrequency === 0 ||
        data.dataTransferFrequency ||
        data.headerRowNumber ||
        data.footerRowNumber ||
        data.OverrideStaleAlert ||
        data.headerRowNumber === 0 ||
        data.footerRowNumber === 0 ||
        data.OverrideStaleAlert === 0 ||
        data.path ||
        data.escapeCode
      ) {
        errorDataset.push(
          " In JDBC Dataset Level type, name, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, Path, escapeCode, headerRowNumber, footerRowNumber, OverrideStaleAlert should be Blank "
        );
      }

      if (data.customQuery) {
        if (helper.stringToBoolean(data.customQuery)) {
          if (!data.customSql) {
            errorDataset.push(" Custom Sql  is required  ");
          } else {
            if (data.customSql.length >= 131072) {
              errorDataset.push(" Custom Sql  Max of 131072 characters ");
            }
          }
        }
        if (!helper.stringToBoolean(data.customQuery)) {
          if (!data.tableName) {
            errorDataset.push(" Table Name  is required  ");
          } else {
            if (data.tableName.length >= 255) {
              errorDataset.push(" Table Name  Max of 255 characters  ");
            }
          }
          if (typeof data.incremental != "undefined") {
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
    }

    if (errorDataset.length > 0) {
      errorDataset.splice(0, 0, `DataSet External Id -${externalID} `);
      return { sucRes: dataset_update, errRes: errorDataset };
    }

    let sqlQuery = custSql;
    if (data.customQuery) {
      if (!helper.stringToBoolean(data.customQuery)) {
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
    if (typeof data.incremental != "undefined") {
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

    if (typeof data.customQuery != "undefined") {
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

    updateQueryDS += ` where datapackageid='${DPId}' and externalid='${externalID}' returning *;`;

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

exports.clDefUpdate = async (
  data,
  externalId,
  DSId,
  DPId,
  DFId,
  cdId,
  version,
  ConnectionType,
  externalSysName
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    var colDef_update = [];
    var newObj = {};
    const valColDef = [];
    let errorcolDef = [];
    var str1 = /[~]/;
    if (helper.isSftp(LocationType)) {
      // if (LocationType === "Hive CDH") {
      if (typeof data.name != "undefined") {
        valColDef.push({
          key: "name ",
          value: data.name,
          type: "string",
        });
      }
      if (typeof data.dataType != "undefined") {
        valColDef.push({
          key: "dataType ",
          value: data.dataType,
          type: "string",
        });

        if (!helper.isColumnType(data.dataType)) {
          errorcolDef.push(
            " Data type's Supported values : Numeric, Alphanumeric or Date"
          );
        }
      }
      if (data.characterMin) {
        if (typeof data.characterMin != "number") {
          errorcolDef.push(
            " In SFTP/FTPS characterMin is Optional and data type should be Number"
          );
        }
      }

      if (data.characterMax) {
        if (typeof data.characterMax != "number") {
          errorcolDef.push(
            " In SFTP/FTPS characterMax is Optional and data type should be Number"
          );
        }
      }

      if (data.characterMin) {
        if (
          typeof data.characterMin != "undefined" &&
          typeof data.characterMax != "undefined"
        ) {
          if (data.characterMin >= data.characterMax) {
            errorcolDef.push("MinCharacter always less than MaxCharacter ");
          }
        }
      }

      if (typeof data.primaryKey != "undefined") {
        valColDef.push({
          key: "primaryKey ",
          value: data.primaryKey,
          type: "boolean",
        });
      }

      if (typeof data.required != "undefined") {
        valColDef.push({
          key: "required ",
          value: data.required,
          type: "boolean",
        });
      }

      if (typeof data.unique != "undefined") {
        valColDef.push({
          key: "unique ",
          value: data.unique,
          type: "boolean",
        });
      }

      if (data.lov) {
        const last = data.lov.charAt(data.lov.length - 1);
        const first = data.lov.charAt(data.lov.charAt(0));

        if (str1.test(data.lov) === false) {
          errorcolDef.push(" LOV should be seperated by tilde(~) ");
        } else {
          if (last === "~" || first === "~") {
            errorcolDef.push(" Tilde(~) can't be used start or end of string ");
          }
        }
      }

      let colDefRes = helper.validation(valColDef);

      if (colDefRes.length > 0) {
        errorcolDef.push(colDefRes);
      }
    } else {
      if (typeof data.name != "undefined") {
        valColDef.push({
          key: "name ",
          value: data.name,
          type: "string",
        });
      }
      if (typeof data.dataType != "undefined") {
        valColDef.push({
          key: "dataType ",
          value: data.dataType,
          type: "string",
        });

        if (!helper.isColumnType(data.dataType)) {
          errorcolDef.push(
            " Data type's Supported values : Numeric, Alphanumeric or Date"
          );
        }
      }

      if (typeof data.primaryKey != "undefined") {
        valColDef.push({
          key: "primaryKey ",
          value: data.primaryKey,
          type: "boolean",
        });
      }

      if (typeof data.required != "undefined") {
        valColDef.push({
          key: "required ",
          value: data.required,
          type: "boolean",
        });
      }

      if (typeof data.unique != "undefined") {
        valColDef.push({
          key: "unique ",
          value: data.unique,
          type: "boolean",
        });
      }

      if (typeof data.includeFlag != "undefined") {
        valColDef.push({
          key: "includeFlag ",
          value: data.includeFlag,
          type: "boolean",
        });
      }

      let colDefRes = helper.validation(valColDef);

      if (colDefRes.length > 0) {
        errorcolDef.push(colDefRes);
      }

      if (
        data.characterMin ||
        data.characterMin === 0 ||
        data.characterMax ||
        data.characterMax === 0 ||
        data.lov ||
        data.position
      ) {
        errorcolDef.push(
          " For JBDC characterMin, characterMax, lov, position fields should be Blank "
        );
      }
    }

    if (data.name) {
      let clName = await DB.executeQuery(
        `select name from ${schemaName}.columndefinition where datasetid='${DSId}' and name='${data.name}';`
      );
      if (clName.rows.length > 0) {
        errorcolDef.push(" This Column Definition Name already exist!");
      }
    }

    if (errorcolDef.length > 0) {
      errorcolDef.splice(0, 0, `Column Definition Id -${externalId} `);
      return { sucRes: colDef_update, errRes: errorcolDef };
    }

    // columndefinition(datasetid,columnid,name,datatype,
    //               primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
    //               insrt_tm, updt_tm, externalid

    let updateQueryCD = `UPDATE ${schemaName}.columndefinition set updt_tm=NOW() `;

    if (data.name) {
      updateQueryCD += `,name='${data.name}'`;
    }
    if (data.dataType) {
      updateQueryCD += `,datatype='${data.dataType}'`;
    }
    if (data.characterMin) {
      updateQueryCD += `,charactermin='${data.characterMin}'`;
    }
    if (data.characterMax) {
      updateQueryCD += `,charactermax='${data.characterMax}'`;
    }
    if (typeof data.primaryKey != "undefined") {
      updateQueryCD += `,primarykey='${
        helper.stringToBoolean(data.primaryKey) ? 1 : 0
      }'`;
    }
    if (typeof data.required != "undefined") {
      updateQueryCD += `,required='${
        helper.stringToBoolean(data.required) ? 1 : 0
      }'`;
    }
    if (typeof data.unique != "undefined") {
      updateQueryCD += `,"unique"='${
        helper.stringToBoolean(data.unique) ? 1 : 0
      }'`;
    }
    if (data.position) {
      updateQueryCD += `,position='${data.position}'`;
    }
    if (data.format) {
      updateQueryCD += `,format='${data.format}'`;
    }
    if (data.lov) {
      updateQueryCD += `,lov='${data.lov}'`;
    }

    updateQueryCD += ` where datasetid='${DSId}' and externalid='${externalId}' returning *;`;

    // console.log(updateQueryCD);

    const { rows: existCDRows } = await DB.executeQuery(
      `SELECT name, datatype, charactermin,charactermax,primarykey,required,"unique",position,
      format,lov from ${schemaName}.columndefinition where externalid='${externalId}';`
    );

    const existClDef = existCDRows[0];
    const clDefUpdate = await DB.executeQuery(updateQueryCD);
    const clDefObj = clDefUpdate.rows[0];
    const diffObj = helper.getdiffKeys(existClDef, clDefObj);

    // console.log("dada", diffObj);

    for (let key of Object.keys(diffObj)) {
      let oldData = diffObj[key];
      let newData = clDefObj[key];
      await DB.executeQuery(
        `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
        [
          DFId,
          DPId,
          DSId,
          cdId,
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
      return { sucRes: colDef_update, errRes: errorcolDef };
    } else {
      newObj.externalId = externalId;
      newObj.clDefid = cdId;
      newObj.action = "Column Defination update successfully.";
      newObj.timestamp = ts;
      colDef_update.push(newObj);

      return { sucRes: colDef_update, errRes: errorcolDef };
    }
  } catch (err) {
    console.log(err);
    Logger.error("catch : Column Definition update");
    Logger.error(err);
  }
};

exports.removeDataflow = async (
  DFId,
  externalID,
  version,
  externalSysName,
  conf_data
) => {
  try {
    let ts = new Date().toLocaleString();
    var dataflow = [];
    var newDfobj = {};

    const deleteQueryDF = `update ${schemaName}.dataflow set updt_tm=NOW(),refreshtimestamp=NOW(), del_flg=1 where dataflowid='${DFId}' `;
    const removeDf = await DB.executeQuery(deleteQueryDF);

    const deleteQueryDP = `update ${schemaName}.datapackage set updt_tm=NOW(), del_flg=1 where dataflowid='${DFId}' returning datapackageid;`;
    const removeDp = await DB.executeQuery(deleteQueryDP);

    const DPID = removeDp.rows;

    for (let id of DPID) {
      const deleteQueryDS = `update ${schemaName}.dataset set updt_tm=NOW(), del_flg=1 where datapackageid='${id.datapackageid}' returning *;`;
      const removeDs = await DB.executeQuery(deleteQueryDS);
      const DSID = removeDs.rows;

      for (let ds_id of DSID) {
        const deleteQueryCD = `update ${schemaName}.columndefinition set updt_tm=NOW(), del_flg=1 where datasetid='${ds_id.datasetid}';`;
        const removeCd = await DB.executeQuery(deleteQueryCD);
      }
    }

    newDfobj.externalId = externalID;
    newDfobj.dataflowid = DFId;
    newDfobj.action = "Data Flow Removed successfully.";
    newDfobj.timestamp = ts;
    dataflow.push(newDfobj);

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
        "Remove Dataflow",
        0,
        1,
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: dataflow };
  } catch (err) {
    console.log(err);
    Logger.error("catch : DataFlow Removed");
    Logger.error(err);
  }
};

exports.removeDataPackage = async (
  externalID,
  DPID,
  DFId,
  version,
  externalSysName
) => {
  try {
    let ts = new Date().toLocaleString();
    var dataPackage = [];
    var newDfobj = {};

    const deleteQueryDP = `update ${schemaName}.datapackage set updt_tm=NOW(), del_flg=1 where datapackageid='${DPID}';`;
    const removeDp = await DB.executeQuery(deleteQueryDP);

    const deleteQueryDS = `update ${schemaName}.dataset set updt_tm=NOW(), del_flg=1 where datapackageid='${DPID}' returning *;`;
    const removeDs = await DB.executeQuery(deleteQueryDS);
    const DSID = removeDs.rows;

    for (let key of DSID) {
      const deleteQueryCD = `update ${schemaName}.columndefinition set updt_tm=NOW(), del_flg=1 where datasetid='${key.datasetid}';`;
      const removeCd = await DB.executeQuery(deleteQueryCD);
    }

    newDfobj.externalId = externalID;
    newDfobj.dataPackageId = DFId;
    newDfobj.action = "Data Package Removed successfully.";
    newDfobj.timestamp = ts;
    dataPackage.push(newDfobj);

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        DFId,
        DPID,
        null,
        null,
        version,
        "Remove DataPackage",
        0,
        1,
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: dataPackage };
  } catch (err) {
    console.log(err);
    Logger.error("catch : Data Package Removed");
    Logger.error(err);
  }
};

exports.removeDataSet = async (
  externalID,
  DPId,
  DFId,
  DSID,
  version,
  externalSysName
) => {
  try {
    let ts = new Date().toLocaleString();
    var dataSet = [];
    var newDfobj = {};

    const deleteQueryDS = `update ${schemaName}.dataset set updt_tm=NOW(), del_flg=1 where datasetid='${DSID}';`;
    const removeDs = await DB.executeQuery(deleteQueryDS);

    const deleteQueryCD = `update ${schemaName}.columndefinition set updt_tm=NOW(), del_flg=1 where datasetid='${DSID}';`;
    const removeCd = await DB.executeQuery(deleteQueryCD);

    newDfobj.externalId = externalID;
    newDfobj.dataSetid = DFId;
    newDfobj.action = "Data Set Removed successfully.";
    newDfobj.timestamp = ts;
    dataSet.push(newDfobj);

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        DFId,
        DPId,
        DSID,
        null,
        version,
        "Remove Data Set",
        0,
        1,
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: dataSet };
  } catch (err) {
    console.log(err);
    Logger.error("catch : Data Set Removed");
    Logger.error(err);
  }
};

exports.removeColumnDefination = async (
  externalID,
  dpId,
  DFId,
  dsId,
  version,
  cdId,
  externalSysName
) => {
  try {
    let ts = new Date().toLocaleString();
    var ColumnDefinition = [];
    var newDfobj = {};

    const deleteQueryCD = `update ${schemaName}.columndefinition set updt_tm=NOW(), del_flg=1 where columnid='${cdId}';`;
    const removeCd = await DB.executeQuery(deleteQueryCD);

    newDfobj.externalId = externalID;
    newDfobj.columnDefId = cdId;
    newDfobj.action = "Column Definition Removed successfully.";
    newDfobj.timestamp = ts;
    ColumnDefinition.push(newDfobj);

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      [
        DFId,
        dpId,
        dsId,
        cdId,
        version,
        "Remove Column Definition",
        0,
        1,
        externalSysName,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: ColumnDefinition };
  } catch (err) {
    console.log(err);
    Logger.error("catch : Column Def Removed ");
    Logger.error(err);
  }
};

exports.dataSetLevelRollBack = async (dfid, dpUid) => {
  try {
    const deleteLog = `delete from ${schemaName}.dataflow_audit_log where dataflowid ='${dfid}'`;
    const deleteDataset = `delete from ${schemaName}.dataset where datapackageid ='${dpUid}'`;
    const deletePackage = `delete from ${schemaName}.datapackage where dataflowid ='${dfid}'`;
    const deleteDataflow = `delete from ${schemaName}.dataflow where dataflowid ='${dfid}'`;

    const logDelete = await DB.executeQuery(deleteLog);
    const datasetDelete = await DB.executeQuery(deleteDataset);
    const packageDelete = await DB.executeQuery(deletePackage);
    const dataflowDelete = await DB.executeQuery(deleteDataflow);

    return;
  } catch (err) {
    console.log(err);
    Logger.error("catch : Data Set Level Roll Back");
    Logger.error(err);
  }
};

exports.clDefLevelRollBack = async (dfid, dpUid, dsid) => {
  try {
    const deleteLog = `delete from ${schemaName}.dataflow_audit_log where dataflowid ='${dfid}'`;
    const deleteClDef = `delete from ${schemaName}.columndefinition where datasetid ='${dsid}'`;
    const deleteDataset = `delete from ${schemaName}.dataset where datapackageid ='${dpUid}'`;
    const deletePackage = `delete from ${schemaName}.datapackage where dataflowid ='${dfid}'`;
    const deleteDataflow = `delete from ${schemaName}.dataflow where dataflowid ='${dfid}'`;

    const logDelete = await DB.executeQuery(deleteLog);
    const clDefDelete = await DB.executeQuery(deleteClDef);
    const datasetDelete = await DB.executeQuery(deleteDataset);
    const packageDelete = await DB.executeQuery(deletePackage);
    const dataflowDelete = await DB.executeQuery(deleteDataflow);

    return;
  } catch (err) {
    console.log(err);
    Logger.error("catch : column Def Level Roll Back");
    Logger.error(err);
  }
};
