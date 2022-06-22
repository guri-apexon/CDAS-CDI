const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { _ } = require("lodash");
const { DB_SCHEMA_NAME: dbSchema } = constants;

exports.getRolesPermissions = async (req, res) => {
  try {
    Logger.info({ message: "getRolesPermissions" });
    const { userId, productName } = req.body;
    // sur.role_id, rp.plcy_id, p3.prod_id, p3.prod_nm, c.ctgy_id, f.feat_id, p.plcy_nm,
    const query = `select 
     c.ctgy_nm as "categoryName", f.feat_nm as "featureName", p2.permsn_nm as "allowedPermission" from ${dbSchema}.study_user_role sur
  inner join ${dbSchema}.role r on r.role_id = sur.role_id
  inner join ${dbSchema}.role_policy rp on rp.role_id = r.role_id 
  inner join ${dbSchema}."policy" p on p.plcy_id = rp.plcy_id 
  inner join ${dbSchema}.policy_product_permission ppp on p.plcy_id = ppp.plcy_id 
  inner join ${dbSchema}.product_permission pp on ppp.prod_permsn_id = pp.prod_permsn_id 
  inner join ${dbSchema}."permission" p2 on pp.permsn_id = p2.permsn_id 
  inner join ${dbSchema}.product p3 on pp.prod_id = p3.prod_id 
  inner join ${dbSchema}.category c on pp.ctgy_id = c.ctgy_id 
  inner join ${dbSchema}.feature f on pp.feat_id = f.feat_id 
  where sur.usr_id = $1 and sur.act_flg = 1 and p3.prod_nm = $2 and p.plcy_stat = 'Active' and r.role_stat = 1 and rp.act_flg = 1 and ppp.act_flg = 1 and pp.act_flg =1 and f.act_flg =1 and c.act_flg = 1`;

    const $q1 = await DB.executeQuery(query, [userId, productName]);

    const uniquePermissions = await _.uniqWith($q1.rows, _.isEqual);

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      uniquePermissions
    );
  } catch (err) {
    Logger.error("catch :getRolesPermissions");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
