const DB = require("../config/db");
const moment = require("moment");
const crypto = require("crypto");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const axios = require("axios");
const cron = require("node-cron");
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
    versionFreezed,
  }) => {
    return new Promise((resolve, reject) => {
      if (!dataflowId) resolve(false);
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataflowId}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;
        const curDate = helper.getCurrentTime();
        var version = Number(historyVersion);

        if (versionFreezed != true) {
          version = Number(historyVersion) + 1;
        }
        const values = [dataflowId, version, config_json, userId, curDate];
        if (versionFreezed != true) {
          const insertVersion = await DB.executeQuery(
            `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`,
            values
          );
        }

        const anditLogsQueries = [];
        Object.keys(diffObj).map((key) => {
          // if (diffObj[key] || diffObj[key] == 0) {
          anditLogsQueries.push(
            DB.executeQuery(
              `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid, datasetid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                dataflowId,
                null,
                null,
                version,
                key,
                existDf[key],
                diffObj[key],
                userId,
                curDate,
              ]
            )
          );
          // }
        });
        if (versionFreezed != true) {
          console.log("data q");
          Promise.all(anditLogsQueries).then((values) => {
            DB.executeQuery(
              `INSERT INTO ${schemaName}.cdr_ta_queue
            (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
            VALUES($1, 'CONFIG', $2, 'QUEUE', $4, $4, '', $3, '', 1, '', 0)`,
              [
                dataflowId,
                externalSystemName === "CDI" ? userId : externalSystemName,
                version,
                curDate,
              ]
            )
              .then(async (response) => {
                DB.executeQuery(
                  `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
                  [dataflowId, curDate]
                )
                  .then((res) => {
                    resolve(version);
                  })
                  .catch((err) => {
                    resolve(false);
                  });
              })
              .catch((err) => {
                resolve(false);
              });
          });
        }
      });
    });
  },

  addLocationCDHHistory: ({
    dataflowId,
    externalSystemName,
    userId,
    config_json,
    diffObj,
    existDf,
  }) => {
    return new Promise((resolve, reject) => {
      if (!dataflowId) resolve(false);
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dataflowId}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;
        const version = Number(historyVersion) + 1;
        const curDate = helper.getCurrentTime();

        const values = [dataflowId, version, config_json, userId, curDate];
        DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`,
          values
        ).then(async (response) => {
          const anditLogsQueries = [];
          Object.keys(diffObj).map((key) => {
            anditLogsQueries.push(
              DB.executeQuery(
                `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7))`,
                [
                  dataflowId,
                  version,
                  key,
                  existDf[key],
                  diffObj[key],
                  userId,
                  curDate,
                ]
              )
            );
          });
          Promise.all(anditLogsQueries).then((values) => {
            DB.executeQuery(
              `INSERT INTO ${schemaName}.cdr_ta_queue
            (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count)
            VALUES($1, 'CONFIG', $2, 'QUEUE', $4, $4, '', $3, '', 1, '', 0)`,
              [
                dataflowId,
                externalSystemName === "CDI" ? userId : externalSystemName,
                version,
                curDate,
              ]
            )
              .then(async (response) => {
                DB.executeQuery(
                  `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
                  [dataflowId, curDate]
                )
                  .then((res) => {
                    resolve(version);
                  })
                  .catch((err) => {
                    resolve(false);
                  });
              })
              .catch((err) => {
                resolve(false);
              });
          });
        });
      });
    });
  },
  addPackageHistory: async function (package, user_id, values, versionFreezed) {
    if (!package || !values) return false;
    try {
      const response = await DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version  WHERE dataflowid = '${package.dataflowid}' order by version DESC limit 1`
      );

      const historyVersion = response.rows[0]?.version || 0;
      var version = Number(historyVersion);
      if (versionFreezed != true) {
        version = Number(historyVersion) + 1;
      }
      const curDate = helper.getCurrentTime();

      if (versionFreezed != true) {
        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`,
          [package.dataflowid, version, package, user_id, curDate]
        );
      }

      for (let i = 0; i < values.length; i++) {
        await DB.executeQuery(
          `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid, audit_vers, attribute, old_val, new_val, audit_updt_by, audit_updt_dt) 
         VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            package.dataflowid,
            package.datapackageid,
            version,
            values[i].attribute,
            values[i].old_val,
            values[i].new_val,
            user_id,
            curDate,
          ]
        );
      }

      if (versionFreezed != true) {
        await DB.executeQuery(
          `INSERT INTO ${schemaName}.cdr_ta_queue
            (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid)
            VALUES($1, 'CONFIG', $2, 'QUEUE', $5, $5, '', $3, '', 1, '', 0, $4)`,
          [package.dataflowid, user_id, version, package.datapackageid, curDate]
        );
      }
      await DB.executeQuery(
        `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
        [package.dataflowid, curDate]
      );
      return version;
    } catch (error) {
      console.log(error);
    }
    return false;
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
          const currentTime = helper.getCurrentTime();
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
      return apiResponse.ErrorResponse(res, "Something went wrong");
    }
  },

  addDatasetHistory: function (
    dfId,
    userId,
    datapackageid,
    datasetid,
    config_json,
    column,
    oldData,
    diffObj,
    versionFreezed
  ) {
    return new Promise((resolve, reject) => {
      if (!dfId) resolve(false);
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
      ).then(async (response) => {
        const historyVersion = response.rows[0]?.version || 0;
        const curDate = helper.getCurrentTime();
        var version = Number(historyVersion);
        if (versionFreezed != true) {
          version = Number(historyVersion) + 1;
        }

        const values = [dfId, version, config_json, userId, curDate];
        if (versionFreezed != true) {
          const insertVersion = await DB.executeQuery(
            `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`,
            values
          );
        }

        const anditLogsQueries = [];
        if (column) {
          anditLogsQueries.push(
            DB.executeQuery(
              `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid, datasetid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                dfId,
                datapackageid,
                datasetid,
                version,
                column,
                null,
                null,
                userId,
                curDate,
              ]
            )
          );
        } else {
          Object.keys(diffObj).map((key) => {
            anditLogsQueries.push(
              DB.executeQuery(
                `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid, datasetid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  dfId,
                  datapackageid,
                  datasetid,
                  version,
                  key,
                  oldData[key],
                  diffObj[key],
                  userId,
                  curDate,
                ]
              )
            );
          });
        }
        if (versionFreezed != true) {
          Promise.all(anditLogsQueries).then((values) => {
            DB.executeQuery(
              `INSERT INTO ${schemaName}.cdr_ta_queue
              (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid, datasetid)
              VALUES($1, 'CONFIG', $2, 'QUEUE', $6, $6, '', $3, '', 1, '', 0, $4, $5)`,
              [dfId, userId, version, datapackageid, datasetid, curDate]
            )
              .then(async (response) => {
                DB.executeQuery(
                  `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
                  [dfId, curDate]
                )
                  .then((res) => {
                    resolve(version);
                  })
                  .catch((err) => {
                    resolve(false);
                  });
              })
              .catch((err) => {
                resolve(false);
              });
          });
        }
      });
    });
  },

  addColumnHistory: function (
    datasetid,
    dfId,
    dpId,
    userId,
    config_json,
    oldData,
    diffObj,
    CDVersionBump
  ) {
    return new Promise((resolve, reject) => {
      if (!dfId) resolve(false);
      const curDate = helper.getCurrentTime();
      let version = 0;
      DB.executeQuery(
        `SELECT version from ${schemaName}.dataflow_version
      WHERE dataflowid = '${dfId}' order by version DESC limit 1`
      ).then(async (response) => {
        version = Number(response.rows[0]?.version || 0);
        if (CDVersionBump != true) {
          version = version + 1;
          const values = [dfId, version, config_json, userId, curDate];
          const insertVersion = await DB.executeQuery(
            `INSERT INTO ${schemaName}.dataflow_version(dataflowid, version, config_json, created_by, created_on) VALUES($1, $2, $3, $4, $5)`,
            values
          );
          // .then((res) => {
          // })
          DB.executeQuery(
            `INSERT INTO ${schemaName}.cdr_ta_queue
          (dataflowid, "action", action_user, status, inserttimestamp, updatetimestamp, executionid, "VERSION", "COMMENTS", priority, exec_node, retry_count, datapackageid, datasetid)
          VALUES($1, 'CONFIG', $2, 'QUEUE', $6, $6, '', $3, '', 1, '', 0, $4, $5)`,
            [dfId, userId, version, dpId, datasetid, curDate]
          )
            .then(async (response) => {
              DB.executeQuery(
                `UPDATE ${schemaName}.dataflow SET updt_tm=$2, configured=0 WHERE dataflowid=$1`,
                [dfId, curDate]
              )
                .then((res) => {})
                .catch((err) => {
                  resolve(false);
                });
            })
            .catch((err) => {
              resolve(false);
            })
            .catch((err) => {
              resolve(false);
            });
        }

        const anditLogsQueries = [];
        if (diffObj && oldData) {
          Object.keys(diffObj).map((columnId) => {
            const columnsObj = diffObj[columnId];
            Object.keys(columnsObj).map((key) => {
              anditLogsQueries.push(
                DB.executeQuery(
                  `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid,datasetid,columnid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                  [
                    dfId,
                    dpId,
                    datasetid,
                    columnId,
                    version,
                    key,
                    oldData[columnId][key],
                    diffObj[columnId][key],
                    userId,
                    curDate,
                  ]
                )
              );
            });
          });
        } else {
          anditLogsQueries.push(
            DB.executeQuery(
              `INSERT INTO ${schemaName}.dataflow_audit_log(dataflowid, datapackageid,datasetid,columnid, audit_vers, attribute,old_val, new_val, audit_updt_by, audit_updt_dt) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                dfId,
                dpId,
                datasetid,
                null,
                version,
                "New Column Definition",
                null,
                null,
                userId,
                curDate,
              ]
            )
          );
        }
        Promise.all(anditLogsQueries).then((values) => {
          resolve(version);
        });
      });
    });
  },
};
