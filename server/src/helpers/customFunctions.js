const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");
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
  return str ? String.raw`${str}`.replace(/\\/g, "\\\\") : "";
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
        msg.push({
          err: ` ${val.key} should be less than ${val.maxLength} characters  `,
        });
      }
      // console.log(val.key);
    } else {
      msg.push({
        err: ` ${val.key} is required and data type should be ${val.type} `,
      });
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

exports.isColumnType = (str) => {
  return ["alphanumeric", "numeric", "date"].includes(str.toLowerCase());
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
  sqlQuery = `Select ${clname.join(", ")} from ${tableName} ${
    condition ? condition : "where 1=1"
  }`;

  return sqlQuery;
};
exports.formatDBColumns = (data) => {
  if (!data) return [];
  return data?.map((d) => {
    return {
      columnName: d.columnName || d.Field || d.col_name,
      datatype: d.datatype || d.Type || d.data_type,
      primaryKey: d.primaryKey || d.Key === "PRI",
      required: d.required || d.Null === "NO",
      unique: d.unique || false,
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

exports.generateConnectionURL = (locType, hostName, port, dbName) => {
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
  if (locType && hostName && port && dbName) {
    return `jdbc:${locType}://${hostName}:${port}/${dbName}`;
  }

  return "";
};
