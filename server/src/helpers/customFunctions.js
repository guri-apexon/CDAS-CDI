const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");
const { forEach } = require("lodash");

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

// { user: usr_nm, password: pswd }
exports.writeVaultData = async (vaultPath, data) => {
  await vault.write(`kv/${vaultPath}`, data);
  return true;
};

exports.deleteVaultData = async (vaultPath) => {
  await vault.delete(vaultPath);
  return true;
};

exports.stringToBoolean = (string) => {
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
      return Boolean(string);
  }
};

const stringToBooleanVal = (exports.stringToBooleanVal = (string) => {
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
      return string;
  }
});

exports.convertEscapeChar = (str) => {
  return str ? String.raw`${str}`.replace(/\\/g, "\\\\") : "";
};

exports.validation = (data) => {
  let msg = [];
  data.forEach((val) => {
    if (val.type == "boolean") {
      val.value = stringToBooleanVal(val.value);
    }
    if (
      val.value !== null &&
      val.value !== "" &&
      val.value !== undefined &&
      typeof val.value === val.type
    ) {
      // console.log(val.key);
    } else {
      msg.push({
        text: ` ${val.key} is required and data type should be ${val.type} `,
        status: false,
      });
    }
  });
  // console.log(msg);
  return msg;
};
