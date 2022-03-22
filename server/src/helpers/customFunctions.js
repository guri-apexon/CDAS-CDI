const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");

const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: "http://ca2updb249vd:8200",
});

const roleId = process.env.ROLE_ID;
const secretId = process.env.SECRET_ID;

const run = async () => {
  const result = await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

  vault.token = result.auth;
  // console.log(vault.token);
};
run();

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
  const { data } = await vault.read(vaultPath);
  return data;
};

// { user: usr_nm, password: pswd }
exports.writeVaultData = async (vaultPath, data) => {
  await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

  await vault.write(vaultPath, data);
  return true;
};

exports.deleteVaultData = async (vaultPath) => {
  await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

  await vault.delete(vaultPath);
  return true;
};
