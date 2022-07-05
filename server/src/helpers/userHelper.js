const { DB_SCHEMA_NAME: schemaName } = require("../config/constants");
const DB = require("../config/db");
const Logger = require("../config/logger");

exports.findUserByEmailAndId = async (userid, email) => {
  const query = `
    SELECT count(1) 
    FROM ${schemaName}.user 
    WHERE usr_id = '${userid}' 
   ${email ? ` and UPPER(usr_mail_id)='${email.toUpperCase()}';` : ""}`;
  try {
    const rows = await DB.executeQuery(query);
    if (rows.rowCount > 0) {
      return true;
    }
  } catch (error) {
    Logger.error("userHelper.findUser", error);
  }
  return undefined;
};
