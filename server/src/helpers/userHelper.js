const { DB_SCHEMA_NAME: schemaName } = require("../config/constants");
const DB = require("../config/db");
const Logger = require("../config/logger");
exports.CONSTANTS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  INVITED: "INVITED",
  EXTERNAL: "EXTERNAL",
  INTERNAL: "INTERNAL",
};

exports.findUserByEmailAndId = async (userid, email) => {
  const query = `
    SELECT count(1) 
    FROM ${schemaName}.user 
    WHERE usr_id = '${userid}' 
    and UPPER(usr_mail_id)='${email.toUpperCase()}';`;

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

const compareString = (val1, val2) => {
  if (val1 && val2) {
    val1 = val1.toUpperCase().trim().replace(" ", "");
    val2 = val2.toUpperCase().trim().replace(" ", "");
    return val1 === val2;
  }
};
exports.findUser = async (filter) => {
  const query = `SELECT * FROM ${schemaName}.user WHERE ${filter};`;
  try {
    const response = await DB.executeQuery(query);
    if (response.rowCount > 0) {
      const row = response.rows[0];
      return {
        ...row,
        isActive: compareString(row.usr_stat, this.CONSTANTS.ACTIVE),
        isInvited: compareString(row.usr_stat, this.CONSTANTS.INVITED),
        isInactive: compareString(row.usr_stat, this.CONSTANTS.INACTIVE),
        isExternal: compareString(row.usr_typ, this.CONSTANTS.EXTERNAL),
        isInternal: compareString(row.usr_typ, this.CONSTANTS.INTERNAL),
      };
    }
  } catch (error) {
    Logger.error("userHelper.findUser", error);
  }
  return undefined;
};

/**
 * Checks that if a user exists or not
 * @param {string} userId
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.findByUserId = async (userId) =>
  await this.findUser(`usr_id = '${userId}';`);

/**
 * Checks that if a user exists or not
 * @param {string} email
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.findByEmail = async (email) =>
  await this.findUser(`UPPER(usr_mail_id) = '${email.toUpperCase()}';`);

/**
 * Checks that if a user exists or not
 * @param {string} email
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.isUserExists = async (email) => this.findByEmail(email);

exports.checkPermission = async (userid, feature) => {
  const query = `select count(1) 
      from ${schemaName}."user" u 
      join ${schemaName}.study_user_role sur on u.usr_id = sur.usr_id 
      join ${schemaName}."role" r on sur.role_id =r.role_id  
      left join ${schemaName}.role_policy rp on r.role_id = rp.role_id
      left join ${schemaName}.policy pm on pm.plcy_id = rp.plcy_id
      left join ${schemaName}.policy_product_permission pppm on pppm.plcy_id = pm.plcy_id
      left join ${schemaName}.product_permission pp on pp.prod_permsn_id = pppm.prod_permsn_id
      left join ${schemaName}.product p2 on p2.prod_id = pp.prod_id
      left join ${schemaName}.feature f2 on f2.feat_id = pp.feat_id
      left join ${schemaName}."permission" p3 on p3.permsn_id = pp.permsn_id
      left join ${schemaName}.category c2 on c2.ctgy_id = pp.ctgy_id
      where p3.permsn_nm in ('Create','Update') and 
      f2.feat_nm = '${feature}' and 
      sur.usr_id ='${userid}' and 
      UPPER(u.usr_stat) = 'ACTIVE' 
      `;
  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0].count !== "0";
  } catch (error) {}
  return false;
};

exports.checkPermissionReadOnly = async (userid, feature) => {
  const query = `select count(1) 
  from ${schemaName}."user" u 
  join ${schemaName}.study_user_role sur on u.usr_id = sur.usr_id 
  join ${schemaName}."role" r on sur.role_id =r.role_id  
  left join ${schemaName}.role_policy rp on r.role_id = rp.role_id
  left join ${schemaName}.policy pm on pm.plcy_id = rp.plcy_id
  left join ${schemaName}.policy_product_permission pppm on pppm.plcy_id = pm.plcy_id
  left join ${schemaName}.product_permission pp on pp.prod_permsn_id = pppm.prod_permsn_id
  left join ${schemaName}.product p2 on p2.prod_id = pp.prod_id
  left join ${schemaName}.feature f2 on f2.feat_id = pp.feat_id
  left join ${schemaName}."permission" p3 on p3.permsn_id = pp.permsn_id
  left join ${schemaName}.category c2 on c2.ctgy_id = pp.ctgy_id
  where p3.permsn_nm in ('Read') and 
  f2.feat_nm = '${feature}' and 
  sur.usr_id ='${userid}' and 
  UPPER(u.usr_stat) = 'ACTIVE' 
`;
  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0].count !== "0";
  } catch (error) {}
  return false;
};

exports.checkPermissionStudy = async (userid, feature, prot_nbr_stnd) => {
  const query = `select count(1) 
  from ${schemaName}."user" u 
  join ${schemaName}.study_user su on u.usr_id = su.usr_id 
  join ${schemaName}.study_user_role sur on su.usr_id = sur.usr_id and  su.prot_id = sur.prot_id 
  join ${schemaName}.study s on s.prot_id = su.prot_id 
  join ${schemaName}."role" r on sur.role_id =r.role_id  
  left join ${schemaName}.role_policy rp on r.role_id = rp.role_id
  left join ${schemaName}.policy pm on pm.plcy_id = rp.plcy_id
  left join ${schemaName}.policy_product_permission pppm on pppm.plcy_id = pm.plcy_id
  left join ${schemaName}.product_permission pp on pp.prod_permsn_id = pppm.prod_permsn_id
  left join ${schemaName}.product p2 on p2.prod_id = pp.prod_id
  left join ${schemaName}.feature f2 on f2.feat_id = pp.feat_id
  left join ${schemaName}."permission" p3 on p3.permsn_id = pp.permsn_id
  left join ${schemaName}.category c2 on c2.ctgy_id = pp.ctgy_id
  where p3.permsn_nm in ('Create','Update') and 
  f2.feat_nm = '${feature}' and 
  sur.usr_id ='${userid}' and 
  UPPER(u.usr_stat)= 'ACTIVE' and 
  s.prot_nbr_stnd ='${prot_nbr_stnd}' and 
  p2.prod_nm = 'Ingestion' and 
  su.act_flg =1 and sur.act_flg = 1 and rp.act_flg =1 and pppm.act_flg =1 and pp.act_flg=1;`;

  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0].count !== "0";
  } catch (error) {}
  return false;
};

exports.checkDataKindPartOfSyncDataFlow = async function (dataKindId) {
  let query = `select Count(1) from dataflow d, datapackage d2, dataset d3 
  where d.dataflowid=d2.dataflowid and d2.datapackageid=d3.datapackageid 
  and d.data_in_cdr='Y' and d3.datakindid = '${dataKindId}'`;
  try {
    const queryResult = await DB.executeQuery(query);
    if (queryResult && queryResult?.rows[0]?.count > 0) {
      return true;
    }
  } catch (error) {
    Logger.error("userHelper.findUser", error);
  }
  return false;
};

exports.updateAndValidateLOV = function (lovValue) {
  try {
    let updatedLOV = lovValue.trim() || lovValue;
    const isFirst = updatedLOV.charAt(0) === "~";
    const isLast = updatedLOV.charAt(updatedLOV.length - 1) === "~";
    if (isFirst) {
      updatedLOV = updatedLOV.substring(1);
    }
    if (isLast) {
      updatedLOV = updatedLOV.slice(0, -1);
    }
    updatedLOV = updatedLOV.trim();
    return updatedLOV;
  } catch (error) {
    Logger.error("userHelper.updateAndValidateLOV", error);
    return lovValue;
  }
};
