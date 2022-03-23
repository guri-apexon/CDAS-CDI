const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");

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
