const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");
const helper = require("../helpers/customFunctions");
const { trim } = require("lodash");
// const { forEach } = require("lodash");
const _ = require("lodash");
const logger = require("../config/logger");

// const joi = require("joi");

const endpoint = process.env.VAULT_END_POINT;
const token = process.env.ROOT_TOKEN;

const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: endpoint,
  token: token,
});

const getAlphaNumeric = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (var i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.generateUniqueID = function () {
  return getAlphaNumeric();
  // const unique_id = uuid();
  // return unique_id.slice(0, 16);
};
exports.createUniqueID = () => {
  return getAlphaNumeric();
  // return crypto.randomBytes(3 * 4).toString("base64");
};
exports.getCurrentTime = () => {
  return moment().utc().format("YYYY-MM-DD HH:mm:ss");
};

exports.readVaultData = async (vaultPath) => {
  try {
    const res = await vault.read(`kv/${vaultPath}`);
    if (res.data) {
      return res.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

exports.writeVaultData = async (vaultPath, data) => {
  try {
    await vault.write(`kv/${vaultPath}`, data);
    return true;
  } catch (error) {
    logger.error("vault error", error);
    return false;
  }
};

exports.deleteVaultData = async (vaultPath) => {
  try {
    await vault.delete(vaultPath);
    return true;
  } catch (error) {
    logger.error("vault error", error);
    return false;
  }
};

const stringToBoolean = (exports.stringToBoolean = (string) => {
  switch (string?.toString().toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return "not_boolean";
  }
});

exports.convertEscapeChar = (str) => {
  return str ? String.raw`${str}`.replace(/'%\'/g, "\\\\") : "\\";
  // return str ? String.raw`${str}`.replace(/\\/g, "\\\\") : "";
};

exports.validation = (data) => {
  let msg = [];
  data.forEach((val) => {
    if (val.type == "boolean") {
      val.value = stringToBoolean(val.value);
    }

    if (
      val.value !== null &&
      val.value !== "" &&
      val.value !== undefined &&
      typeof val.value === val.type
    ) {
      if (val.maxLength && val.value.length > val.maxLength) {
        msg.push(`${val.key} should be less than ${val.maxLength} characters`);
      }
      // console.log(val.key);
    } else {
      if (val.key === "p_path") {
        msg.push(`If Package is opted, then Package Path is mandatory`);
      } else {
        msg.push(`${val.key} is required and data type should be ${val.type}`);
      }
    }
  });
  // console.log(msg);
  return msg;
};

let isEmpty = (exports.isEmpty = (arr) =>
  Array.isArray(arr) && arr.every(isEmpty));

exports.getdiffKeys = (newObj, oldObj) => {
  // console.log("line 131");
  if (
    typeof newObj === "object" &&
    !Array.isArray(newObj) &&
    newObj !== null &&
    typeof oldObj === "object" &&
    !Array.isArray(oldObj) &&
    oldObj !== null
  ) {
    return _.pickBy(newObj, (v, k) => !_.isEqual(oldObj[k], v));
  }
  return {};
};

exports.isSftp = (str = "") => {
  return ["SFTP", "FTPS"].includes(str.toUpperCase());
};

exports.isPackageType = (str) => {
  return ["7Z", "ZIP", "RAR", "SAS"].includes(str.toUpperCase());
};

exports.isFileType = (str) => {
  return ["EXCEL", "DELIMITED", "FIXED WIDTH", "SAS"].includes(
    str.toUpperCase()
  );
};

exports.isColumnType = (str) => {
  return ["alphanumeric", "numeric", "date"].includes(str.toLowerCase());
};

exports.isEncoding = (str) => {
  return ["wlatin1", "utf-8"].includes(str.toLowerCase());
};

exports.isActive = (str) => {
  return ["y", "n"].includes(str.toLowerCase());
};

exports.isAction = (str) => {
  return ["reject", "report"].includes(str.toLowerCase());
};

exports.isConnectionType = (str) => {
  return [
    "SFTP",
    "FTPS",
    "ORACLE",
    "HIVE CDP",
    "HIVE CDH",
    "IMPALA",
    "MYSQL",
    "POSTGRESQL",
    "SQL SERVER",
  ].includes(str.toUpperCase());
};

exports.createCustomSql = (clname, tableName, condition) => {
  sqlQuery = `Select ${clname
    .map((d) => `"${d}"`)
    .join(", ")} from ${tableName} ${condition ? condition : "where 1=1"}`;

  return sqlQuery;
};
exports.formatDBColumns = (data, driver = null) => {
  if (!data) return [];
  return data?.map((d) => {
    if (
      driver &&
      driver.includes("postgresql") &&
      d.datatype === "time without time zone"
    ) {
      d.datatype = "character varying";
    }
    return {
      columnName: d.columnName || d.Field || d.col_name,
      datatype: d.dataType || d.datatype || d.Type || d.data_type,
      primaryKey: stringToBoolean(d.primaryKey || d.Key === "PRI"),
      required: stringToBoolean(d.required || d.Null === "NO"),
      unique: stringToBoolean(d.unique || false),
    };
  });
};
exports.formatDBTables = (data) => {
  if (!data) return [];
  return data?.map((d) => {
    return {
      tableName: d.tableName || d.tab_name || "",
    };
  });
};

exports.generateConnectionURL = (
  locType,
  hostName,
  port,
  dbName,
  warehouse = "",
  schema = ""
) => {
  if (!locType || !hostName) {
    return "";
  }
  if (locType != "" && (locType === "SFTP" || locType === "FTPS")) {
    return hostName;
  }
  if (locType === "Hive CDP" || locType === "Hive CDH") {
    const transportMode = locType === "Hive CDP" ? "http" : "https";
    return port && dbName
      ? `jdbc:hive2://${hostName}:${port}/${dbName};transportMode=${transportMode};httpPath=cliservice;ssl=1;AllowSelfSignedCerts=1;AuthMech=3`
      : "";
  }
  if (locType === "Oracle") {
    return port && dbName
      ? `jdbc:oracle:thin:@${hostName}:${port}:${dbName}`
      : "";
  }
  if (locType === "MySQL") {
    return port && dbName ? `jdbc:mysql://${hostName}:${port}/${dbName}` : "";
  }
  if (locType === "SQL Server") {
    return port && dbName
      ? `jdbc:sqlserver://${hostName}:${port};databaseName=${dbName}`
      : "";
  }
  if (locType === "SQL Server Dynamic Port") {
    return dbName ? `jdbc:sqlserver://${hostName};databaseName=${dbName}` : "";
  }
  if (locType === "PostgreSQL") {
    return port && dbName
      ? `jdbc:postgresql://${hostName}:${port}/${dbName}`
      : "";
  }
  if (locType === "Impala") {
    return port
      ? `jdbc:impala://${hostName}:${port}/${dbName};ssl=1;AllowSelfSignedCerts=1;AuthMech=3`
      : "";
  }
  if (locType === "Azure – SQL Server") {
    return port && dbName
      ? `jdbc:sqlserver://${hostName}:${port};databaseName=${dbName}`
      : "";
  }
  if (locType === "Azure - Snowflake") {
    return port && dbName && warehouse && schema
      ? `jdbc:snowflake://${hostName}:${port}/?db=${dbName}&warehouse=${warehouse}&schema=${schema}`
      : "";
  }
  if (locType && hostName && port && dbName) {
    return `jdbc:${locType}://${hostName}:${port}/${dbName}`;
  }

  return "";
};

exports.isAlphaNumeric = (val) => {
  const regexp = /^[a-zA-Z0-9~_\s]+$/gi;
  if (regexp.test(val)) {
    return true;
  }
  return false;
};
exports.isNumbers = (value) => {
  const regexp = /^[0-9\b]+$/;
  if (value && !regexp.test(value)) {
    return false;
  }
  return true;
};

exports.isValidDate = (value) => {
  if (value.includes("$") || String.raw`${value}`.includes("\\")) {
    // return "\\ and $ are not allowed";
    return false;
  }
  return true;
};

exports.hasSpecialCHar = (str) => {
  if (/[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/.test(str)) {
    return false;
  }
  return true;
};

exports.getJWTokenFromHeader = (req) => {
  let authToken = undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    authToken = req.headers.authorization.split(" ")[1];
  }
  return authToken;
};

exports.validateNoPackagesChecked = (data) => {
  const errorMessages = [];
  if (!data.path || trim(data.type).length === 0) {
    errorMessages.push(
      "Package path should be present for package configuration"
    );
  }
  if (
    (!data.name && !data.namingConvention) ||
    (data.name &&
      trim(data.name.length) === 0 &&
      trim(data.namingConvention).length === 0)
  ) {
    errorMessages.push(
      "Package namingConvention should be present for package configuration"
    );
  }
  if (!data.type || trim(data.type).length === 0) {
    errorMessages.push(
      "Package type should be present for package configuration"
    );
  }
  return errorMessages;
};

exports.validateNoPackagesUnChecked = (data) => {
  const errorMessages = [];
  if (data.path || trim(data.path).length > 0) {
    errorMessages.push(
      "Package path should not be present for No package configuration"
    );
  }
  if (
    (data.name && data.namingConvention) ||
    (data.name &&
      trim(data.name).length > 0 &&
      trim(data.namingConvention).length > 0)
  ) {
    errorMessages.push(
      "Package namingConvention should not be present for No package configuration"
    );
  }
  if (data.type || trim(data.type).length > 0) {
    errorMessages.push(
      "Package type should not be present for No package configuration"
    );
  }
  if (data.dataSet) {
    if (!data.dataSet[0]?.path || trim(data.dataSet[0]?.path).length === 0) {
      errorMessages.push(
        "Dataset path should be present for No package configuration"
      );
    }
  }
  return errorMessages;
};

exports.addPackagesValidations = (data) => {
  const errorMessages = [];
  const type = data.compression_type;
  const namingConvention = data.naming_convention;
  const path = data.sftp_path;

  if (!type || trim(type).length === 0) {
    errorMessages.push(
      "Package type should be present for package configuration"
    );
  }

  if (!namingConvention || trim(namingConvention).length === 0) {
    errorMessages.push(
      "Package namingConvention should be present for package configuration"
    );
  }

  if (!path || trim(path).length === 0) {
    errorMessages.push(
      "Package path should be present for package configuration"
    );
  }

  if (
    type &&
    trim(type).length > 0 &&
    namingConvention &&
    trim(namingConvention).length > 0
  ) {
    if (!helper.isPackageType(type)) {
      errorMessages.push("Package type Supported values : 7Z, ZIP, RAR, SAS");
    }

    if (type.toLowerCase() === "rar") {
      if (!namingConvention.toLowerCase().endsWith(".rar")) {
        errorMessages.push(
          "If Package type is RAR then package naming convention should be end with (.rar)"
        );
      }
    }

    if (type.toLowerCase() === "7z") {
      if (!namingConvention.toLowerCase().endsWith(".7z")) {
        errorMessages.push(
          "If Package type is 7z then package naming convention should be end with (.7z)"
        );
      }
    }

    if (type.toLowerCase() === "zip") {
      if (!namingConvention.toLowerCase().endsWith(".zip")) {
        errorMessages.push(
          "If Package type is Zip then package naming convention should be end with (.zip)"
        );
      }
    }

    if (type.toLowerCase() === "sas") {
      if (!namingConvention.toLowerCase().endsWith(".xpt")) {
        errorMessages.push(
          "If Package type is SAS XPT then package naming convention should be end with (.xpt)"
        );
      }
    }
  }
  return errorMessages;
};

exports.minMaxLengthValidations = (data, locationType) => {
  const errorMessages = [];
  const minLength = data.minLength;
  const maxLength = data.maxLength;
  if (minLength < 0 || maxLength < 0) {
    errorMessages.push("maxLength and minLength should be positive numbers.");
  } else if (minLength && maxLength) {
    if (parseInt(minLength, 10) > parseInt(maxLength, 10)) {
      errorMessages.push(
        "maxLength should be greater than or equals to minLength."
      );
    }
  } else if (minLength && parseInt(minLength) > 9999) {
    errorMessages.push(
      "Min Length must be between values of 1 and 9,999. Please amend."
    );
  }
  if (
    maxLength &&
    parseInt(maxLength) > 10000 &&
    !helper.isSftp(locationType)
  ) {
    errorMessages.push(
      "Max Length must be between values of 1 and 10,000. Please amend."
    );
  }
  return errorMessages;
};

exports.sortString = (a, b) => {
  if (a.columnid < b.columnid) {
    return -1;
  }
  if (a.columnid > b.columnid) {
    return 1;
  }
  return 0;
};

exports.primaryKeyValidations = (dataStructure, dataPackage, clErrArray) => {
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
                    dataPackage[i].dataSet[k].columnDefinition[j].primaryKey ===
                    "Yes" || dataPackage[i].dataSet[k].columnDefinition[j].primaryKey == 1 
                  )
                    saveflagyes = true;
                }
              }
              if (!saveflagyes)
                clErrArray.push(
                  `At least one primaryKey column must be identified when incremental is true.`
                );
            }
          }
        }
      }
    }
  }
};
