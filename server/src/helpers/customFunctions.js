const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");

const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: "http://ca2updb249vd:8200",
});

const roleId = process.env.ROLE_ID;
const secretId = process.env.SECRET_ID;

// const run = async () => {
//   const result = await vault.approleLogin({
//     role_id: roleId,
//     secret_id: secretId,
//   });
// return result.auth.client_token;
// console.log(vault.token);
// };
// run();

exports.generateUniqueID = function () {
  const unique_id = uuid();
  return unique_id.slice(0, 16);
};
exports.createUniqueID = () => {
  return crypto.randomBytes(3 * 4).toString("base64");
};
exports.getCurrentTime = () => {
  return moment().utc().format("YYYY-MM-DD HH:mm:ss");
};

exports.readVaultData = async (vaultPath) => {
  await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });
  vault.token = result.auth.client_token;

  const { data } = await vault.read(vaultPath);
  return data;
};

// { user: usr_nm, password: pswd }
exports.writeVaultData = async (vaultPath, data) => {
  const result = await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

  vault.token = result.auth.client_token;

  // const token = await run();

  // const vault2 = require("node-vault")({
  //   apiVersion: "v1",
  //   endpoint: "http://ca2updb249vd:8200",
  //   token: token,
  // });

  // console.log(vault2);

  await vault.write(vaultPath, data);
  return true;
};

exports.deleteVaultData = async (vaultPath) => {
  await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

  vault.token = result.auth.client_token;

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
