const uuid = require("uuid");
const crypto = require("crypto");

exports.generateUniqueID = function () {
  const unique_id = uuid();
  return unique_id.slice(0, 16);
};
exports.createUniqueID = () => {
  return crypto.randomBytes(3 * 4).toString("base64");
};
