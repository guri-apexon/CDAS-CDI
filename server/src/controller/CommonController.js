const DB = require("../config/db");
const moment = require("moment");
const crypto = require("crypto");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const axios = require("axios");
const cron = require("node-cron");
// const { cronHardDelete } = require("./DataflowController");
const constants = require("../config/constants");
const helper = require("../helpers/customFunctions");
const { encrypt } = require("../helpers/encrypter");
const {
  FSR_HEADERS,
  FSR_API_URI,
  SDA_BASE_URL,
  DB_SCHEMA_NAME: schemaName,
} = constants;

// cron.schedule("*/30 * * * *", () => {
//   console.log("running a task every 30 minute");
//   cronHardDelete();
// });

module.exports = {
  createUniqueID: () => {
    return helper.generateUniqueID();
  },

  addAuditLog: function () {
    return new Promise((resolve, reject) => {
      DB.executeQuery(query).then((response) => {
        resolve(true);
      });
    });
  },
  addDataflowHistory: ({
    dataflowId,
    externalSystemName,
    userId,
    config_json,
    diffObj,
    existDf,
  }) => {
    return new Promise((resolve, reject) => {
      if (!dataflowId) resolve(false);
      const currentTime = helper.getCurrentTime();
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataflowId}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;
        const version = Number(historyVersion) + 1;

        const values = [dataflowId, version, config_json, userId, currentTime];
        DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`,
          values
        ).then(async (response) => {
          const anditLogsQueries = [];
          Object.keys(diffObj).map((key) => {
            anditLogsQueries.push(
              DB.executeQuery(
                `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid,datasetid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9)`,
                [
                  dataflowId,
                  null,
                  null,
                  version,
                  key,
                  existDf[key],
                  diffObj[key],
                  userId,
                  currentTime,
                ]
              )
            );
          });
          Promise.all(anditLogsQueries).then((values) => {
            console.log("valuesPromise", values);
            DB.executeQuery(
              `INSERT INTO ${schemaName}.cdr_ta_queue
            (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
            VALUES($1, 'CONFIG', $2, 'QUEUE', NOW(),NOW(), '', $3, '', 1, '', 0)`,
              [
                dataflowId,
                externalSystemName === "CDI" ? userId : externalSystemName,
                version,
              ]
            )
              .then((response) => {
                resolve(version);
              })
              .catch((err) => {
                resolve(false);
              });
          });
        });
      });

      // await DB.executeQuery(
      //   `INSERT INTO ${schemaName}.dataflow_audit_log
      // ( dataflowid, datapackageid, datasetid, columnid, audit_vers, "attribute", old_val, new_val, audit_updt_by, audit_updt_dt)
      // VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`,
      //   [
      //     dataFlowId,
      //     null,
      //     null,
      //     null,
      //     1,
      //     "New Dataflow",
      //     "",
      //     "",
      //     externalSystemName === "CDI" ? userId : externalSystemName,
      //     currentTime,
      //   ]
      // );
    });
  },
  addPackageHistory: function (
    package,
    user_id,
    column,
    old_val = "",
    new_val = ""
  ) {
    return new Promise((resolve, reject) => {
      if (!package) resolve(false);
      const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${package.dataflowid}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;
        const version = Number(historyVersion) + 1;
        const uniqueId = helper.createUniqueID();
        const addHistoryQuery = `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`;
        const values = [
          package.dataflowid,
          version,
          package,
          user_id,
          currentTime,
        ];
        DB.executeQuery(addHistoryQuery, values).then(async (response) => {
          const addAuditLogQuery = `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid, audit_vers, attribute, old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
          const auditValues = [
            package.dataflowid,
            package.datapackageid,
            version,
            column,
            old_val,
            new_val,
            user_id,
            currentTime,
          ];
          DB.executeQuery(addAuditLogQuery, auditValues)
            .then(async (response) => {
              DB.executeQuery(
                `INSERT INTO ${schemaName}.cdr_ta_queue
              (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid)
              VALUES($1, 'CONFIG', $2, 'QUEUE', NOW(),NOW(), '', $3, '', 1, '', 0, $4)`,
                [package.dataflowid, user_id, version, package.datapackageid]
              )
                .then((response) => {
                  resolve(version);
                })
                .catch((err) => {
                  resolve(false);
                });
            })
            .catch((err) => {
              resolve(version);
            });
        });
      });
    });
  },
  addPackageHistoryOLD: function (package, user_id, column, old_val, new_val) {
    return new Promise((resolve, reject) => {
      if (!package) resolve(false);
      DB.executeQuery(
        `SELECT version from ${schemaName}.datapackage_history
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
        const addHistoryQuery = `INSERT INTO ${schemaName}.datapackage_history(datapackage_vers_id, datapackageid, version, dataflowid, type, name, path, password, active, insrt_tm, updt_tm, del_flg, prot_id, usr_id, sasxptmethod, nopackageconfig, file_mode, dwnld_pattern, naming_convention, days_until_data_is_stale, dp_stat, extrnl_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`;
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
          const auditId = helper.createUniqueID();
          const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
          const addAuditLogQuery = `INSERT INTO ${schemaName}.dataflow_audit_log(dataflow_audit_log_id, dataflowid, datapackageid, audit_vers, audit_updt_dt, usr_id, attribute, old_val, new_val) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
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
          DB.executeQuery(addAuditLogQuery, auditValues)
            .then(async (response) => {
              resolve(version);
            })
            .catch((err) => {
              resolve(version);
            });
        });
      });
    });
  },

  fsrConnect: (req, res) => {
    try {
      const { params, endPoint } = req.body;
      if (!endPoint || !params) {
        return apiResponse.ErrorResponse(res, "Something went wrong");
      }
      if (params.password) {
        params.password = encrypt(params.password);
      }
      axios
        .post(`${FSR_API_URI}/${endPoint}`, params, {
          headers: FSR_HEADERS,
        })
        .then((response) => {
          return res.json(response.data);
        })
        .catch((err) => {
          if (err.response?.data) {
            return res.json(err.response.data);
          } else {
            return apiResponse.ErrorResponse(res, "Something went wrong");
          }
        });
    } catch (err) {
      Logger.error(err);
      console.log("err:", err);
      return apiResponse.ErrorResponse(res, err);
    }
  },

  addDatasetHistory: function (
    dfId,
    userId,
    datapackageid,
    datasetid,
    config_json,
    column,
    old_val = "",
    new_val = ""
  ) {
    return new Promise((resolve, reject) => {
      if (!dfId) resolve(false);
      const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;
        const version = Number(historyVersion) + 1;
        const uniqueId = helper.createUniqueID();
        const addHistoryQuery = `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`;
        const values = [dfId, version, config_json, userId, currentTime];
        DB.executeQuery(addHistoryQuery, values).then(async (response) => {
          const addAuditLogQuery = `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid,datasetid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9)`;
          const auditValues = [
            dfId,
            datapackageid,
            datasetid,
            version,
            column,
            old_val,
            new_val,
            userId,
            currentTime,
          ];
          DB.executeQuery(addAuditLogQuery, auditValues)
            .then(async (response) => {
              DB.executeQuery(
                `INSERT INTO ${schemaName}.cdr_ta_queue
              (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid, datasetid)
              VALUES($1, 'CONFIG', $2, 'QUEUE', NOW(),NOW(), '', $3, '', 1, '', 0, $4, $5)`,
                [dfId, userId, version, datapackageid, datasetid]
              )
                .then((response) => {
                  resolve(version);
                })
                .catch((err) => {
                  resolve(false);
                });
            })
            .catch((err) => {
              resolve(version);
            });
        });
      });
    });
  },

  addColumnHistory: function (
    columnId,
    datasetid,
    dfId,
    dpId,
    userId,
    config_json,
    column,
    old_val = "",
    new_val = ""
  ) {
    return new Promise((resolve, reject) => {
      if (!dfId) resolve(false);
      const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;

        const version = Number(historyVersion) + 1;
        const uniqueId = helper.createUniqueID();
        const addHistoryQuery = `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`;
        const values = [dfId, version, config_json, userId, currentTime];
        DB.executeQuery(addHistoryQuery, values).then(async (response) => {
          const addAuditLogQuery = `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid,datasetid,columnid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)`;
          const auditValues = [
            dfId,
            dpId,
            datasetid,
            columnId,
            version,
            column,
            old_val,
            new_val,
            userId,
            currentTime,
          ];
          DB.executeQuery(addAuditLogQuery, auditValues)
            .then(async (response) => {
              DB.executeQuery(
                `INSERT INTO ${schemaName}.cdr_ta_queue
              (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid, datasetid)
              VALUES($1, 'CONFIG', $2, 'QUEUE', NOW(),NOW(), '', $3, '', 1, '', 0, $4, $5)`,
                [dfId, userId, version, dpId, datasetid]
              )
                .then((response) => {
                  resolve(version);
                })
                .catch((err) => {
                  resolve(false);
                });
            })
            .catch((err) => {
              resolve(version);
            });
        });
      });
    });
  },
};
