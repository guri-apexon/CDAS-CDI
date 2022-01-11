const DB = require("../config/db");
const moment = require("moment");
const crypto = require("crypto");
const cron = require('node-cron');

cron.schedule("* * * * *", () => {
  console.log("running a task every minute");
  DB.executeQuery(`SELECT * FROM cdascdi1d.cdascdi.temp_json_log`).then(
    async (response) => {
      const logs = response.rows || [];
      if (logs.length) {
        console.log("response", response.rows);
      }
    }
  );
});

module.exports = {
  createUniqueID: () => {
    return crypto.randomBytes(3 * 4).toString("base64");
  },
  addAuditLog: function () {
    return new Promise((resolve, reject) => {
      DB.executeQuery(query).then((response) => {
        resolve(true);
      });
    });
  },
  addPackageHistory: function (package, user_id, column, old_val, new_val) {
    return new Promise((resolve, reject) => {
      if (!package) resolve(false);
      DB.executeQuery(
        `SELECT version from cdascdi1d.cdascdi.datapackage_history
      WHERE datapackageid = '${package.datapackageid}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyExist = response.rows[0] || null;
        let version;
        if (!historyExist) {
          version = 1;
        } else {
          version = Number(historyExist.version) + 1;
        }
        const vers_id = package.datapackageid + version;
        const addHistoryQuery = `INSERT INTO cdascdi1d.cdascdi.datapackage_history(datapackage_vers_id, datapackageid, version, dataflowid, type, name, path, password, active, insrt_tm, updt_tm, del_flg, prot_id, usr_id, sasxptmethod, nopackageconfig, file_mode, dwnld_pattern, naming_convention, days_until_data_is_stale, dp_stat, extrnl_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`;
        const values = [
          vers_id,
          package.datapackageid,
          version,
          package.dataflowid,
          package.type,
          package.name,
          package.path,
          package.password,
          package.active,
          moment(package.insrt_tm).format("YYYY-MM-DD HH:mm:ss"),
          moment(package.updt_tm).format("YYYY-MM-DD HH:mm:ss"),
          package.del_flg,
          package.prot_id,
          user_id,
          package.sasxptmethod,
          package.nopackageconfig,
          package.file_mode,
          package.dwnld_pattern,
          package.naming_convention,
          package.days_until_data_is_stale,
          package.dp_stat,
          package.extrnl_id,
        ];
        DB.executeQuery(addHistoryQuery, values).then(async (response) => {
          const auditId = this.createUniqueID();
          const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
          const addAuditLogQuery = `INSERT INTO cdascdi1d.cdascdi.dataflow_audit_log(dataflow_audit_log_id, dataflowid, datapackageid, audit_vers, audit_updt_dt, usr_id, attribute, old_val, new_val) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
          const auditValues = [
            auditId,
            package.dataflowid,
            package.datapackageid,
            version,
            currentTime,
            user_id,
            column,
            old_val,
            new_val,
          ];
          DB.executeQuery(addAuditLogQuery, auditValues).then(
            async (response) => {
              resolve(version);
            }
          );
        });
      });
    });
  },
};
