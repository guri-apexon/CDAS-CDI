const crypto = require("crypto");
const constants = require("../config/constants");

const { FSR_ENCRYPTION_IV, FSR_ENCRYPTION_KEY } = constants;

function getUTF8Bytes(str) {
  return [...unescape(encodeURIComponent(str))].map((c) => c.charCodeAt(0));
}

function getAlgorithm(keyBase64) {
  const key = Buffer.from(getUTF8Bytes(keyBase64), "base64");
  switch (key.length) {
    case 16:
      return "aes-128-cbc";
    case 32:
      return "aes-256-cbc";
  }

  throw new Error("Invalid key length: " + key.length);
}

exports.encrypt = function (plainText) {
  const key = Buffer.from(getUTF8Bytes(FSR_ENCRYPTION_KEY), "base64");
  const iv = Buffer.from(getUTF8Bytes(FSR_ENCRYPTION_IV));

  const cipher = crypto.createCipheriv(
    getAlgorithm(FSR_ENCRYPTION_KEY),
    key,
    iv
  );
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

exports.decrypt = function (plainText) {
  const key = Buffer.from(getUTF8Bytes(FSR_ENCRYPTION_KEY), "base64");
  const iv = Buffer.from(getUTF8Bytes(FSR_ENCRYPTION_IV));

  const decipher = crypto.createDecipheriv(
    getAlgorithm(FSR_ENCRYPTION_KEY),
    key,
    iv
  );
  let decrypted = decipher.update(plainText, "base64");
  decrypted += decipher.final();
  return decrypted;
};
