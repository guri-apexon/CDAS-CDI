const DB = require("../config/db");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const { createUniqueID } = require("../helpers/customFunctions");
const { addDataflowHistory } = require("../controller/CommonController");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const apiResponse = require("../helpers/apiResponse");

const { Console } = require("winston/lib/winston/transports");
const { trim } = require("lodash");
const { DB_SCHEMA_NAME: schemaName } = constants;

const dataTyperForamtValidate = (exports.dataTyperForamtValidate = (
  dataType,
  format
) => {
  if (dataType.toLowerCase() === "alphanumeric") {
    if (helper.isAlphaNumeric(format) === false) {
      return "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend.";
    }
  }
  if (dataType.toLowerCase() === "numeric") {
    if (helper.isNumbers(format) === false) {
      return "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend.";
    }
  }
  if (dataType.toLowerCase() === "date") {
    if (helper.isValidDate(format) === false) {
      return "Data Set Column Format should have '\\ and $ are not allowed' for Date Data Type. Please amend.";
    }
  }
  return;
});

exports.namingCconventionValidate = (name) => {
  const str1 = /[\/:*?”|]/;
  const str2 = /\<(.*?)\>/g;

  const matched = name.match(str2);

  const g = name.split("<");
  const l = name.split(">");

  if (str1.test(name) === true) {
    return false;
  } else {
    if (g.length != l.length) {
      return false;
    } else {
      if (matched?.length > 0) {
        const isValid = matched.map((e) => {
          if (
            e === "<ddmmyyyy>" ||
            e === "<mmddyyyy>" ||
            e === "<mmyyyydd>" ||
            e === "<ddyyyymm>" ||
            e === "<yyyymmdd>" ||
            e === "<yyyyddmm>"
          ) {
            return true;
          } else {
            return false;
          }
        });

        return !isValid.some((res) => !res);
      }
    }
  }
  return true;
};

exports.insertValidation = async (req) => {
  var validate = [];
  var dfArray = [];
  var dfObj = {
    ExternalId: req.ExternalId,
  };
  var isval = false;
  var str1 = /[~]/;
  var str2 = /[.]/;
  // var str3 = /[< >]/;
  var str3 = /[\/:*?”<|>]/;

  var error = [];

  const Data = [
    {
      key: "protocolNumberStandard",
      value: req.protocolNumberStandard,
      type: "string",
    },
    { key: "vendorid", value: req.vendorid, type: "string" },
    { key: "dataStructure", value: req.dataStructure, type: "string" },
    { key: "locationID ", value: req.locationID, type: "string" },

    {
      key: "externalSystemName",
      value: req.externalSystemName,
      type: "string",
    },

    {
      key: "testFlag",
      value: req.testFlag,
      type: "boolean",
    },
    { key: "description", value: req.description, type: "string", length: 30 },
    {
      key: "active",
      value: req.active,
      type: "boolean",
    },
  ];

  // return;
  if (req.vendorid && req.externalSystemName) {
    let { rows: existVendor } = await DB.executeQuery(
      `select vend_id,active from ${schemaName}.vendor where UPPER(extrnl_sys_nm)='${req.externalSystemName.toUpperCase()}' and vend_id=$1;`,
      [req.vendorid]
    );
    if (existVendor.length) {
      if (existVendor[0].active !== 1) {
        dfArray.push(`Vendor is not active in ${req.externalSystemName}`);
      }
    } else {
      dfArray.push(`Vendor does not exist for ${req.externalSystemName}`);
    }
  }

  if (req.locationID && req.locationType && req.externalSystemName) {
    let locationData = await DB.executeQuery(
      `select src_loc_id,active from ${schemaName}.source_location where UPPER(extrnl_sys_nm)='${req.externalSystemName.toUpperCase()}' and UPPER(loc_typ)='${req.locationType.toUpperCase()}' and src_loc_id=$1;`,
      [req.locationID]
    );

    if (locationData.rows.length) {
      if (locationData.rows[0].active !== 1) {
        dfArray.push(`Location is not active in ${req.externalSystemName}`);
      }
    } else {
      dfArray.push(`Location does not exist for ${req.externalSystemName}`);
    }
  }

  if (req.protocolNumberStandard) {
    const studyRows = await DB.executeQuery(
      `select prot_id from study where prot_nbr_stnd ='${req.protocolNumberStandard}';`
    );
    if (!studyRows.rows.length) {
      dfArray.push("This protocol number doesn't exist");
    }
  }

  // Validating Connection Type and externalID
  var ConnectionType = req.locationType;
  const description = req.description;
  const externalID = req.ExternalId;

  if (req.exptDtOfFirstProdFile) {
    function validateDOB(date) {
      var pattern =
        /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
      if (!pattern.test(date)) {
        // errMessage += "Invalid date of birth\n";
        dfArray.push(
          "exptDtOfFirstProdFile optional and data format should be [YYYY-MM-DD HH:MI:SS]"
        );
      }
    }
    validateDOB(req.exptDtOfFirstProdFile);
  }
  if (!externalID) {
    dfArray.push(
      "externalID is required and data type should be string or number"
    );
  }
  if (req.serviceOwners) {
    if (Array.isArray(req.serviceOwners) === false)
      dfArray.push("serviceOwners its optional and it should be array");
  }
  if (!req.userId) {
    dfArray.push("userId required and data type should be string or Number");
  }
  if (req.delFlag !== 0) {
    dfArray.push("Data flow Level delFlag required and value should be 0");
  }
  if (!ConnectionType) {
    dfArray.push("locationType is required and data type should be string");
  } else {
    if (!helper.isConnectionType(ConnectionType)) {
      dfArray.push(
        "locationType supported values : SFTP, FTPS, Oracle, Hive CDP, Hive CDH, Impala, MySQL, PostgreSQL, SQL Server"
      );
    }
  }

  if (description) {
    if (description.length <= 30) {
    } else {
      dfArray.push("description should be less than 30 characters");
    }
  }

  // Validation Function call for dataFlow data
  let dataRes = helper.validation(Data);
  if (dataRes.length > 0) {
    // dfArray.push(dataRes);
    dfArray = dfArray.concat(dataRes);
  }

  if (dfArray.length > 0) {
    let dfErrRes = dfArray.join(" '|' ");
    dfObj.message = dfErrRes;
    isval = true;
  }

  if (req.dataPackage && req.dataPackage.length > 0) {
    // console.log("data package data", req.body.dataPackage.length);
    dfObj.dataPackages = [];

    let dpErrArray = [];
    for (let each of req.dataPackage) {
      dpErrArray = [];
      let dpNewObj = {
        ExternalId: each.ExternalId,
      };
      var LocationType = req.locationType;
      if (each.delFlag !== 0) {
        dpErrArray.push(
          "Data Package Level delFlag required and value should be 0"
        );
      }
      if (!each.ExternalId) {
        dpErrArray.push(
          "Datapackage, level ExternalId is required and data type should be string or number"
        );
      } else {
        if (helper.isSftp(LocationType)) {
          // if (LocationType === "Hive CDH") {
          const dpArray = [
            {
              key: "noPackageConfig",
              value: each.noPackageConfig,
              type: "boolean",
            },

            {
              key: "active",
              value: each.active,
              type: "boolean",
            },
          ];

          if (!helper.stringToBoolean(each.noPackageConfig)) {
            const dpArrayST = [
              { key: "type", value: each.type, type: "string" },
              // {
              //   key: "sasXptMethod ",
              //   value: each.sasXptMethod,
              //   type: "string",
              // },
              {
                key: "namingConvention",
                value: each.namingConvention,
                type: "string",
              },
              {
                key: "p_path",
                value: each.path,
                type: "string",
              },
            ];

            if (each.type) {
              if (!helper.isPackageType(each.type)) {
                dpErrArray.push("type supported values : 7Z, ZIP, RAR, SAS");
              }
            }

            let dpResST = helper.validation(dpArrayST);
            if (dpResST.length > 0) {
              // dpErrArray.push(dpResST);
              dpErrArray = dpErrArray.concat(dpResST);
            }

            if (each.type) {
              if (each.type.toLowerCase() === "sas") {
                const dpArraySAS = [
                  {
                    key: "sasXptMethod ",
                    value: each.sasXptMethod,
                    type: "string",
                  },
                ];

                let dpResSas = helper.validation(dpArraySAS);
                if (dpResSas.length > 0) {
                  dpErrArray = dpErrArray.concat(dpResSas);
                }
              }
            }
          }

          if (helper.stringToBoolean(each.noPackageConfig)) {
            if (
              each.type ||
              each.sasXptMethod ||
              each.path ||
              each.namingConvention ||
              each.password
            ) {
              dpErrArray.push(
                "if there is no package then type, sasXptMethod, path, namingConvention, password should be blank"
              );
            }
          }

          //kkkkk

          // if (each.type) {
          //   if (!helper.isPackageType(each.type)) {
          //     validate.push({
          //       err: " Package type's supported values : 7Z, ZIP, RAR, SAS ",
          //     });
          //   }
          // }

          if (each.namingConvention && each.type) {
            const last = each.namingConvention.charAt(
              each.namingConvention.length - 1
            );
            const first = each.namingConvention.charAt(
              each.namingConvention.charAt(0)
            );
            if (str2.test(each.namingConvention) === false) {
              dpErrArray.push(
                "Package namingConvention should be end with dot extension"
              );
            } else {
              if (last === "." || first === ".") {
                dpErrArray.push("Dot(.) can't be used start or end of string");
              }
            }

            const nameArray = each.namingConvention.split(".");

            if (nameArray.length > 1) {
              const name = nameArray[1].toLowerCase();
              const nameData = nameArray[0].toLowerCase();

              let nameValidate = this.namingCconventionValidate(nameData);

              if (nameValidate === false) {
                dpErrArray.push(
                  "Package naming convention should not have the following special characters /:*?”<|>"
                );
              }

              if (each.type.toLowerCase() === "rar") {
                if (name !== "rar") {
                  dpErrArray.push(
                    "If Package type is RAR then package naming convention should be end with (.rar)"
                  );
                }
              }

              if (each.type.toLowerCase() === "7z") {
                if (name !== "7z") {
                  dpErrArray.push(
                    "If Package type is 7z then package naming convention should be end with (.7z)"
                  );
                }
              }

              if (each.type.toLowerCase() === "zip") {
                if (name !== "zip") {
                  dpErrArray.push(
                    "If Package type is Zip then package naming convention should be end with (.zip)"
                  );
                }
              }

              if (each.type.toLowerCase() === "sas") {
                if (name !== "xpt") {
                  dpErrArray.push(
                    "If Package type is SAS then package naming convention should be end with (.xpt)"
                  );
                }
              }
            }

            // if (str3.test(each.namingConvention) === true) {
            //   validate.push(
            //     "Package naming convention should not have the following special characters < >"
            //   );
            // }
          }

          let dpRes = helper.validation(dpArray);
          if (dpRes.length > 0) {
            // dpErrArray.push(dpRes);
            dpErrArray = dpErrArray.concat(dpRes);
          }

          if (dpErrArray.length > 0) {
            let dpErrRes = dpErrArray.join(" '|' ");
            dpNewObj.message = dpErrRes;
            isval = true;
          }
          dfObj.dataPackages.push(dpNewObj);

          if (each.dataSet && each.dataSet.length > 0) {
            dpNewObj.dataSets = [];
            let dsErrArray = [];
            for (let obj of each.dataSet) {
              dsErrArray = [];
              let dsNewObj = {
                ExternalId: obj.ExternalId,
              };
              if (!obj.ExternalId) {
                dsErrArray.push(
                  "Dataset level, ExternalId is required and data type should be string or number"
                );
              }

              if (obj.delFlag !== 0) {
                dsErrArray.push(
                  "Data Set Level delFlag required and value should be 0"
                );
              }

              if (obj.dataKindID && req.externalSystemName) {
                let checkDataKind = await DB.executeQuery(
                  `select datakindid,active from ${schemaName}.datakind where UPPER(extrnl_sys_nm)='${req.externalSystemName.toUpperCase()}' and datakindid='${
                    obj.dataKindID
                  }';`
                );

                if (checkDataKind.rows.length > 0) {
                  if (checkDataKind.rows[0].active !== 1) {
                    dsErrArray.push(
                      `Clinical Data Type is inactive from ${req.externalSystemName}, Description in TA cannot be integrated.`
                    );
                  }
                } else {
                  dsErrArray.push(
                    `Clinical Data Type is missing from ${req.externalSystemName}, Description in TA cannot be integrated.`
                  );
                }
              }

              const dsArray = [
                {
                  key: "datasetName",
                  value: obj.datasetName,
                  type: "string",
                },
                {
                  key: "dataKindID ",
                  value: obj.dataKindID,
                  type: "string",
                },
                { key: "fileType", value: obj.fileType, type: "string" },
                {
                  key: "fileNamingConvention ",
                  value: obj.fileNamingConvention,
                  type: "string",
                },

                {
                  key: "rowDecreaseAllowed",
                  value: obj.rowDecreaseAllowed,
                  type: "number",
                },

                {
                  key: "dataTransferFrequency",
                  value: obj.dataTransferFrequency,
                  type: "number",
                },
                {
                  key: "active",
                  value: obj.active,
                  type: "boolean",
                },
                {
                  key: "incremental",
                  value: obj.incremental,
                  type: "boolean",
                },
                {
                  key: "columncount",
                  value: obj.columncount,
                  type: "number",
                },
              ];

              // console.log("data set level validation inserted========>");
              if (each.noPackageConfig === 1) {
                dsArray.push({
                  key: "Data Set Level, Path",
                  value: obj.path,
                  type: "string",
                });
              }
              //point - 28 story - 72771
              if (obj.columncount === 0) {
                dsErrArray.push(
                  "Data set column count should be minimum 1 or greater than 1. Please amend."
                );
              }

              if (obj.fileType) {
                if (!helper.isFileType(obj.fileType)) {
                  dsErrArray.push(
                    "fileType supported values : EXCEL, DELIMITED, FIXED WIDTH, SAS"
                  );
                }
              }
              //point - 28 story - 727712
              if (obj.fileNamingConvention && obj.fileType) {
                const last = obj.fileNamingConvention.charAt(
                  obj.fileNamingConvention.length - 1
                );
                const first = obj.fileNamingConvention.charAt(
                  obj.fileNamingConvention.charAt(0)
                );
                if (str2.test(obj.fileNamingConvention) === false) {
                  dsErrArray.push(
                    "fileNamingConvention should be end with dot(.) extension"
                  );
                } else {
                  if (last === "." || first === ".") {
                    dsErrArray.push(
                      "Dot(.) can't be used start or end of string"
                    );
                  }
                }

                const nameArray = obj.fileNamingConvention.split(".");

                if (nameArray.length > 1) {
                  const name = nameArray[1].toLowerCase();
                  const nameData = nameArray[0].toLowerCase();

                  let fileNameValidate =
                    this.namingCconventionValidate(nameData);

                  if (fileNameValidate === false) {
                    dsErrArray.push(
                      "File naming convention should not have the following special characters /:*?”<|>"
                    );
                  }

                  if (obj.fileType.toLowerCase() === "sas") {
                    if (name !== "sas7bdat") {
                      dsErrArray.push(
                        "If fileType SAS then fileNamingConvention should be end with (.sas7bdat)"
                      );
                    }
                  }

                  if (obj.fileType.toLowerCase() === "fixed width") {
                    if (name !== "txt") {
                      dsErrArray.push(
                        "If fileType FIXED WIDTH then fileNamingConvention should be end with (.txt)"
                      );
                    }
                  }

                  if (obj.fileType.toLowerCase() === "excel") {
                    if (name !== "xls" && name !== "xlsx") {
                      dsErrArray.push(
                        "If fileType EXCEL then fileNamingConvention should be end with (.xls or .xlsx)"
                      );
                    }
                  }

                  if (obj.fileType.toLowerCase() === "delimited") {
                    if (name !== "csv" && name !== "txt") {
                      dsErrArray.push(
                        "If fileType Delimited then fileNamingConvention should be end with (.csv or .txt)"
                      );
                    }
                  }
                }

                // if (str3.test(obj.fileNamingConvention) === true) {
                //   validate.push(
                //     "fileNamingConvention should not have the following special characters < >"
                //   );
                // }
              }

              if (obj.dataTransferFrequency === 0) {
                dsErrArray.push(
                  "dataTransferFrequency must be greater than zero"
                );
              }

              if (obj.headerRowNumber) {
                if (typeof obj.headerRowNumber != "number") {
                  dsErrArray.push(
                    "In SFTP/FTPS headerRowNumber is Optional and data type should be Number"
                  );
                }
              }

              if (obj.footerRowNumber) {
                if (typeof obj.footerRowNumber != "number") {
                  dsErrArray.push(
                    "In SFTP/FTPS footerRowNumber is Optional and data type should be Number"
                  );
                }
              }

              if (obj.OverrideStaleAlert) {
                if (typeof obj.OverrideStaleAlert != "number") {
                  dsErrArray.push(
                    "In SFTP/FTPS OverrideStaleAlert is Optional and data type should be Number"
                  );
                }
              }

              if (
                obj.customsql_yn ||
                obj.customsql_yn === 0 ||
                obj.customsql ||
                obj.conditionalExpression ||
                // obj.incremental ||
                // obj.incremental === 0 ||
                obj.offsetcolumn ||
                obj.offset_val
              ) {
                dsErrArray.push(
                  "In SFTP/FTPS customsql_yn, customsql, conditionalExpression, offsetcolumn, offset_val should be blank"
                );
              }

              if (obj.fileType) {
                if (obj.fileType.toLowerCase() === "delimited") {
                  const dsArrayDt = [
                    {
                      key: "delimiter",
                      value: obj.delimiter,
                      type: "string",
                    },
                    { key: "quote", value: obj.quote, type: "string" },

                    {
                      key: "escapeCharacter",
                      value: obj.escapeCharacter,
                      type: "string",
                    },
                  ];

                  let dsResdt = helper.validation(dsArrayDt);
                  if (dsResdt.length > 0) {
                    // dsErrArray.push(dsResdt);
                    dsErrArray = dsErrArray.concat(dsResdt);
                  }
                }
              }

              if (!obj.columnDefinition) {
                dsErrArray.push(
                  "While adding a new dataset, please provide at least one columnDefinition details"
                );
              }

              if (obj.conditionalExpressions) {
                if (obj.conditionalExpressions.length > 0) {
                  if (!obj.qcType || obj.qcType.toLowerCase() !== "vlc") {
                    dsErrArray.push("qcType required and Value should be VLC");
                  }
                }
              }

              let dsRes = helper.validation(dsArray);
              if (dsRes.length > 0) {
                // dsErrArray.push(dsRes);
                dsErrArray = dsErrArray.concat(dsRes);
              }

              if (dsErrArray.length > 0) {
                let dsErrRes = dsErrArray.join(" '|' ");
                dsNewObj.message = dsErrRes;
                isval = true;
              }
              dpNewObj.dataSets.push(dsNewObj);

              if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                dsNewObj.columnDefinition = [];
                let clErrArray = [];
                for (let el of obj.columnDefinition) {
                  clErrArray = [];
                  let clNewObj = {
                    ExternalId: el.ExternalId,
                  };

                  if (!el.ExternalId) {
                    clErrArray.push(
                      "Column definition level, ExternalId is required and data type should be string or Number"
                    );
                  }

                  if (el.delFlag !== 0) {
                    clErrArray.push(
                      "Column definition level delFlag required and value should be 0"
                    );
                  }

                  const clArray = [
                    {
                      key: "columnName",
                      value: el.columnName,
                      type: "string",
                    },

                    {
                      key: "primaryKey",
                      value: el.primaryKey,
                      type: "boolean",
                    },
                    {
                      key: "required",
                      value: el.required,
                      type: "boolean",
                    },
                    {
                      key: "unique",
                      value: el.unique,
                      type: "boolean",
                    },
                    {
                      key: "dataType",
                      value: el.dataType,
                      type: "string",
                    },
                  ];

                  if (el.dataType) {
                    if (!helper.isColumnType(el.dataType)) {
                      clErrArray.push(
                        "dataType's supported values : Numeric, Alphanumeric or Date"
                      );
                    }
                  }

                  if (el.dataType && el.format) {
                    let dataTypeValidate = dataTyperForamtValidate(
                      el.dataType,
                      el.format
                    );
                    if (dataTypeValidate) {
                      clErrArray.push(dataTypeValidate);
                    }
                  }

                  // Validation Function call for column defination
                  let clRes = helper.validation(clArray);
                  if (clRes.length > 0) {
                    // clErrArray.push(clRes);
                    clErrArray = clErrArray.concat(clRes);
                  }

                  if (el.position || el.position === 0) {
                    if (typeof el.position != "number") {
                      clErrArray.push(
                        "In SFTP/FTPS position is Optional and data type should be Number"
                      );
                    } else {
                      if (el.position === 0) {
                        clErrArray.push(
                          "Position must be equal to 1 or greater with no decimals. Please amend."
                        );
                      }
                    }
                  }

                  if (!obj.headerRowNumber) {
                    if (!el.position) {
                      clErrArray.push(
                        "When Header row is not provided, then column Position must be provided"
                      );
                    }
                  }

                  if (el.minLength) {
                    if (typeof el.minLength != "number") {
                      clErrArray.push(
                        "In SFTP/FTPS minLength is Optional and data type should be Number"
                      );
                    }
                  }

                  if (el.maxLength || el.maxLength === 0) {
                    if (typeof el.maxLength != "number") {
                      clErrArray.push(
                        "In SFTP/FTPS maxLength is Optional and data type should be Number"
                      );
                    } // testing
                    else {
                      if (el.maxLength >= 10001) {
                        clErrArray.push(
                          "Max Length must be between values of 1 and 10,000. Please amend"
                        );
                      }
                      if (el.maxLength === 0) {
                        clErrArray.push(
                          "Max Length must be between values of 1 and 10,000. Please amend"
                        );
                      }
                    }
                  }
                  if (el.minLength) {
                    if (
                      typeof el.minLength != "undefined" &&
                      typeof el.maxLength != "undefined"
                    ) {
                      if (el.minLength <= el.maxLength) {
                      } else {
                        clErrArray.push("minLength always less than maxLength");
                      }
                    }
                  }
                  if (el.lov) {
                    const last = el.lov.charAt(el.lov.length - 1);
                    const first = el.lov.charAt(el.lov.charAt(0));

                    // if (str1.test(el.lov) === false) {
                    //   clErrArray.push("LOV should be seperated by tilde(~)");
                    // } else {
                    if (last === "~" || first === "~") {
                      clErrArray.push(
                        "Tilde(~) can't be used start or end of string"
                      );
                    }
                    // }
                  }
                  if (clErrArray.length > 0) {
                    let clErrRes = clErrArray.join(" '|' ");
                    clNewObj.message = clErrRes;
                    isval = true;
                  }
                  dsNewObj.columnDefinition.push(clNewObj);
                }
              }
              // vlc validation11
              if (obj.qcType) {
                if (
                  obj.conditionalExpressions &&
                  obj.conditionalExpressions.length > 0
                ) {
                  dsNewObj.vlc = [];
                  let vlcErrArray = [];

                  for (let vl of obj.conditionalExpressions) {
                    vlcErrArray = [];
                    let vlcNewObj = {
                      conditionalExpressionNumber:
                        vl.conditionalExpressionNumber,
                    };

                    const vlcArray = [
                      {
                        key: "conditionalExpressionNumber",
                        value: vl.conditionalExpressionNumber,
                        type: "number",
                      },

                      {
                        key: "runSequence",
                        value: vl.runSequence,
                        type: "number",
                      },
                      {
                        key: "conditionalExpression",
                        value: vl.conditionalExpression,
                        type: "string",
                      },

                      {
                        key: "action",
                        value: vl.action,
                        type: "string",
                      },
                      {
                        key: "inUse",
                        value: vl.inUse,
                        type: "string",
                      },
                    ];

                    // if (vl.inUse) {
                    //   if (!helper.isActive(vl.inUse)) {
                    //     validate.push({
                    //       err: " inUse field's supported values : Y or N",
                    //     });
                    //   }
                    // }
                    if (vl.action) {
                      if (!helper.isAction(vl.action)) {
                        vlcErrArray.push(
                          "action's supported values : Reject or Report"
                        );
                      }
                      if (vl.action.toLowerCase() === "report") {
                        const rVlcArr = [
                          {
                            key: "errorMessage",
                            value: vl.errorMessage,
                            type: "string",
                          },
                        ];

                        let rVclres = helper.validation(rVlcArr);
                        if (rVclres.length > 0) {
                          // vlcErrArray.push(rVclres);
                          vlcErrArray = vlcErrArray.concat(rVclres);
                        }
                      }
                    }

                    let vlcRes = helper.validation(vlcArray);
                    if (vlcRes.length > 0) {
                      // vlcErrArray.push(vlcRes);
                      vlcErrArray = vlcErrArray.concat(vlcRes);
                    }

                    if (vlcErrArray.length > 0) {
                      let clErrRes = vlcErrArray.join(" '|' ");
                      vlcNewObj.message = clErrRes;
                      isval = true;
                      // vlcErrArray = [];
                    }
                    dsNewObj.vlc.push(vlcNewObj);
                    // vlcErrArray = [];
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
            dpErrArray.push("In jdbc noPackageConfig, active should be true");
          }

          if (
            each.type ||
            each.sasXptMethod ||
            each.path ||
            each.namingConvention
          ) {
            dpErrArray.push(
              "In jdbc datapackage level type, sasXptMethod, path, namingConvention should be blank"
            );
          }

          if (dpErrArray.length > 0) {
            let dpErrRes = dpErrArray.join(" '|' ");
            dpNewObj.message = dpErrRes;
            isval = true;
          }
          dfObj.dataPackages.push(dpNewObj);

          if (each.dataSet && each.dataSet.length > 0) {
            dpNewObj.dataSets = [];
            let dsErrArray = [];
            for (let obj of each.dataSet) {
              dsErrArray = [];
              let dsNewObj = {
                ExternalId: obj.ExternalId,
              };

              if (!obj.ExternalId) {
                dsErrArray.push(
                  "Dataset level, ExternalId is required and data type should be string or number"
                );
              }

              if (obj.delFlag !== 0) {
                dsErrArray.push(
                  "Data Set Level delFlag required and value should be 0"
                );
              }

              if (obj.dataKindID && req.externalSystemName) {
                let checkDataKind = await DB.executeQuery(
                  `select datakindid,active from ${schemaName}.datakind where UPPER(extrnl_sys_nm)='${req.externalSystemName.toUpperCase()}' and datakindid='${
                    obj.dataKindID
                  }';`
                );

                if (checkDataKind.rows.length > 0) {
                  if (checkDataKind.rows[0].active !== 1) {
                    dsErrArray.push(
                      `Clinical Data Type is inactive from ${req.externalSystemName}, Description in TA cannot be integrated.`
                    );
                  }
                } else {
                  dsErrArray.push(
                    `Clinical Data Type is missing from ${req.externalSystemName}, Description in TA cannot be integrated.`
                  );
                }
              }

              if (
                obj.fileType ||
                obj.fileNamingConvention ||
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
                obj.escapeCharacter ||
                obj.path ||
                obj.encoding
              ) {
                dsErrArray.push(
                  "In jdbc dataset level fileType, fileNamingConvention, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, escapeCharacter, path, headerRowNumber, footerRowNumber, overrideStaleAlert, encoding  should be blank"
                );
              }

              const dsArray = [
                {
                  key: "datasetName",
                  value: obj.datasetName,
                  type: "string",
                },
                {
                  key: "dataKindID ",
                  value: obj.dataKindID,
                  type: "string",
                },
                {
                  key: "active",
                  value: obj.active,
                  type: "boolean",
                },
                {
                  key: "customsql_yn",
                  value: obj.customsql_yn,
                  type: "boolean",
                },
                // {
                //   key: "incremental",
                //   value: obj.incremental,
                //   type: "boolean",
                // },
                {
                  key: "columncount",
                  value: obj.columncount,
                  type: "number",
                },
              ];

              // point - 28 story - 7277
              if (obj.columncount === 0) {
                dsErrArray.push(
                  "Data set column count should be minimum 1 or greater than 1. Please amend."
                );
              }

              if (obj.customsql_yn) {
                if (obj.customsql_yn.toLowerCase() == "yes") {
                  if (!obj.customsql) {
                    dsErrArray.push("customsql is required");
                  } else {
                    if (obj.customsql.length >= 131072) {
                      dsErrArray.push("customsql max of 131072 characters");
                    }
                  }
                }
                if (obj.customsql_yn.toLowerCase() == "no") {
                  if (!obj.tbl_nm) {
                    dsErrArray.push("tbl_nm is required");
                  } else {
                    if (obj.tbl_nm.length >= 255) {
                      dsErrArray.push("tbl_nm max of 255 characters");
                    }
                  }
                  if (helper.stringToBoolean(obj.incremental)) {
                    if (
                      !obj.offsetcolumn !== null &&
                      obj.offsetcolumn !== "" &&
                      obj.offsetcolumn !== undefined &&
                      typeof obj.offsetcolumn === "string"
                    ) {
                    } else {
                      dsErrArray.push(
                        "offsetcolumn is required and data type should be string"
                      );
                    }
                  }
                }
              }

              if (!obj.columnDefinition) {
                dsErrArray.push(
                  "While adding a new dataset, please provide at least one columnDefinition details"
                );
              }

              if (obj.conditionalExpressions) {
                if (obj.conditionalExpressions.length > 0) {
                  if (!obj.qcType || obj.qcType.toLowerCase() !== "vlc") {
                    dsErrArray.push("qcType required and Value should be VLC");
                  }
                }
              }

              // Validation Function call for data set
              let dsRes = helper.validation(dsArray);
              if (dsRes.length > 0) {
                // dsErrArray.push(dsRes);
                dsErrArray = dsErrArray.concat(dsRes);
              }

              if (dsErrArray.length > 0) {
                let dsErrRes = dsErrArray.join(" '|' ");
                dsNewObj.message = dsErrRes;
                isval = true;
              }
              dpNewObj.dataSets.push(dsNewObj);

              if (obj.columnDefinition && obj.columnDefinition.length > 0) {
                dsNewObj.columnDefinition = [];
                let clErrArray = [];
                for (let el of obj.columnDefinition) {
                  clErrArray = [];
                  let clNewObj = {
                    ExternalId: el.ExternalId,
                  };

                  if (!el.ExternalId) {
                    clErrArray.push(
                      "Column Definition Level, ExternalId  is required and data type should be string or Number"
                    );
                  }

                  if (el.delFlag !== 0) {
                    clErrArray.push(
                      "Column Definition Level delFlag required and value should be 0"
                    );
                  }

                  const clArray = [
                    {
                      key: "includeFlag",
                      value: el.includeFlag,
                      type: "boolean",
                    },
                    {
                      key: "columnName",
                      value: el.columnName,
                      type: "string",
                    },

                    {
                      key: "primaryKey",
                      value: el.primaryKey,
                      type: "boolean",
                    },
                    {
                      key: "required",
                      value: el.required,
                      type: "boolean",
                    },
                    {
                      key: "unique",
                      value: el.unique,
                      type: "boolean",
                    },
                    {
                      key: "dataType",
                      value: el.dataType,
                      type: "string",
                    },
                  ];

                  if (el.dataType) {
                    if (!helper.isColumnType(el.dataType)) {
                      clErrArray.push(
                        "dataType's supported values : Numeric, Alphanumeric or Date"
                      );
                    }
                  }

                  if (el.dataType && el.format) {
                    const dataTypeValidate = dataTyperForamtValidate(
                      el.dataType,
                      el.format
                    );
                    if (dataTypeValidate) {
                      clErrArray.push(dataTypeValidate);
                    }
                  }

                  // Validation Function call for column defination
                  let clRes = helper.validation(clArray);
                  if (clRes.length > 0) {
                    // clErrArray.push(clRes);
                    clErrArray = clErrArray.concat(clRes);
                  }

                  if (
                    el.minLength ||
                    el.maxLength ||
                    el.minLength === 0 ||
                    el.maxLength === 0 ||
                    el.lov ||
                    el.position
                  ) {
                    clErrArray.push(
                      "In jdbc minLength, maxLength, position, lov should be blank"
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

              // vlc validation
              if (obj.qcType) {
                if (
                  obj.conditionalExpressions &&
                  obj.conditionalExpressions.length > 0
                ) {
                  dsNewObj.vlc = [];
                  let vlcErrArray = [];

                  for (let vl of obj.conditionalExpressions) {
                    vlcErrArray = [];
                    let vlcNewObj = {
                      conditionalExpressionNumber:
                        vl.conditionalExpressionNumber,
                    };

                    const vlcArray = [
                      {
                        key: "conditionalExpressionNumber",
                        value: vl.conditionalExpressionNumber,
                        type: "number",
                      },

                      {
                        key: "runSequence",
                        value: vl.runSequence,
                        type: "number",
                      },
                      {
                        key: "conditionalExpression",
                        value: vl.conditionalExpression,
                        type: "string",
                      },

                      {
                        key: "Action",
                        value: vl.action,
                        type: "string",
                      },
                      {
                        key: "inUse",
                        value: vl.inUse,
                        type: "string",
                      },
                    ];

                    // if (vl.inUse) {
                    //   if (!helper.isActive(vl.inUse)) {
                    //     validate.push({
                    //       err: " inUse field's Supported values : Y or N",
                    //     });
                    //   }
                    // }
                    if (vl.action) {
                      if (!helper.isAction(vl.action)) {
                        vlcErrArray.push(
                          "action's Supported values : Reject or Report"
                        );
                      }
                      if (vl.action.toLowerCase() === "report") {
                        const rVlcArr = [
                          {
                            key: "errorMessage",
                            value: vl.errorMessage,
                            type: "string",
                          },
                        ];

                        let rVclres = helper.validation(rVlcArr);
                        if (rVclres.length > 0) {
                          // vlcErrArray.push(rVclres);
                          vlcErrArray = vlcErrArray.concat(rVclres);
                        }
                      }
                    }

                    let vlcRes = helper.validation(vlcArray);
                    if (vlcRes.length > 0) {
                      // vlcErrArray.push(vlcRes);
                      vlcErrArray = vlcErrArray.concat(vlcRes);
                    }

                    if (vlcErrArray.length > 0) {
                      let clErrRes = vlcErrArray.join(" '|' ");
                      vlcNewObj.message = clErrRes;
                      isval = true;
                    }
                    dsNewObj.vlc.push(vlcNewObj);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (isval) {
    validate.push(dfObj);
  }

  return validate;
};

exports.packageLevelInsert = async (
  data,
  DFId,
  version,
  ConnectionType,
  externalSysName,
  testFlag,
  userId,
  isNew
) => {
  try {
    const { ExternalId, delFlag, noPackageConfig, active, namingConvention } =
      data;
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorPackage = [];
    var dataPackage = [];
    var str1 = /[~]/;
    var str2 = /[.]/;
    // var str3 = /[< >]/;
    var str3 = /[\/:*?”<|>]/;

    if (!isNew) {
      if (helper.isSftp(LocationType)) {
        // if (LocationType === "MySQL") {
        if (delFlag !== 0) {
          errorPackage.push(
            "Data Package Level delFlag required and value should be 0"
          );
        }

        const dpArray = [
          {
            key: "noPackageConfig",
            value: noPackageConfig,
            type: "boolean",
          },

          {
            key: "active",
            value: active,
            type: "boolean",
          },
        ];

        if (!helper.stringToBoolean(noPackageConfig)) {
          const dpArrayST = [
            { key: "type", value: data.type, type: "string" },
            // {
            //   key: "sasXptMethod",
            //   value: data.sasXptMethod,
            //   type: "string",
            // },
            {
              key: "namingConvention",
              value: namingConvention,
              type: "string",
            },
            {
              key: "p_path",
              value: data.path,
              type: "string",
            },
          ];

          if (data.type) {
            if (!helper.isPackageType(data.type)) {
              errorPackage.push(
                "Package type Supported values : 7Z, ZIP, RAR, SAS"
              );
            }
          }

          let dpResST = helper.validation(dpArrayST);

          if (dpResST.length > 0) {
            // errorPackage.push(dpResST);
            errorPackage = errorPackage.concat(dpResST);
          }

          if (data.type) {
            if (data.type.toLowerCase() === "sas") {
              const dpArraySAS = [
                {
                  key: "sasXptMethod ",
                  value: data.sasXptMethod,
                  type: "string",
                },
              ];

              let dpResSas = helper.validation(dpArraySAS);
              if (dpResSas.length > 0) {
                errorPackage = errorPackage.concat(dpResSas);
              }
            }
          }
        }

        if (helper.stringToBoolean(noPackageConfig)) {
          if (
            data.type ||
            data.sasXptMethod ||
            data.path ||
            namingConvention ||
            data.password
          ) {
            errorPackage.push(
              "if there is no package then type, sasXptMethod, path, namingConvention, password should be blank"
            );
          }
        }

        //iuyiuyiuy

        if (namingConvention && data.type) {
          // //hhyy
          // if (str3.test(namingConvention) === true) {
          //   errorPackage.push(
          //     "Package naming convention should not have the following special characters < >"
          //   );
          // }

          const last = namingConvention.charAt(namingConvention.length - 1);
          const first = namingConvention.charAt(namingConvention.charAt(0));
          if (str2.test(namingConvention) === false) {
            errorPackage.push(
              "namingConvention should be end with dot(.) extension "
            );
          } else {
            if (last === "." || first === ".") {
              errorPackage.push("Dot(.) can't be used start or end of string");
            }
          }

          const nameArray = namingConvention.split(".");

          if (nameArray.length > 1) {
            const name = nameArray[1].toLowerCase();
            const nameData = nameArray[0].toLowerCase();

            let nameValidate = this.namingCconventionValidate(nameData);
            if (nameValidate === false) {
              errorPackage.push(
                "Package naming convention should not have the following special characters /:*?”<|>"
              );
            }

            if (data.type.toLowerCase() === "rar") {
              if (name !== "rar") {
                errorPackage.push(
                  "If Package type is RAR then package naming convention should be end with (.rar)"
                );
              }
            }

            if (data.type.toLowerCase() === "7z") {
              if (name !== "7z") {
                errorPackage.push(
                  "If Package type is 7z then package naming convention should be end with (.7z)"
                );
              }
            }

            if (data.type.toLowerCase() === "zip") {
              if (name !== "zip") {
                errorPackage.push(
                  "If Package type is Zip then package naming convention should be end with (.zip)"
                );
              }
            }

            if (data.type.toLowerCase() === "sas") {
              if (name !== "xpt") {
                errorPackage.push(
                  "If Package type is SAS then package naming convention should be end with (.xpt)"
                );
              }
            }
          }
        }

        // if (data.type) {
        //   if (!helper.isPackageType(data.type)) {
        //     errorPackage.push(
        //       " Package type's supported values : 7Z, ZIP, RAR, SAS "
        //     );
        //   }
        // }

        let dpRes = helper.validation(dpArray);

        if (dpRes.length > 0) {
          // errorPackage.push(dpRes);
          errorPackage = errorPackage.concat(dpRes);
        }
      } else {
        if (delFlag !== 0) {
          errorPackage.push(
            "Data Package Level delFlag required and value should be 0"
          );
        }
        if (
          !helper.stringToBoolean(noPackageConfig) ||
          !helper.stringToBoolean(active)
        ) {
          errorPackage.push("In jdbc noPackageConfig, active should be true");
        }

        if (data.type || data.sasXptMethod || data.path || namingConvention) {
          errorPackage.push(
            "In jdbc type, sasXptMethod, path, namingConvention should be blank"
          );
        }
      }
    }

    if (errorPackage.length > 0) {
      //errorPackage.splice(0, 0, `Datapackage external id -${ExternalId} `);
      let dpErrRes = errorPackage.join(" '|' ");
      let errObj = {
        ExternalId: ExternalId,
        message: dpErrRes,
      };

      // return { errRes: errorPackage };
      return { errRes: errObj };
    }

    let dPTimestamp = new Date();

    let dPBody = [
      data.type || null,
      data.name || namingConvention || null,
      data.path || null,
      data.sasXptMethod || null,
      data.password ? "Yes" : "No",
      helper.stringToBoolean(active) ? 1 : 0,
      helper.stringToBoolean(noPackageConfig) ? 1 : 0,
      data.ExternalId || null,
      dPTimestamp,
      DFId,
      0,
      data.sod_view_type || null,
    ];

    const {
      rows: [createdDP],
    } = await DB.executeQuery(
      `INSERT INTO ${constants.DB_SCHEMA_NAME}.datapackage( type, name, path, sasxptmethod, password, active, nopackageconfig, externalid, insrt_tm, updt_tm, dataflowid, del_flg, sod_view_type)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10, $11, $12) returning datapackageid as "dataPackageId";`,
      dPBody
    );

    const dpUid = createdDP?.dataPackageId || null;

    //new add package
    if (isNew) {
      if (!dpUid) {
        await dfRollBack(DFId);
      }
      if (data.password) {
        helper.writeVaultData(`${DFId}/${dpUid}`, {
          password: data.password,
        });
      }
    }

    let DpObj = {
      ExternalId: data.ExternalId,
      ID: dpUid,
    };
    let dpErrObj = {
      ExternalId: data.ExternalId,
      ID: dpUid,
    };
    // DpObj.action = "DataPackage created successfully.";
    // DpObj.timestamp = ts;
    // dataPackage.push(DpObj);

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
        userId,
        helper.getCurrentTime(),
      ]
    );
    let isError = false;

    if (data.dataSet && data.dataSet.length > 0) {
      DpObj.dataSets = [];
      dpErrObj.dataSets = [];
      for (let obj of data.dataSet) {
        const dataSetExternalId = obj.ExternalId;
        const noPackageConfig = data.noPackageConfig;
        await saveDataset(
          obj,
          dataSetExternalId,
          dpUid,
          DFId,
          version,
          ConnectionType,
          externalSysName,
          testFlag,
          userId,
          isNew,
          noPackageConfig
        ).then((res) => {
          if (res && Object.keys(res.errRes)?.length) {
            dpErrObj.dataSets.push(res.errRes);
            isError = true;
          }
          if (res && res.sucRes) {
            DpObj.dataSets.push(res.sucRes);
          }
        });
      }
    }
    // console.log("package insert ", DpObj);
    if (isError) {
      return { sucRes: DpObj, errRes: dpErrObj };
    }

    return { sucRes: DpObj, errRes: {} };

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
  testFlag,
  userId,
  isNew,
  noPackageConfig
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorDataset = [];
    var dataSet = [];
    var str1 = /[~]/;
    var str2 = /[.]/;
    // var str3 = /[< >]/;
    var str3 = /[\/:*?”<|>]/;

    const isCDI = externalSysName === "CDI" ? true : false;

    if (!isNew) {
      if (!obj.columnDefinition) {
        errorDataset.push(
          "While adding a new dataset, please provide at least one columnDefinition details"
        );
      }
      if (helper.isSftp(LocationType)) {
        // if (LocationType == "Hive CDH") {
        if (obj.delFlag !== 0) {
          errorDataset.push(
            "Data Set Level delFlag required and value should be 0"
          );
        }
        const dsArray = [
          {
            key: "datasetName", //Test1
            value: obj.datasetName,
            type: "string",
          },
          {
            key: "dataKindID ",
            value: obj.dataKindID,
            type: "string",
          },
          { key: "fileType", value: obj.fileType, type: "string" },
          {
            key: "fileNamingConvention",
            value: obj.fileNamingConvention,
            type: "string",
          },

          {
            key: "rowDecreaseAllowed",
            value: obj.rowDecreaseAllowed,
            type: "number",
          },

          {
            key: "dataTransferFrequency",
            value: obj.dataTransferFrequency,
            type: "number",
          },
          {
            key: "active",
            value: obj.active,
            type: "boolean",
          },
          {
            key: "incremental",
            value: obj.incremental,
            type: "boolean",
          },
          {
            key: "columncount",
            value: obj.columncount,
            type: "number",
          },
        ];

        if (noPackageConfig === 1) {
          dsArray.push({
            key: "Data Set Level, path",
            value: obj.path,
            type: "string",
          });
        }
        // point - 28 story - 7277
        if (obj.columncount === 0) {
          errorDataset.push(
            "Data set column count should be minimum 1 or greater than 1. Please amend"
          );
        }

        if (obj.dataTransferFrequency === 0) {
          errorDataset.push(
            "Data transfer frequency must be greater than zero"
          );
        }

        //12
        if (obj.fileType) {
          if (!helper.isFileType(obj.fileType)) {
            errorDataset.push(
              "fileType supported values : EXCEL, DELIMITED, FIXED WIDTH, SAS"
            );
          }
        }

        if (obj.fileNamingConvention && obj.fileType) {
          // if (str3.test(obj.fileNamingConvention) === true) {
          //   errorDataset.push(
          //     "fileNamingConvention should not have the following special characters < > "
          //   );
          // }
          const last = obj.fileNamingConvention.charAt(
            obj.fileNamingConvention.length - 1
          );
          const first = obj.fileNamingConvention.charAt(
            obj.fileNamingConvention.charAt(0)
          );
          if (str2.test(obj.fileNamingConvention) === false) {
            errorDataset.push(
              "fileNamingConvention should be end with dot (.) extension "
            );
          } else {
            if (last === "." || first === ".") {
              errorDataset.push("Dot(.) can't be used start or end of string");
            }
          }

          const nameArray = obj.fileNamingConvention.split(".");

          if (nameArray.length > 1) {
            const name = nameArray[1].toLowerCase();
            const nameData = nameArray[0].toLowerCase();

            let fileNameValidate = this.namingCconventionValidate(nameData);

            if (fileNameValidate === false) {
              errorDataset.push(
                "File naming convention should not have the following special characters /:*?”<|>"
              );
            }
            if (obj.fileType.toLowerCase() === "sas") {
              if (name !== "sas7bdat") {
                errorDataset.push(
                  "If fileType SAS then fileNamingConvention should be end with (.sas7bdat)"
                );
              }
            }

            if (obj.fileType.toLowerCase() === "fixed width") {
              if (name !== "txt") {
                errorDataset.push(
                  "If fileType FIXED WIDTH then fileNamingConvention should be end with (.txt)"
                );
              }
            }

            if (obj.fileType.toLowerCase() === "excel") {
              if (name !== "xls" && name !== "xlsx") {
                errorDataset.push(
                  "If fileType EXCEL then fileNamingConvention should be end with (.xls or .xlsx)"
                );
              }
            }

            if (obj.fileType.toLowerCase() === "delimited") {
              if (name !== "csv" && name !== "txt") {
                errorDataset.push(
                  "If fileType Delimited then fileNamingConvention should be end with (.csv or .txt)"
                );
              }
            }
          }
        }

        let dsArrRes = helper.validation(dsArray);
        if (dsArrRes.length > 0) {
          // errorDataset.push(dsArrRes);
          errorDataset = errorDataset.concat(dsArrRes);
        }

        if (obj.fileType) {
          if (obj.fileType.toLowerCase() === "delimited") {
            const dsArrayDt = [
              {
                key: "delimiter",
                value: obj.delimiter,
                type: "string",
              },
              { key: "quote", value: obj.quote, type: "string" },

              {
                key: "escapeCharacter",
                value: obj.escapeCharacter,
                type: "string",
              },
            ];

            let dsResdt = helper.validation(dsArrayDt);
            if (dsResdt.length > 0) {
              // errorDataset.push(dsResdt);
              errorDataset = errorDataset.concat(dsResdt);
            }
          }
        }

        if (obj.headerRowNumber) {
          if (typeof obj.headerRowNumber != "number") {
            errorDataset.push(
              "In SFTP/FTPS headerRowNumber is Optional and data type should be Number"
            );
          }
        }

        if (obj.footerRowNumber) {
          if (typeof obj.footerRowNumber != "number") {
            errorDataset.push(
              "In SFTP/FTPS footerRowNumber is Optional and data type should be Number"
            );
          }
        }

        if (obj.OverrideStaleAlert) {
          if (typeof obj.OverrideStaleAlert != "number") {
            errorDataset.push(
              "In SFTP/FTPS OverrideStaleAlert is Optional and data type should be Number"
            );
          }
        }

        if (
          obj.customsql_yn ||
          obj.customsql_yn === 0 ||
          obj.customsql ||
          // obj.incremental ||
          // obj.incremental === 0 ||
          obj.conditionalExpression ||
          obj.offsetcolumn ||
          obj.offset_val
        ) {
          errorDataset.push(
            "For SFTP/FTPS customsql_yn, customsql, conditionalExpression, offsetcolumn, offset_val fields should be blank "
          );
        }
      } else {
        // console.log("else data set1");
        if (
          obj.fileType ||
          obj.fileNamingConvention ||
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
          obj.escapeCharacter ||
          obj.encoding
        ) {
          errorDataset.push(
            "In jdbc dataset level fileType, fileNamingConvention, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, Path, escapeCharacter, headerRowNumber, footerRowNumber, OverrideStaleAlert, encoding should be Blank "
          );
        }

        if (obj.delFlag !== 0) {
          errorDataset.push(
            "Dataset level delFlag required and value should be 0"
          );
        }

        const dsElse = [
          {
            key: "datasetName",
            value: obj.datasetName,
            type: "string",
          },
          {
            key: "dataKindID",
            value: obj.dataKindID,
            type: "string",
          },
          {
            key: "active",
            value: obj.active,
            type: "boolean",
          },
          {
            key: "customsql_yn",
            value: obj.customsql_yn,
            type: "boolean",
          },
          {
            key: "columncount",
            value: obj.columncount,
            type: "number",
          },
        ];

        // point - 28 story - 7277
        if (obj.columncount === 0) {
          errorDataset.push(
            "Data set column count should be minimum 1 or greater than 1. Please amend."
          );
        }

        const dsreqElse = helper.validation(dsElse);

        if (dsreqElse.length > 0) {
          // errorDataset.push(dsreqElse);
          errorDataset = errorDataset.concat(dsreqElse);
        }

        if (obj.customsql_yn) {
          if (obj.customsql_yn.toLowerCase() == "yes") {
            if (!obj.customsql) {
              errorDataset.push("customsql  is required  ");
            } else {
              if (obj.customsql.length >= 131072) {
                errorDataset.push("customsql  Max of 131072 characters  ");
              }
            }
          }
          if (obj.customsql_yn.toLowerCase() == "no") {
            if (!obj.tbl_nm) {
              errorDataset.push("tbl_nm is required ");
            } else {
              if (obj.tbl_nm.length >= 255) {
                errorDataset.push("tbl_nm max of 255 characters ");
              }
            }
            if (helper.stringToBoolean(obj.incremental)) {
              if (!obj.offsetcolumn) {
                errorDataset.push(
                  "offsetcolumn is required and data type should be string"
                );
              }
            }
          }
        }
      }
    }
    // console.log("insert data set");

    if (!isCDI) {
      const {
        rows: [protId],
      } = await DB.executeQuery(
        `select prot_id,vend_id from ${schemaName}.dataflow where dataflowid='${DFId}';`
      );

      const study = protId?.prot_id;
      const vendor = protId?.vend_id;

      // console.log("vendor", vendor);

      if (obj.dataKindID && externalSysName) {
        let checkDataKind = await DB.executeQuery(
          `select datakindid, active from ${schemaName}.datakind where UPPER(extrnl_sys_nm)='${externalSysName.toUpperCase()}' and datakindid='${
            obj.dataKindID
          }';`
        );

        if (checkDataKind.rows.length > 0) {
          if (checkDataKind.rows[0].active !== 1) {
            errorDataset.push(
              `Clinical Data Type is inactive from ${externalSysName}, Description in TA cannot be integrated.`
            );
            if (isNew) {
              const dataSetRollBack = await dfRollBack(DFId);
            }
          }
        } else {
          errorDataset.push(
            `Clinical Data Type is missing from ${externalSysName}, Description in TA cannot be integrated.`
          );
          if (isNew) {
            const dataSetRollBack = await dfRollBack(DFId);
          }
        }
      }

      if (obj.datasetName) {
        const tFlg = helper.stringToBoolean(testFlag) ? 1 : 0;
        // let selectMnemonic = `select ds.mnemonic from ${schemaName}.dataset ds
        //         left join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
        //         left join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
        //         where ds.mnemonic ='${obj.datasetName}' and df.testflag ='${tFlg}'`;

        let selectMnemonic = `select ds.mnemonic from ${schemaName}.dataset ds
          inner join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
          inner join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
          where df.prot_id = '${study}' and df.vend_id = '${vendor}' 
          and UPPER(ds.mnemonic) ='${obj.datasetName.toUpperCase()}' 
          and ds.datakindid = '${obj.dataKindID}'and df.testflag = '${tFlg}'`;

        let queryMnemonic = await DB.executeQuery(selectMnemonic);

        if (queryMnemonic.rows.length > 0) {
          errorDataset.push(
            "In this environment this datasetName(mnemonic) name already Exist!"
          );

          if (isNew) {
            const dataSetRollBack = await dfRollBack(DFId);
          }
        }
      }
    }

    if (errorDataset.length > 0) {
      // errorDataset.splice(0, 0, `DataSet external id -${externalID} `);
      let dsErrRes = errorDataset.join(" '|' ");
      let errObj = {
        ExternalId: externalID,
        message: dsErrRes,
      };

      //  return { errRes: errorDataset };
      return { errRes: errObj };
    }

    let sqlQuery = "";
    const custQryYn = obj.customQuery || obj.customsql_yn;
    if (custQryYn) {
      if (custQryYn.toLowerCase() === "no") {
        if (obj.columnDefinition.length) {
          const cList = obj.columnDefinition
            .map((el) => el.name || el.columnName)
            .join(", ");

          sqlQuery = `Select ${cList} from ${obj.tableName || obj.tbl_nm} ${
            obj.conditionalExpression ? obj.conditionalExpression : "where 1=1"
          }`;
        } else {
          sqlQuery = `Select from ${obj.tableName || obj.tbl_nm} ${
            obj.conditionalExpression ? obj.conditionalExpression : "where 1=1"
          }`;
        }
      } else {
        sqlQuery = obj.customSql || obj.customsql;
      }
    }

    let DSBody = [
      DPId,
      obj.dataKindID || null,
      obj.datasetName || null,
      obj.fileNamingConvention || obj.name || "",
      helper.stringToBoolean(obj.active) ? 1 : 0,
      typeof obj.columncount != "undefined" ? obj.columncount : 0,
      helper.stringToBoolean(obj.incremental) ? "Y" : "N",
      obj.offsetColumn || obj.offsetcolumn || null,
      obj.type || obj.fileType || null,
      obj.path || null,
      obj.OverrideStaleAlert || null,
      obj.headerRowNumber && obj.headerRowNumber != "" ? 1 : 0,
      obj.footerRowNumber && obj.footerRowNumber != "" ? 1 : 0,
      obj.headerRowNumber || 0,
      obj.footerRowNumber || 0,
      sqlQuery || null,
      obj.customQuery || obj.customsql_yn || null,
      obj.tableName || obj.tbl_nm || null,
      obj.ExternalId || null,
      obj.filePwd ? "Yes" : "No",
      helper.getCurrentTime(),
      obj.delimiter || "",
      helper.convertEscapeChar(obj.escapeCharacter) || "",
      obj.quote || "",
      obj.rowDecreaseAllowed || 0,
      obj.dataTransferFrequency || "",
      obj.encoding || "UTF-8",
      obj.offset_val || null,
      obj.conditionalExpression || null,
      0,
    ];
    const {
      rows: [createdDS],
    } = await DB.executeQuery(
      `insert into ${schemaName}.dataset( datapackageid, datakindid, mnemonic, name, active, columncount, incremental,
            offsetcolumn, type, path, ovrd_stale_alert, headerrow, footerrow, headerrownumber,footerrownumber, customsql,
            customsql_yn, tbl_nm, externalid, file_pwd, insrt_tm, updt_tm, "delimiter", escapecode, "quote", rowdecreaseallowed,
             data_freq,charset, offset_val,dataset_fltr, del_flg )values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, $20, $21, $21,
               $22, $23, $24, $25, $26, $27, $28, $29, $30) returning datasetid as "datasetId";`,
      DSBody
    );

    const dsUid = createdDS?.datasetId || null;

    //new add uuu
    if (isNew) {
      if (!dsUid) {
        await dfRollBack(DFId);
      }
      if (obj.filePwd) {
        await helper.writeVaultData(`${DFId}/${DPId}/${dsUid}`, {
          password: obj.filePwd,
        });
      }
    }

    let dsObj = {
      ExternalId: obj.ExternalId,
      ID: dsUid,
    };

    let dsErrObj = {
      ExternalId: obj.ExternalId,
      ID: dsUid,
    };
    let isError = false;
    // dsObj.action = "Dataset created successfully.";
    // dsObj.timestamp = ts;
    // dataSet.push(dsObj);

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
        userId,
        helper.getCurrentTime(),
      ]
    );

    if (obj.qcType) {
      if (obj.conditionalExpressions && obj.conditionalExpressions.length > 0) {
        dsObj.vlc = [];
        dsErrObj.vlc = [];

        for (let vlc of obj.conditionalExpressions) {
          // let vlcRes = [];
          await saveVlc(
            vlc,
            obj.qcType,
            DFId,
            DPId,
            dsUid,
            version,
            userId
          ).then((res) => {
            if (res && Object.keys(res.errRes)?.length) {
              dsErrObj.vlc.push(res.errRes);
              isError = true;
              // errorDataset.push(dsErrObj);
            }
            if (res && res.sucRes) {
              //
              dsObj.vlc.push(res.sucRes);
            }
          });
          // dataSet.push(vlcRes);
        }
      }
    }

    if (obj.columnDefinition && obj.columnDefinition.length) {
      // let column_definition = [];

      dsObj.columnDefinition = [];
      dsErrObj.columnDefinition = [];
      for (let el of obj.columnDefinition) {
        await columnSave(
          el,
          el.ExternalId,
          DPId,
          DFId,
          dsUid,
          version,
          ConnectionType,
          userId,
          isNew,
          obj.headerRowNumber
        ).then((res) => {
          if (res && Object.keys(res.errRes)?.length) {
            dsErrObj.columnDefinition.push(res.errRes);
            isError = true;
          }

          if (res && res.sucRes) {
            dsObj.columnDefinition.push(res.sucRes);
          }
        });
      }
    }

    if (isError) {
      return { sucRes: dsObj, errRes: dsErrObj };
    }
    return { sucRes: dsObj, errRes: {} };
    // return { sucRes: dsObj, errRes: errorDataset };
  } catch (err) {
    console.log("dataset catch", err);
    //throw error in json response with status 500.
    Logger.error("catch :Dataset level insert");
    Logger.error(err);
  }
});

const columnSave = (exports.columnDefinationInsert = async (
  el,
  cdExternalId,
  DPId,
  DFId,
  DSId,
  version,
  ConnectionType,
  userId,
  isNew,
  DSheaderRow
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    let errorColumnDef = [];
    var ColumnDef = [];
    var str1 = /[~]/;

    if (!isNew) {
      if (el.delFlag !== 0) {
        errorColumnDef.push(
          "Column Definition Level delFlag required and value should be 0"
        );
      }

      if (helper.isSftp(LocationType)) {
        const clArrayIf = [
          {
            key: "columnName",
            value: el.columnName,
            type: "string",
          },

          {
            key: "primaryKey",
            value: el.primaryKey,
            type: "boolean",
          },
          {
            key: "required",
            value: el.required,
            type: "boolean",
          },
          {
            key: "unique",
            value: el.unique,
            type: "boolean",
          },
          {
            key: "dataType",
            value: el.dataType,
            type: "string",
          },
        ];

        if (el.dataType) {
          if (!helper.isColumnType(el.dataType)) {
            errorColumnDef.push(
              "dataType's Supported values : Numeric, Alphanumeric or Date"
            );
          }
        }

        //po09
        // if (el.dataType && el.format) {
        //   if (el.dataType.toLowerCase() === "alphanumeric") {
        //     if (helper.isAlphaNumeric(el.format) === false) {
        //       errorColumnDef.push(
        //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
        //       );
        //     }
        //   }
        //   if (el.dataType.toLowerCase() === "numeric") {
        //     if (helper.isNumbers(el.format) === false) {
        //       errorColumnDef.push(
        //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
        //       );
        //     }
        //   }
        //   if (el.dataType.toLowerCase() === "date") {
        //     if (helper.isValidDate(el.format) === false) {
        //       errorColumnDef.push(
        //         "Data Set Column Format should have '\\ and $ are not allowed' for Date Data Type. Please amend."
        //       );
        //     }
        //   }
        // }

        if (el.dataType && el.format) {
          const validate = dataTyperForamtValidate(el.dataType, el.format);
          if (validate) {
            errorColumnDef.push(validate);
          }
        }

        let clResIf = helper.validation(clArrayIf);
        if (clResIf.length > 0) {
          // errorColumnDef.push(clResIf);
          errorColumnDef = errorColumnDef.concat(clResIf);
        }

        if (el.position || el.position === 0) {
          if (typeof el.position != "number") {
            errorColumnDef.push(
              "In SFTP/FTPS position is Optional and data type should be Number"
            );
          } else {
            if (el.position === 0) {
              errorColumnDef.push(
                "Position must be equal to 1 or greater with no decimals. Please amend."
              );
            }
          }
        }

        if (!DSheaderRow) {
          if (!el.position) {
            errorColumnDef.push(
              "When Header row is not provided, then column Position must be provided."
            );
          }
        }

        //test1
        if (el.minLength) {
          if (typeof el.minLength != "number") {
            errorColumnDef.push(
              "In SFTP/FTPS minLength is Optional and data type should be Number"
            );
          }
        }

        if (el.maxLength || el.maxLength === 0) {
          if (typeof el.maxLength != "number") {
            errorColumnDef.push(
              "In SFTP/FTPS maxLength is Optional and data type should be Number"
            );
          } else {
            if (el.maxLength >= 10001) {
              errorColumnDef.push(
                "Max Length must be between values of 1 and 10,000. Please amend."
              );
            }
            if (el.maxLength === 0) {
              errorColumnDef.push(
                "Max Length must be between values of 1 and 10,000. Please amend."
              );
            }
          }
        }

        if (el.minLength) {
          if (
            typeof el.minLength != "undefined" &&
            typeof el.maxLength != "undefined"
          ) {
            if (el.minLength >= el.maxLength) {
              errorColumnDef.push("minLength always less than maxLength ");
            }
          }
        }

        if (el.lov) {
          const last = el.lov.charAt(el.lov.length - 1);
          const first = el.lov.charAt(el.lov.charAt(0));

          // if (str1.test(el.lov) === false) {
          //   errorColumnDef.push("LOV should be seperated by tilde(~)");
          // } else {
          if (last === "~" || first === "~") {
            errorColumnDef.push(
              "Tilde(~) can't be used start or end of string"
            );
          }
          // }
        }
      } else {
        const clArray = [
          {
            key: "columnName",
            value: el.columnName,
            type: "string",
          },

          {
            key: "primaryKey",
            value: el.primaryKey,
            type: "boolean",
          },
          {
            key: "required",
            value: el.required,
            type: "boolean",
          },
          {
            key: "unique",
            value: el.unique,
            type: "boolean",
          },
          {
            key: "includeFlag",
            value: el.includeFlag,
            type: "boolean",
          },
          {
            key: "dataType",
            value: el.dataType,
            type: "string",
          },
        ];

        if (el.dataType) {
          if (!helper.isColumnType(el.dataType)) {
            errorColumnDef.push(
              "dataType's Supported values : Numeric, Alphanumeric or Date"
            );
          }
        }

        //ppp
        // if (el.dataType && el.format) {
        //   if (el.dataType.toLowerCase() === "alphanumeric") {
        //     if (helper.isAlphaNumeric(el.format) === false) {
        //       errorColumnDef.push(
        //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
        //       );
        //     }
        //   }
        //   if (el.dataType.toLowerCase() === "numeric") {
        //     if (helper.isNumbers(el.format) === false) {
        //       errorColumnDef.push(
        //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
        //       );
        //     }
        //   }
        //   if (el.dataType.toLowerCase() === "date") {
        //     if (helper.isValidDate(el.format) === false) {
        //       errorColumnDef.push(
        //         "Data Set Column Format should have '\\ and $ are not allowed' for Date Data Type. Please amend."
        //       );
        //     }
        //   }
        // }

        if (el.dataType && el.format) {
          const validate = dataTyperForamtValidate(el.dataType, el.format);
          if (validate) {
            errorColumnDef.push(validate);
          }
        }

        let clRes = helper.validation(clArray);
        if (clRes.length > 0) {
          // errorColumnDef.push(clRes);
          errorColumnDef = errorColumnDef.concat(clRes);
        }

        if (
          el.minLength ||
          el.minLength === 0 ||
          el.maxLength ||
          el.maxLength === 0 ||
          el.lov ||
          el.position
        ) {
          // console.log(val.key, val.value);
          errorColumnDef.push(
            "For JBDC minLength, maxLength, lov, position fields should be Blank"
          );
        }
      }
    }

    // Column Def Name check
    if (el.columnName) {
      let clName = await DB.executeQuery(
        `select name from ${schemaName}.columndefinition where datasetid='${DSId}' and name='${el.columnName}';`
      );
      //new changes1
      if (clName.rows.length > 0) {
        errorColumnDef.push(
          " Column Names (Headers) must be unique in a data set file structure. Please amend."
        );
        if (isNew) {
          await dfRollBack(DFId);
        }
      }
    }

    if (errorColumnDef.length > 0) {
      // if (isNew) {
      // errorColumnDef.splice(
      //   0,
      //   0,
      //   `Column definition External Id -${cdExternalId} `
      // );
      // }
      let clErrRes = errorColumnDef.join(" '|' ");
      let errObj = {
        ExternalId: cdExternalId,
        message: clErrRes,
      };
      // return { errRes: errorColumnDef };
      return { errRes: errObj };
    }

    let CDBody = [
      DSId,
      el.columnName || null,
      el.dataType || null,
      helper.stringToBoolean(el.primaryKey) ? 1 : 0,
      helper.stringToBoolean(el.required) ? 1 : 0,
      el.minLength || el.minLength || 0,
      el.maxLength || el.maxLength || 0,
      el.position || 0,
      el.format || null,
      el.lov || el.values || null,
      helper.stringToBoolean(el.unique) ? 1 : 0,
      el.requiredfield || null,
      helper.getCurrentTime(),
      el.ExternalId || null,
      el.variableLabel || null,
      0,
    ];

    const {
      rows: [createdCD],
    } = await DB.executeQuery(
      `insert into ${schemaName}.columndefinition(datasetid,name,datatype, primarykey,required,charactermin,
            charactermax,position,format,lov, "unique", requiredfield,insrt_tm, updt_tm,externalid, variable,del_flg) 
            values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13,$14,$15, $16) returning columnid as "columnId";`,
      CDBody
    );

    const CDUid = createdCD?.columnId || null;

    if (isNew) {
      if (!CDUid) {
        await dfRollBack(DFId);
      }
    }

    const {
      rows: [existCDs],
    } = await DB.executeQuery(
      `select count(*) from ${schemaName}.columndefinition where datasetid ='${DSId}'`
    );

    const clCountUpdate = await DB.executeQuery(
      `update ${schemaName}.dataset set columncount='${
        existCDs.count || 0
      }' where datasetid ='${DSId}'`
    );

    // const clDefCount = `select  count(*) from ${schemaName}.columndefinition where datasetid ='${DSId}'`;
    // const Count = await DB.executeQuery(clDefCount);
    // const dsCountUpdate = `update ${schemaName}.dataset set columncount='${Count.rows[0].count}' where datasetid ='${DSId}'`;
    // const clCountUpdate = await DB.executeQuery(dsCountUpdate);

    let cdObj = {
      ExternalId: cdExternalId,
      ID: CDUid,
    };
    // cdObj.action = "column definition created successfully.";
    // cdObj.timestamp = ts;
    // ColumnDef.push(cdObj);

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
        userId,
        helper.getCurrentTime(),
      ]
    );

    // console.log("column insert", cdObj);
    return { sucRes: cdObj, errRes: errorColumnDef };
  } catch (e) {
    console.log(e);
    Logger.error("catch :New Column def add");
    Logger.error(e);
  }
});

const saveVlc = (exports.VlcInsert = async (
  vl,
  qcType,
  DFId,
  DPId,
  dsUid,
  version,
  userId
) => {
  try {
    //vl holds all Conditional Expressions data
    let ts = new Date().toLocaleString();
    let errorVlc = [];
    var vlc = [];

    if (qcType) {
      const vlcArray = [
        {
          key: "conditionalExpressionNumber",
          value: vl.conditionalExpressionNumber,
          type: "number",
        },

        {
          key: "runSequence",
          value: vl.runSequence,
          type: "number",
        },
        {
          key: "conditionalExpression",
          value: vl.conditionalExpression,
          type: "string",
        },

        {
          key: "action",
          value: vl.action,
          type: "string",
        },
        {
          key: "inUse",
          value: vl.inUse,
          type: "string",
        },
      ];

      let vlcRes = helper.validation(vlcArray);
      if (vlcRes.length > 0) {
        // errorVlc.push(vlcRes);
        errorVlc = errorVlc.concat(vlcRes);
      }

      // if (vl.inUse) {
      //   if (!helper.isActive(vl.inUse)) {
      //     // hhhhhhhh44
      //     errorVlc.push(" inUse field's Supported values : Y or N ");
      //   }
      // }
      if (vl.action) {
        if (!helper.isAction(vl.action)) {
          errorVlc.push("action's Supported values : Reject or Report");
        }
        if (vl.action.toLowerCase() === "report") {
          const rVlcArr = [
            {
              key: "errorMessage",
              value: vl.errorMessage,
              type: "string",
            },
          ];

          let rVclres = helper.validation(rVlcArr);
          if (rVclres.length > 0) {
            // errorVlc.push(rVclres);
            errorVlc = errorVlc.concat(rVclres);
          }
        }
      }
    }

    if (vl) {
      if (vl.length > 0) {
        if (!qcType) {
          errorVlc.push("qcType required and Value should be VLC");
        } else {
          if (qcType.toLowerCase() !== "vlc") {
            errorVlc.push("qcType required and Value should be VLC");
          }
        }
      }
    }

    if (errorVlc.length > 0) {
      // errorVlc.splice(
      //   0,
      //   0,
      //   `VLC Conditional Expression Number -${vl.conditionalExpressionNumber} `
      // );
      let vlcErrRes = errorVlc.join(" '|' ");
      let errObj = {
        ExternalId: vl.conditionalExpressionNumber,
        message: vlcErrRes,
      };

      // return { errRes: errorVlc };
      return { errRes: errObj };
    }

    let vlcBody = [
      DFId,
      DPId,
      dsUid,
      vl.conditionalExpressionNumber,
      qcType,
      vl.runSequence,
      vl.action,
      vl.conditionalExpression,
      vl.errorMessage || null,
      "Y",
      helper.getCurrentTime(),
      userId,
    ];

    const {
      rows: [createdVlc],
    } = await DB.executeQuery(
      `insert into ${schemaName}.dataset_qc_rules(dataflowid, datapackageid, datasetid, ext_ruleid, qc_type,
        ruleseq, action, ruleexpr, errormessage, active_yn,created_dttm,updated_dttm,created_by_user,updated_by_user)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,$12,$12 ) returning dsqcruleid as "vlcID";`,
      vlcBody
    );

    // const createdVlc = "";

    const vlcId = createdVlc?.vlcID || null;
    // const vlcId = null;

    let vlcObj = {
      conditionalExpressionNumber: vl.conditionalExpressionNumber,
      ID: vlcId,
    };
    // vlcObj.action = "VLC created successfully.";
    // vlcObj.timestamp = ts;
    // vlc.push(vlcObj);

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
        "New VLC",
        "",
        "",
        userId,
        helper.getCurrentTime(),
      ]
    );

    // console.log("vlc insert ", vlcObj);
    return { sucRes: vlcObj, errRes: errorVlc };
  } catch (err) {
    console.log("vlc", err);
    //throw error in json response with status 500.
    Logger.error("catch :Data Set VLC Insert");
    Logger.error(err);
  }
});

exports.dataflowUpdate = async (
  data,
  externalID,
  DFId,
  version,
  externalSysName,
  conf_data,
  userId,
  ConnectionType
) => {
  try {
    let ts = helper.getCurrentTime();
    var dataflow = [];
    let errorDF = [];
    let studyId;
    let vName;
    let vNameDB;
    let ptNum;
    let desc;
    var newDfobj = {};
    let valData = [];

    if (data.vendorid && externalSysName) {
      let { rows: existVendor } = await DB.executeQuery(
        `select vend_id,active from ${schemaName}.vendor where UPPER(extrnl_sys_nm)='${externalSysName.toUpperCase()}' and vend_id=$1;`,
        [data.vendorid]
      );
      if (existVendor.length) {
        if (existVendor[0].active !== 1) {
          errorDF.push(`Vendor is not active in ${externalSysName}`);
        }
      } else {
        errorDF.push(`Vendor does not exist for ${externalSysName}`);
      }
    }

    if (data.locationID && externalSysName) {
      let locationData = await DB.executeQuery(
        `select src_loc_id,active from ${schemaName}.source_location where UPPER(extrnl_sys_nm)='${externalSysName.toUpperCase()}' and UPPER(loc_typ)='${ConnectionType.toUpperCase()}' and src_loc_id=$1;`,
        [data.locationID]
      );

      if (locationData.rows.length) {
        if (locationData.rows[0].active !== 1) {
          errorDF.push(`Location is not active in ${externalSysName}`);
        }
      } else {
        errorDF.push(`Location does not exist for ${externalSysName}`);
      }
    }

    if (data.protocolNumberStandard) {
      const studyRows = await DB.executeQuery(
        `select prot_id from study where prot_nbr_stnd ='${data.protocolNumberStandard}';`
      );
      if (!studyRows.rows.length) {
        errorDF.push("This protocol number doesn't exist ");
      }
    }

    if (data.exptDtOfFirstProdFile) {
      function validateDOB(date) {
        var pattern =
          /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
        if (!pattern.test(date)) {
          errorDF.push(
            "exptDtOfFirstProdFile optional and data format should be [YYYY-MM-DD HH:MI:SS]"
          );
        }
      }
      validateDOB(data.exptDtOfFirstProdFile);
    }

    if (typeof data.externalSystemName != "undefined") {
      valData.push({
        key: "externalSystemName",
        value: data.externalSystemName,
        type: "string",
      });
    }

    if (typeof data.dataStructure != "undefined") {
      valData.push({
        key: "dataStructure ",
        value: data.dataStructure,
        type: "string",
      });
    }

    if (typeof data.description != "undefined") {
      valData.push({
        key: "description ",
        value: data.description,
        type: "string",
        maxLength: 30,
      });
    }
    if (typeof data.testFlag != "undefined") {
      valData.push({
        key: "testFlag ",
        value: data.testFlag,
        type: "boolean",
      });
    }
    if (typeof data.active != "undefined") {
      valData.push({
        key: "active ",
        value: data.active,
        type: "boolean",
      });
    }
    if (data.serviceOwners) {
      if (!Array.isArray(data.serviceOwners))
        errorDF.push("serviceOwners its optional and it should be array ");
    }

    const resErr = helper.validation(valData);
    if (resErr.length) {
      errorDF = errorDF.concat(resErr);
    }

    if (errorDF.length > 0) {
      return { errRes: errorDF };
    }

    const q1 = `select * from ${schemaName}.dataflow where externalsystemname='${externalSysName}' and externalid='${externalID}'`;
    let q3 = `select vend_nm from ${schemaName}.vendor where vend_id=$1;`;
    let q4 = `select prot_nbr_stnd  from study where prot_id=$1;`;

    if (data.vendorid) {
      let q2 = `select vend_id,vend_nm from ${schemaName}.vendor where vend_id=$1;`;
      let { rows } = await DB.executeQuery(q2, [data.vendorid]);
      vNameDB = rows[0].vend_nm;
    }

    if (data.locationID) {
      let q5 = `select src_loc_id from ${schemaName}.source_location where src_loc_id='${data.locationID}';`;
      let { rows: srcId } = await DB.executeQuery(q5);
    }
    const dataflowData = await DB.executeQuery(q1);

    const vendorData = await DB.executeQuery(q3, [
      dataflowData.rows[0].vend_id,
    ]);
    const protocolData = await DB.executeQuery(q4, [
      dataflowData.rows[0].prot_id,
    ]);

    if (data.vendorid) {
      // vName = data.vendorid;
      vName = vNameDB;
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
    var testFlag = dataflowData.rows[0].testflag;

    if (data.testFlag) {
      testFlag = helper.stringToBoolean(data.testFlag);
    }
    if (data.testFlag === 0) {
      testFlag = helper.stringToBoolean(data.testFlag);
    }

    if (helper.stringToBoolean(testFlag)) {
      DFTestname = "TST-" + DFTestname;
    }

    let serviceUrl = [];
    if (data.serviceOwners) {
      for (let key of data.serviceOwners) {
        let ulr = `select call_back_url_id from ${schemaName}.call_back_urls where serv_ownr='${key}';`;
        const ulrData = await DB.executeQuery(ulr);
        if (ulrData.rows.length > 0) {
          serviceUrl.push(ulrData.rows[0].call_back_url_id);
        }
      }
    }

    let updateQueryDF = `update ${schemaName}.dataflow set updt_tm=NOW(), refreshtimestamp=NOW(),updated_by_user='${userId}'`;

    // if (data.dataStructure) {
    //   updateQueryDF += `,type='${data.dataStructure}'`;
    // }

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
    if (data.vendorid) {
      updateQueryDF += ` ,vend_id= '${data.vendorid}'`;
    }
    if (data.locationID) {
      updateQueryDF += ` ,src_loc_id= '${data.locationID}'`;
    }
    if (
      data.protocolNumberStandard ||
      data.description ||
      data.vendorid ||
      helper.stringToBoolean(data.testFlag) ||
      !helper.stringToBoolean(data.testFlag)
    ) {
      updateQueryDF += `,name='${DFTestname}'`;
    }
    if (data.serviceOwners) {
      updateQueryDF += ` ,serv_ownr= '${
        serviceUrl && Array.isArray(serviceUrl) ? serviceUrl.join() : ""
      }'`;
    }

    updateQueryDF += ` where externalsystemname='${externalSysName}' and externalid='${externalID}' returning *;`;
    // console.log(updateQueryDF);

    const { rows: existDfRows } = await DB.executeQuery(
      `SELECT type, description,src_loc_id, externalsystemname , expt_fst_prd_dt ,
       testflag , active, prot_id , vend_id , name, serv_ownr
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
      userId,
      ts,
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
        [DFId, null, null, null, version, key, oldData, newData, userId, ts]
      );
    }

    await DB.executeQuery(
      `INSERT INTO ${schemaName}.cdr_ta_queue
    (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
    VALUES($1, 'CONFIG', $2, 'QUEUE', $3, $3, '', $4, '', 1, '', 0)`,
      [DFId, userId, ts, version]
    );

    if (Object.keys(diffObj).length === 0) {
      // return { sucRes: dataflow };
      return;
    } else {
      newDfobj.ExternalId = externalID;
      newDfobj.ID = DFId;
      newDfobj.name = dataflowObj.name;
      // newDfobj.action = "Dataflow update successfully.";
      // newDfobj.timestamp = ts;
      // dataflow.push(newDfobj);
      return { sucRes: newDfobj };
    }
  } catch (e) {
    console.log(e);
    Logger.error("catch :Dataflow Update");
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
  userId
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
    // var str3 = /[< >]/;
    var str3 = /[\/:*?”<|>]/;

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
        // errorPackage.push(dpResUpdate);
        errorPackage = errorPackage.concat(dpResUpdate);
      }

      if (!helper.stringToBoolean(data.noPackageConfig)) {
        const TypeSas = [];

        //008
        if (typeof data.type != "undefined") {
          TypeSas.push({
            key: "Package type",
            value: data.type,
            type: "string",
          });
        }
        // if (typeof data.sasXptMethod != "undefined") {
        //   TypeSas.push({
        //     key: "sasXptMethod",
        //     value: data.sasXptMethod,
        //     type: "string",
        //   });
        // }
        if (typeof data.namingConvention != "undefined") {
          TypeSas.push({
            key: "namingConvention",
            value: data.namingConvention,
            type: "string",
          });
        }
        if (typeof data.path != "undefined") {
          TypeSas.push({
            key: "p_path",
            value: data.path,
            type: "string",
          });
        }
        if (typeof data.type != "undefined") {
          if (!helper.isPackageType(data.type)) {
            errorPackage.push(
              "Package type supported values : 7Z, ZIP, RAR, SAS"
            );
          }
        }

        let TypeSasRes = helper.validation(TypeSas);

        if (TypeSasRes.length > 0) {
          // errorPackage.push(TypeSasRes);
          errorPackage = errorPackage.concat(TypeSasRes);
        }
      }

      if (data.type) {
        if (data.type.toLowerCase() === "sas") {
          const dpArraySAS = [
            {
              key: "sasXptMethod ",
              value: data.sasXptMethod,
              type: "string",
            },
          ];

          let dpResSas = helper.validation(dpArraySAS);
          if (dpResSas.length > 0) {
            errorPackage = errorPackage.concat(dpResSas);
          }
        }
      }

      if (helper.stringToBoolean(data.noPackageConfig)) {
        if (
          data.type ||
          data.sasXptMethod ||
          data.path ||
          data.namingConvention ||
          data.password
        ) {
          errorPackage.push(
            "if there is no package then type, sasXptMethod, path, namingConvention, password should be blank"
          );
        }
      }

      //ttrrtrtrtrt

      // if (typeof data.type != "undefined") {
      //   if (!helper.isPackageType(data.type)) {
      //     errorPackage.push(
      //       " Package type's supported values : 7Z, ZIP, RAR, SAS "
      //     );
      //   }
      // }
      //091
      if (
        (data.type && !data.namingConvention) ||
        (!data.type && data.namingConvention && data.noPackageConfig === 0)
      ) {
        errorPackage.push(
          "Package type and namingConvention both are required"
        );
      } else {
        if (data.namingConvention) {
          if (typeof data.namingConvention != "undefined") {
            // if (str3.test(data.namingConvention) === true) {
            //   errorPackage.push(
            //     "Package naming convention should not have the following special characters < >"
            //   );
            // }
            const last = data.namingConvention.charAt(
              data.namingConvention.length - 1
            );
            const first = data.namingConvention.charAt(
              data.namingConvention.charAt(0)
            );
            if (str2.test(data.namingConvention) === false) {
              errorPackage.push(
                "Package namingConvention should be end with dot(.) extension"
              );
            } else {
              if (last === "." || first === ".") {
                errorPackage.push(
                  "Dot(.) can't be used start or end of string"
                );
              }
            }
          }

          const nameArray = data.namingConvention.split(".");

          if (nameArray.length > 1) {
            const name = nameArray[1].toLowerCase();
            const nameData = nameArray[0].toLowerCase();

            let nameValidate = this.namingCconventionValidate(nameData);
            if (nameValidate === false) {
              errorPackage.push(
                "Package naming convention should not have the following special characters /:*?”<|>"
              );
            }

            if (data.type) {
              if (data.type.toLowerCase() === "rar") {
                if (name !== "rar") {
                  errorPackage.push(
                    "If Package type is RAR then package naming convention should be end with (.rar)"
                  );
                }
              }

              if (data.type.toLowerCase() === "7z") {
                if (name !== "7z") {
                  errorPackage.push(
                    "If Package type is 7z then package naming convention should be end with (.7z)"
                  );
                }
              }

              if (data.type.toLowerCase() === "zip") {
                if (name !== "zip") {
                  errorPackage.push(
                    "If Package type is Zip then package naming convention should be end with (.zip)"
                  );
                }
              }

              if (data.type.toLowerCase() === "sas") {
                if (name !== "xpt") {
                  errorPackage.push(
                    "If Package type is SAS then package naming convention should be end with (.xpt)"
                  );
                }
              }
            }
          }
        }
      }
    } else {
      if (
        !helper.stringToBoolean(data.noPackageConfig) ||
        !helper.stringToBoolean(data.active)
      ) {
        errorPackage.push("In jdbc noPackageConfig, active should be true");
      }
      if (
        data.type ||
        data.sasXptMethod ||
        data.path ||
        data.namingConvention
      ) {
        errorPackage.push(
          "In jdbc type, sasXptMethod, path, namingConvention should be blank"
        );
      }
    }

    if (errorPackage.length > 0) {
      // errorPackage.splice(0, 0, `Datapackage external id -${externalID} `);
      // return { sucRes: {}, errRes: errorPackage };
      return { errRes: errorPackage };
    }

    let updateQueryDP = `update ${schemaName}.datapackage set updt_tm=NOW()`;
    if (data.type) {
      updateQueryDP += `, type='${data.type}'`;
    }
    if (data.namingConvention) {
      updateQueryDP += `, name='${data.namingConvention}'`;
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
    updateQueryDP += ` where dataflowid='${DFId}' and externalid='${externalID}' returning *;`;

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
          userId,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return;
    } else {
      newObj.ExternalId = externalID;
      newObj.ID = DPId;
      newObj.action = "Datapackage update successfully.";
      // newObj.timestamp = ts;
      // data_packages.push(newObj);

      return { sucRes: newObj, errRes: errorPackage };
    }
  } catch (e) {
    console.log(e);
    Logger.error("catch :Datapackage update");
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
  testFlag,
  userId,
  noPackageConfig,
  dk_id
) => {
  try {
    var LocationType = ConnectionType;
    let ts = new Date().toLocaleString();
    var dataset_update = [];
    var newObj = {};
    const valDataset = [];
    let errorDataset = [];
    var str2 = /[.]/;
    // var str3 = /[< >]/;
    var str3 = /[\/:*?”<|>]/;

    const {
      rows: [protId],
    } = await DB.executeQuery(
      `select prot_id,vend_id from ${schemaName}.dataflow where dataflowid='${DFId}';`
    );

    const study = protId?.prot_id;
    const vendor = protId?.vend_id;
    // console.log("Update vendor", vendor);

    if (data.dataKindID && externalSysName) {
      let checkDataKind = await DB.executeQuery(
        `select datakindid,active from ${schemaName}.datakind where UPPER(extrnl_sys_nm)='${externalSysName.toUpperCase()}' and datakindid='${
          data.dataKindID
        }';`
      );

      // console.log("create", checkDataKind.rows[0]);
      if (checkDataKind.rows.length > 0) {
        if (checkDataKind.rows[0].active !== 1) {
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

    if (data.datasetName) {
      let dkId = dk_id;

      if (data.dataKindID) {
        dkId = data.dataKindID;
      }

      const tFlg = helper.stringToBoolean(testFlag) ? 1 : 0;
      // let selectMnemonic = `select ds.mnemonic from ${schemaName}.dataset ds
      //           left join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
      //           left join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
      //           where ds.mnemonic ='${data.datasetName}'
      //           and ds.datasetid !=$1
      //           and df.testflag ='${tFlg}'`;

      let selectMnemonic = `select ds.mnemonic from ${schemaName}.dataset ds
          inner join ${schemaName}.datapackage dp on (dp.datapackageid =ds.datapackageid)
          inner join ${schemaName}.dataflow df on (df.dataflowid =dp.dataflowid)
          where df.prot_id = '${study}' and df.vend_id = '${vendor}' 
          and UPPER(ds.mnemonic) ='${data.datasetName.toUpperCase()}'
          and ds.datakindid = '${dkId}' 
          and ds.datasetid !=$1 and df.testflag = '${tFlg}'`;

      let queryMnemonic = await DB.executeQuery(selectMnemonic, [DSId]);

      if (queryMnemonic.rows.length > 0) {
        errorDataset.push(
          "In this environment this datasetName(mnemonic) name already Exist!"
        );
      }
    }

    // Request Filed validation loop

    if (helper.isSftp(LocationType)) {
      // if (LocationType === "Hive CDH") {

      if (typeof data.datasetName != "undefined") {
        valDataset.push({
          key: "datasetName ",
          value: data.datasetName,
          type: "string",
        });
      }
      if (typeof data.dataKindID != "undefined") {
        valDataset.push({
          key: "dataKindID ",
          value: data.dataKindID,
          type: "string",
        });
      }
      if (typeof data.fileType != "undefined") {
        valDataset.push({
          key: "fileType ",
          value: data.fileType,
          type: "string",
        });

        if (data.fileType) {
          if (!helper.isFileType(data.fileType)) {
            errorDataset.push(
              "fileType supported values : EXCEL, DELIMITED, FIXED WIDTH, SAS"
            );
          }
        }
      }
      if (typeof data.fileNamingConvention != "undefined") {
        valDataset.push({
          key: "fileNamingConvention ",
          value: data.fileNamingConvention,
          type: "string",
        });
      }
      //099
      if (
        (data.fileType && !data.fileNamingConvention) ||
        (!data.fileType && data.fileNamingConvention)
      ) {
        errorDataset.push(
          "Dataset fileType and fileNamingConvention both are required"
        );
      } else {
        if (data.fileNamingConvention) {
          // if (str3.test(data.fileNamingConvention) === true) {
          //   errorDataset.push(
          //     "fileNamingConvention should not have the following special characters < >"
          //   );
          // }
          const last = data.fileNamingConvention.charAt(
            data.fileNamingConvention.length - 1
          );
          const first = data.fileNamingConvention.charAt(
            data.fileNamingConvention.charAt(0)
          );
          if (str2.test(data.fileNamingConvention) === false) {
            errorDataset.push(
              "fileNamingConvention should be end with dot(.) extension"
            );
          } else {
            if (last === "." || first === ".") {
              errorDataset.push("Dot(.) can't be used start or end of string");
            }
          }

          const nameArray = data.fileNamingConvention.split(".");

          if (nameArray.length > 1) {
            const name = nameArray[1].toLowerCase();
            const nameData = nameArray[0].toLowerCase();

            let nameValidate = this.namingCconventionValidate(nameData);
            if (nameValidate === false) {
              errorDataset.push(
                "File naming convention should not have the following special characters /:*?”<|>"
              );
            }

            if (data.fileType) {
              if (data.fileType.toLowerCase() === "sas") {
                if (name !== "sas7bdat") {
                  errorDataset.push(
                    "If fileType SAS then fileNamingConvention should be end with (.sas7bdat)"
                  );
                }
              }

              if (data.fileType.toLowerCase() === "fixed width") {
                if (name !== "txt") {
                  errorDataset.push(
                    "If fileType FIXED WIDTH then fileNamingConvention should be end with (.txt)"
                  );
                }
              }

              if (data.fileType.toLowerCase() === "excel") {
                if (name !== "xls" && name !== "xlsx") {
                  errorDataset.push(
                    "If fileType EXCEL then fileNamingConvention should be end with (.xls or .xlsx)"
                  );
                }
              }

              if (data.fileType.toLowerCase() === "delimited") {
                if (name !== "csv" && name !== "txt") {
                  errorDataset.push(
                    "If fileType Delimited then fileNamingConvention should be end with (.csv or .txt)"
                  );
                }
              }
            }
          }
        }
      }

      if (typeof data.path != "undefined") {
        if (noPackageConfig === 1) {
          valDataset.push({
            key: "path ",
            value: data.path,
            type: "string",
          });
        }
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
          errorDataset.push("dataTransferFrequency must be greater than zero ");
        }
      }
      if (typeof data.columncount != "undefined") {
        valDataset.push({
          key: "columncount ",
          value: data.columncount,
          type: "number",
        });
        // point - 28 story - 7277
        if (data.columncount === 0) {
          errorDataset.push(
            "Data set column count should be minimum 1 or greater than 1. Please amend."
          );
        }
      }
      if (typeof data.active != "undefined") {
        valDataset.push({
          key: "active ",
          value: data.active,
          type: "boolean",
        });
      }
      if (typeof data.incremental != "undefined") {
        valDataset.push({
          key: "incremental ",
          value: data.incremental,
          type: "boolean",
        });
      }

      let dataSetRes = helper.validation(valDataset);

      if (dataSetRes.length > 0) {
        // errorDataset.push(dataSetRes);
        errorDataset = errorDataset.concat(dataSetRes);
      }

      if (data.headerRowNumber) {
        if (typeof data.headerRowNumber != "number") {
          errorDataset.push(
            "In SFTP/FTPS headerRowNumber is Optional and data type should be Number"
          );
        }
      }

      if (data.footerRowNumber) {
        if (typeof data.footerRowNumber != "number") {
          errorDataset.push(
            "In SFTP/FTPS footerRowNumber is Optional and data type should be Number"
          );
        }
      }

      if (data.OverrideStaleAlert) {
        if (typeof data.OverrideStaleAlert != "number") {
          errorDataset.push(
            "In SFTP/FTPS OverrideStaleAlert is Optional and data type should be Number"
          );
        }
      }

      if (data.fileType) {
        if (data.fileType.toLowerCase() === "delimited") {
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
          if (typeof data.escapeCharacter != "undefined") {
            dlData.push({
              key: "escapeCharacter ",
              value: data.escapeCharacter,
              type: "string",
            });
          }

          let dlRes = helper.validation(dlData);
          if (dlRes.length > 0) {
            // errorDataset.push(dlRes);
            errorDataset = errorDataset.concat(dlRes);
          }
        }
      }

      if (
        data.customsql_yn ||
        data.customsql_yn === 0 ||
        data.customsql ||
        data.conditionalExpression ||
        // data.incremental ||
        // data.incremental === 0 ||
        data.offsetcolumn ||
        data.offset_val
      ) {
        errorDataset.push(
          "For SFTP/FTPS, customsql_yn, customsql, conditionalExpression, offsetcolumn, offset_val fields should be blank "
        );
      }
    } else {
      if (typeof data.datasetName != "undefined") {
        valDataset.push({
          key: "datasetName ",
          value: data.datasetName,
          type: "string",
        });
      }
      if (typeof data.dataKindID != "undefined") {
        valDataset.push({
          key: "dataKindID ",
          value: data.dataKindID,
          type: "string",
        });
      }
      if (typeof data.columncount != "undefined") {
        valDataset.push({
          key: "columncount ",
          value: data.columncount,
          type: "number",
        });

        if (data.columncount === 0) {
          errorDataset.push(
            "Data set column count should be minimum 1 or greater than 1. Please amend"
          );
        }
      }
      if (typeof data.customsql_yn != "undefined") {
        valDataset.push({
          key: "customsql_yn ",
          value: data.customsql_yn,
          type: "boolean",
        });
      }

      let dataSetRes = helper.validation(valDataset);

      if (dataSetRes.length > 0) {
        // errorDataset.push(dataSetRes);
        errorDataset = errorDataset.concat(dataSetRes);
      }

      if (
        data.type ||
        data.fileNamingConvention ||
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
        data.escapeCharacter ||
        data.encoding
      ) {
        errorDataset.push(
          "In jdbc dataset level type, fileNamingConvention, delimiter, quote, rowDecreaseAllowed, dataTransferFrequency, path, escapeCharacter, headerRowNumber, footerRowNumber, overrideStaleAlert, encoding should be blank "
        );
      }

      if (data.customsql_yn) {
        if (helper.stringToBoolean(data.customsql_yn)) {
          if (!data.customsql) {
            errorDataset.push("customsql is required");
          } else {
            if (data.customsql.length >= 131072) {
              errorDataset.push("customsql Max of 131072 characters");
            }
          }
        }
        if (!helper.stringToBoolean(data.customsql_yn)) {
          if (!data.tbl_nm) {
            errorDataset.push("tbl_nm is required");
          } else {
            if (data.tbl_nm.length >= 255) {
              errorDataset.push("tbl_nm max of 255 characters");
            }
          }
          if (data.incremental) {
            if (helper.stringToBoolean(data.incremental)) {
              if (!data.offsetcolumn) {
                errorDataset.push(
                  "offsetcolumn is required and data type should be string"
                );
              }
            }
          }
        }
      }
    }

    if (errorDataset.length > 0) {
      // errorDataset.splice(0, 0, `DataSet external id -${externalID} `);
      // return { sucRes: {}, errRes: errorDataset };
      return { errRes: errorDataset };
    }

    let sqlQuery = custSql;
    if (data.customsql_yn) {
      if (!helper.stringToBoolean(data.customsql_yn)) {
        if (data.columnDefinition?.length > 0) {
          const cList = data.columnDefinition.map((el) => el.columnName);
          sqlQuery = helper.createCustomSql(
            cList,
            data.tbl_nm,
            data.conditionalExpression
          );
        }
      } else {
        sqlQuery = data.customsql;
      }
    }

    let updateQueryDS = `UPDATE ${schemaName}.dataset set updt_tm=NOW() `;

    if (data.dataKindID) {
      updateQueryDS += `,datakindid='${data.dataKindID}'`;
    }
    if (data.datasetName) {
      updateQueryDS += `,mnemonic='${data.datasetName}'`;
    }
    if (data.fileNamingConvention) {
      updateQueryDS += `,name='${data.fileNamingConvention}'`;
    }
    if (data.columncount) {
      updateQueryDS += `,columncount='${data.columncount}'`;
    }
    if (typeof data.incremental != "undefined") {
      updateQueryDS += `,incremental='${
        helper.stringToBoolean(data.incremental) ? "Y" : "N"
      }'`;
    }
    if (data.offsetcolumn) {
      updateQueryDS += `,offsetcolumn='${data.offsetcolumn}'`;
    }
    if (data.fileType) {
      updateQueryDS += `,type='${data.fileType}'`;
    }
    if (data.path) {
      updateQueryDS += `,path='${data.path}'`;
    }
    if (data.OverrideStaleAlert) {
      updateQueryDS += `,ovrd_stale_alert='${data.OverrideStaleAlert}'`;
    }
    if (data.headerRowNumber || data.headerRowNumber === 0) {
      updateQueryDS += `,headerrow='${data.headerRowNumber}'`;
      updateQueryDS += `,headerrownumber='${data.headerRowNumber}'`;
    }
    if (data.footerRowNumber) {
      updateQueryDS += `,footerrow='${data.footerRowNumber}'`;
      updateQueryDS += `,footerrownumber='${data.footerRowNumber}'`;
    }
    if (data.customsql) {
      updateQueryDS += `,customsql='${sqlQuery}'`;
    }

    if (typeof data.customsql_yn != "undefined") {
      updateQueryDS += `,customsql_yn='${data.customsql_yn}'`;
    }
    if (data.tbl_nm) {
      updateQueryDS += `,tbl_nm='${data.tbl_nm}'`;
    }
    if (data.delimiter) {
      updateQueryDS += `,delimiter='${data.delimiter}'`;
    }
    if (data.escapeCharacter) {
      updateQueryDS += `,escapecode='${helper.convertEscapeChar(
        data.escapeCharacter
      )}'`;
    }
    if (data.encoding) {
      updateQueryDS += `,charset='${helper.convertEscapeChar(data.encoding)}'`;
    }
    if (data.offset_val) {
      updateQueryDS += `,offset_val='${helper.convertEscapeChar(
        data.offset_val
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
    if (data.conditionalExpression) {
      updateQueryDS += `,dataset_fltr='${data.conditionalExpression}'`;
    }

    updateQueryDS += ` where datapackageid='${DPId}' and externalid='${externalID}' returning *;`;

    // console.log(updateQueryDS);

    const { rows: existDSRows } = await DB.executeQuery(
      `SELECT datakindid , mnemonic, name, columncount, incremental, offsetcolumn , type, 
       path, ovrd_stale_alert ,headerrow , headerrownumber ,footerrow , footerrownumber ,
       customsql ,customsql_yn , tbl_nm , delimiter, escapecode, charset, offset_val ,quote, 
       rowdecreaseallowed , data_freq,dataset_fltr from ${schemaName}.dataset where datapackageid='${DPId}' and externalid='${externalID}';`
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
          userId,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return;
    } else {
      newObj.ExternalId = externalID;
      newObj.ID = DSId;
      newObj.action = "Dataset update successfully.";
      // newObj.timestamp = ts;
      // dataset_update.push(newObj);

      return { sucRes: newObj, errRes: errorDataset };
    }
  } catch (e) {
    console.log(e);
    Logger.error("catch :Dataset update");
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
  userId,
  DSheaderRow,
  oldDataType,
  oldFormat
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
      if (typeof data.columnName != "undefined") {
        valColDef.push({
          key: "columnName ",
          value: data.columnName,
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
            "dataType's Supported values : Numeric, Alphanumeric or Date"
          );
        }
      }

      //plo
      // if ((data.dataType && !data.format) || (!data.dataType && data.format)) {
      //   errorcolDef.push("dataType and format both are required");
      // } else {
      //   if (data.dataType.toLowerCase() === "alphanumeric") {
      //     if (helper.isAlphaNumeric(data.format) === false) {
      //       errorcolDef.push(
      //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
      //       );
      //     }
      //   }
      //   if (data.dataType.toLowerCase() === "numeric") {
      //     if (helper.isNumbers(data.format) === false) {
      //       errorcolDef.push(
      //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
      //       );
      //     }
      //   }
      //   if (data.dataType.toLowerCase() === "date") {
      //     if (helper.isValidDate(data.format) === false) {
      //       errorcolDef.push(
      //         "Data Set Column Format should have '\\ and $ are not allowed' for Date Data Type. Please amend."
      //       );
      //     }
      //   }
      // }

      if (data.dataType && data.format) {
        const validate = dataTyperForamtValidate(data.dataType, data.format);
        if (validate) {
          errorcolDef.push(validate);
        }
      } else {
        if (oldDataType && data.format) {
          const validate = dataTyperForamtValidate(oldDataType, data.format);
          if (validate) {
            errorcolDef.push(["Format is not matching with existing DataType"]);
          }
        }

        if (data.dataType && oldFormat) {
          const validate = dataTyperForamtValidate(data.dataType, oldFormat);
          if (validate) {
            errorcolDef.push([
              "DataType is not matching with existing format value",
            ]);
          }
        }
      }

      if (data.position || data.position === 0) {
        if (typeof data.position != "number") {
          errorcolDef.push(
            "In SFTP/FTPS position is Optional and data type should be Number"
          );
        } else {
          if (data.position === 0) {
            errorcolDef.push(
              "Position must be equal to 1 or greater with no decimals. Please amend."
            );
          }
        }
      }

      if (!DSheaderRow) {
        if (!data.position) {
          errorcolDef.push(
            "When Header row is not provided, then column Position must be provided."
          );
        }
      }

      if (data.minLength) {
        if (typeof data.minLength != "number") {
          errorcolDef.push(
            "In SFTP/FTPS minLength is Optional and data type should be Number"
          );
        }
      }
      if (data.maxLength || data.maxLength === 0) {
        if (typeof data.maxLength != "number") {
          errorcolDef.push(
            "In SFTP/FTPS maxLength is Optional and data type should be Number"
          );
        } else {
          if (data.maxLength >= 10001) {
            errorcolDef.push(
              "Max Length must be between values of 1 and 10,000. Please amend."
            );
          }
          if (data.maxLength === 0) {
            errorcolDef.push(
              "Max Length must be between values of 1 and 10,000. Please amend."
            );
          }
        }
      }

      //dadadda

      if (data.minLength) {
        if (
          typeof data.minLength != "undefined" &&
          typeof data.maxLength != "undefined"
        ) {
          if (data.minLength >= data.maxLength) {
            errorcolDef.push("minLength always less than maxLength");
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

        // if (str1.test(data.lov) === false) {
        //   errorcolDef.push("LOV should be seperated by tilde(~)");
        // } else {
        if (last === "~" || first === "~") {
          errorcolDef.push("Tilde(~) can't be used start or end of string");
        }
        // }
      }

      let colDefRes = helper.validation(valColDef);

      if (colDefRes.length > 0) {
        // errorcolDef.push(colDefRes);
        errorcolDef = errorcolDef.concat(colDefRes);
      }
    } else {
      if (typeof data.columnName != "undefined") {
        valColDef.push({
          key: "columnName",
          value: data.columnName,
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
            "dataType's Supported values : Numeric, Alphanumeric or Date"
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
        // errorcolDef.push(colDefRes);
        errorcolDef = errorcolDef.concat(colDefRes);
      }

      //last add
      // if ((data.dataType && !data.format) || (!data.dataType && data.format)) {
      //   errorcolDef.push("dataType and format both are required");
      // } else {
      //   if (data.dataType.toLowerCase() === "alphanumeric") {
      //     if (helper.isAlphaNumeric(data.format) === false) {
      //       errorcolDef.push(
      //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
      //       );
      //     }
      //   }
      //   if (data.dataType.toLowerCase() === "numeric") {
      //     if (helper.isNumbers(data.format) === false) {
      //       errorcolDef.push(
      //         "Data Set Column Format should have valid format with % or n or X combinations for Alphanumeric Data Type or % or n for Numeric Data Type inside <> to indicate variable part. Please amend."
      //       );
      //     }
      //   }
      //   if (data.dataType.toLowerCase() === "date") {
      //     if (helper.isValidDate(data.format) === false) {
      //       errorcolDef.push(
      //         "Data Set Column Format should have '\\ and $ are not allowed' for Date Data Type. Please amend."
      //       );
      //     }
      //   }
      // }

      if (data.dataType && data.format) {
        const validate = dataTyperForamtValidate(data.dataType, data.format);
        if (validate) {
          errorcolDef.push(validate);
        }
      } else {
        if (oldDataType && data.format) {
          const validate = dataTyperForamtValidate(oldDataType, data.format);
          if (validate) {
            errorcolDef.push(["Format is not matching with existing DataType"]);
          }
        }

        if (data.dataType && oldFormat) {
          const validate = dataTyperForamtValidate(data.dataType, oldFormat);
          if (validate) {
            errorcolDef.push(["DataType is not matching with existing format"]);
          }
        }
      }

      if (
        data.minLength ||
        data.minLength === 0 ||
        data.maxLength ||
        data.maxLength === 0 ||
        data.lov ||
        data.position
      ) {
        errorcolDef.push(
          "For JBDC minLength, maxLength, lov, position fields should be Blank"
        );
      }
    }

    if (data.columnName) {
      let clName = await DB.executeQuery(
        `select name from ${schemaName}.columndefinition where datasetid='${DSId}' and columnid !='${cdId}' and name='${data.columnName}';`
      );
      if (clName.rows.length > 0) {
        errorcolDef.push(
          "Column Names (Headers) must be unique in a data set file structure. Please amend."
        );
      }
    }

    if (errorcolDef.length > 0) {
      // errorcolDef.splice(0, 0, `Column Definition Id -${externalId} `);
      // return { sucRes: {}, errRes: errorcolDef };
      return { errRes: errorcolDef };
    }

    // columndefinition(datasetid,columnid,name,datatype,
    //               primarykey,required,charactermin,charactermax,position,format,lov, "unique", requiredfield,
    //               insrt_tm, updt_tm, externalid

    let updateQueryCD = `UPDATE ${schemaName}.columndefinition set updt_tm=NOW() `;

    if (data.columnName) {
      updateQueryCD += `,name='${data.columnName}'`;
    }
    if (data.dataType) {
      updateQueryCD += `,datatype='${data.dataType}'`;
    }
    if (data.minLength) {
      updateQueryCD += `,charactermin='${data.minLength}'`;
    }
    if (data.maxLength) {
      updateQueryCD += `,charactermax='${data.maxLength}'`;
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
    if (data.variableLabel) {
      updateQueryCD += `,variable='${data.variableLabel}'`;
    }

    updateQueryCD += ` where datasetid='${DSId}' and externalid='${externalId}' returning *;`;

    // console.log(updateQueryCD);

    const { rows: existCDRows } = await DB.executeQuery(
      `SELECT name, datatype, charactermin,charactermax,primarykey,required,"unique",position,
      format, lov, variable from ${schemaName}.columndefinition where datasetid='${DSId}' and externalid='${externalId}';`
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
          userId,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return;
    } else {
      newObj.ExternalId = externalId;
      newObj.ID = cdId;
      newObj.action = "Column Defination update successfully.";
      // newObj.timestamp = ts;
      // colDef_update.push(newObj);

      return { sucRes: newObj, errRes: errorcolDef };
    }
  } catch (err) {
    console.log(err);
    Logger.error("catch : Column Definition update");
    Logger.error(err);
  }
};

exports.vlcUpdate = async (vl, qcType, DFId, DPId, DSId, version, userId) => {
  try {
    // uuuuuuuuuuuu
    let ts = new Date().toLocaleString();
    var vlc_update = [];
    var newObj = {};
    const vlcValidate = [];
    let errorVlc = [];
    let errorArray = [];

    if (typeof vl.runSequence != "undefined") {
      vlcValidate.push({
        key: "runSequence",
        value: vl.runSequence,
        type: "number",
      });
    }
    if (typeof vl.conditionalExpression != "undefined") {
      vlcValidate.push({
        key: "conditionalExpression",
        value: vl.conditionalExpression,
        type: "string",
      });
    }
    if (typeof vl.action != "undefined") {
      vlcValidate.push({
        key: "action",
        value: vl.action,
        type: "string",
      });
    }
    if (typeof vl.inUse != "undefined") {
      vlcValidate.push({
        key: "inUse",
        value: vl.inUse,
        type: "string",
      });
    }
    let vlcRes = helper.validation(vlcValidate);

    if (vlcRes.length > 0) {
      // errorVlc.push(vlcRes);
      errorVlc = errorVlc.concat(vlcRes);
    }

    if (vl.inUse) {
      if (!helper.isActive(vl.inUse)) {
        // hhhhhhhh44
        errorVlc.push("inUse field's Supported values : Y or N ");
      }
    }
    if (vl.action) {
      if (!helper.isAction(vl.action)) {
        errorVlc.push("action's Supported values : Reject or Report");
      }
      if (vl.action.toLowerCase() === "report") {
        const rVlcArr = [
          {
            key: "errorMessage",
            value: vl.errorMessage,
            type: "string",
          },
        ];

        let rVclres = helper.validation(rVlcArr);
        if (rVclres.length > 0) {
          // errorVlc.push(rVclres);
          errorVlc = errorVlc.concat(rVclres);
        }
      }
    }

    if (errorVlc.length > 0) {
      // errorVlc.splice(
      //   0,
      //   0,
      //   `VLC Conditional Expression Number -${vl.conditionalExpressionNumber}`
      // );
      // return { sucRes: {}, errRes: errorVlc };
      return { errRes: errorVlc };
    }

    //heeheheheh
    let updateQueryVLC = `UPDATE ${schemaName}.dataset_qc_rules set updated_dttm=NOW(),updated_by_user='${userId}' `;

    // ruleseq, action, ruleexpr, errormessage, active_yn;
    if (vl.runSequence) {
      updateQueryVLC += `,ruleseq='${vl.runSequence}'`;
    }
    if (vl.action) {
      updateQueryVLC += `,action='${vl.action}'`;
    }
    if (vl.conditionalExpression) {
      updateQueryVLC += `,ruleexpr='${vl.conditionalExpression}'`;
    }
    if (vl.errorMessage) {
      updateQueryVLC += `,errormessage='${vl.errorMessage}'`;
    }
    if (vl.inUse) {
      updateQueryVLC += `,active_yn='${vl.inUse.toUpperCase()}'`;
    }

    updateQueryVLC += ` where datasetid='${DSId}' and ext_ruleid='${vl.conditionalExpressionNumber}' returning *;`;

    // console.log(updateQueryCD);

    const { rows: existVLCRows } = await DB.executeQuery(
      `SELECT ruleseq, action, ruleexpr,errormessage,active_yn from ${schemaName}.dataset_qc_rules
       where datasetid='${DSId}' and ext_ruleid='${vl.conditionalExpressionNumber}';`
    );

    const existVlc = existVLCRows[0];
    const vlcUpdate = await DB.executeQuery(updateQueryVLC);
    const vlcfObj = vlcUpdate.rows[0];
    const diffObj = helper.getdiffKeys(existVlc, vlcfObj);

    // console.log("dada", diffObj);

    for (let key of Object.keys(diffObj)) {
      let oldData = diffObj[key];
      let newData = vlcfObj[key];
      await DB.executeQuery(
        `INSERT INTO ${schemaName}.dataflow_audit_log
                        ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
        [
          DFId, // DFId, DPId, dsUid, version, userId
          DPId,
          DSId,
          null,
          version,
          key,
          oldData,
          newData,
          userId,
          helper.getCurrentTime(),
        ]
      );
    }

    if (Object.keys(diffObj).length === 0) {
      return;
    } else {
      newObj.conditionalExpressionNumber = vl.conditionalExpressionNumber;
      newObj.ID = vlcUpdate.rows[0].dsqcruleid;
      newObj.action = "VLC update successfully.";
      // newObj.timestamp = ts;
      // vlc_update.push(newObj);

      return { sucRes: newObj, errRes: errorVlc };
    }
  } catch (err) {
    console.log(err);
    Logger.error("catch : VLC update");
    Logger.error(err);
  }
};

exports.removeDataflow = async (
  DFId,
  externalID,
  version,
  externalSysName,
  conf_data,
  userId
) => {
  try {
    let ts = new Date().toLocaleString();
    var dataflow = [];

    const deleteQueryDF = `update ${schemaName}.dataflow set updt_tm=NOW(),refreshtimestamp=NOW(),updated_by_user='${userId}', del_flg=1 where dataflowid='${DFId}' `;
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

    const deleteQc = `update ${schemaName}.dataset_qc_rules set updated_dttm=NOW(), active_yn='N' where dataflowid ='${DFId}'`;
    const qcDelete = await DB.executeQuery(deleteQc);

    let newDfobj = {
      ExternalId: externalID,
      ID: DFId,
      action: "Data Flow Removed successfully.",
      // timestamp: ts,
    };
    // newDfobj.timestamp = ts;
    // dataflow.push(newDfobj);

    // Version Table enrty
    let dataflow_version_query = `INSERT INTO ${schemaName}.dataflow_version
        ( dataflowid, "version", config_json, created_by, created_on)
        VALUES($1,$2,$3,$4,$5);`;
    let aduit_version_body = [
      DFId,
      version,
      JSON.stringify(conf_data),
      userId,
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
        userId,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: newDfobj };
  } catch (err) {
    console.log(err);
    Logger.error("catch : DataFlow Removed");
    Logger.error(err);
  }
};

exports.removeDataPackage = async (externalID, DPID, DFId, version, userId) => {
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

    const deleteQc = `update ${schemaName}.dataset_qc_rules set updated_dttm=NOW(), active_yn='N' where dataflowid ='${DFId}'`;
    const qcDelete = await DB.executeQuery(deleteQc);

    newDfobj.ExternalId = externalID;
    newDfobj.ID = DPID;
    newDfobj.action = "Data Package Removed successfully.";
    // newDfobj.timestamp = ts;
    // dataPackage.push(newDfobj);

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
        userId,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: newDfobj };
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
  userId
) => {
  try {
    let ts = new Date().toLocaleString();
    var dataSet = [];
    var newDfobj = {};

    const deleteQueryDS = `update ${schemaName}.dataset set updt_tm=NOW(), del_flg=1 where datasetid='${DSID}';`;
    const removeDs = await DB.executeQuery(deleteQueryDS);

    const deleteQueryCD = `update ${schemaName}.columndefinition set updt_tm=NOW(), del_flg=1 where datasetid='${DSID}';`;
    const removeCd = await DB.executeQuery(deleteQueryCD);

    const deleteQc = `update ${schemaName}.dataset_qc_rules set updated_dttm=NOW(), active_yn='N' where dataflowid ='${DFId}'`;
    const qcDelete = await DB.executeQuery(deleteQc);

    newDfobj.ExternalId = externalID;
    newDfobj.ID = DSID;
    newDfobj.action = "Data Set Removed successfully.";
    // newDfobj.timestamp = ts;
    // dataSet.push(newDfobj);

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
        userId,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: newDfobj };
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
  userId
) => {
  try {
    let ts = new Date().toLocaleString();
    var ColumnDefinition = [];
    var newDfobj = {};

    const deleteQueryCD = `update ${schemaName}.columndefinition set updt_tm=NOW(), del_flg=1 where columnid='${cdId}';`;
    const removeCd = await DB.executeQuery(deleteQueryCD);

    newDfobj.ExternalId = externalID;
    newDfobj.ID = cdId;
    newDfobj.action = "Column Definition Removed successfully.";
    // newDfobj.timestamp = ts;
    // ColumnDefinition.push(newDfobj);

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
        userId,
        helper.getCurrentTime(),
      ]
    );

    return { sucRes: newDfobj };
  } catch (err) {
    console.log(err);
    Logger.error("catch : Column Def Removed ");
    Logger.error(err);
  }
};

const dfRollBack = (exports.dataflowRollBack = async (dfid) => {
  try {
    await DB.executeQuery(
      `delete from ${schemaName}.dataflow_audit_log where dataflowid ='${dfid}';`
    );
    await DB.executeQuery(
      `delete from ${schemaName}.dataset_qc_rules where dataflowid ='${dfid}';`
    );
    await DB.executeQuery(
      `delete from ${schemaName}.cdr_ta_queue where dataflowid ='${dfid}';`
    );
    await DB.executeQuery(
      `delete from ${schemaName}.dataflow_version where dataflowid ='${dfid}';`
    );
    const { rows: packagesIds } = await DB.executeQuery(
      `select datapackageid from ${schemaName}.datapackage where dataflowid='${dfid}';`
    );
    //Get Dataset data and column data delete
    for (let item of packagesIds) {
      const { rows: datasetsIds } = await DB.executeQuery(
        `select datasetid from ${schemaName}.dataset where datapackageid='${item.datapackageid}';`
      );
      for (let item of datasetsIds) {
        await DB.executeQuery(
          `delete from ${schemaName}.columndefinition where datasetid ='${item.datasetid}';`
        );
      }
      // Dataset data delete
      await DB.executeQuery(
        `delete from ${schemaName}.dataset where datapackageid ='${item.datapackageid}';`
      );
    }
    await DB.executeQuery(
      `delete from ${schemaName}.datapackage where dataflowid ='${dfid}';`
    );
    await DB.executeQuery(
      `delete from ${schemaName}.dataflow where dataflowid ='${dfid}';`
    );
    return;
  } catch (err) {
    console.log(err);
    Logger.error("catch : Dataflow Roll Back");
    Logger.error(err);
  }
});
