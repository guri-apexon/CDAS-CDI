const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

async function checkSettingsExists(nm = "", tntId = "", configId = "") {
  const name = nm.toLowerCase();
  const tenatId = tntId.toLowerCase();
  let searchQuery = `SELECT config_id from ${schemaName}.cdas_config where LOWER(name)=$1 and LOWER(tenant_id)=$2`;
  let dep = [name, tenatId];
  if (configId) {
    searchQuery = `SELECT config_id from ${schemaName}.cdas_config where LOWER(name) = $1 and  LOWER(tenant_id) = $2 and config_id != $3`;
    dep = [name, tenatId, configId];
  }
  const res = await DB.executeQuery(searchQuery, dep);
  return res.rowCount;
}

async function getTenantId(userId) {
  const searchQuery = `select distinct s.tenant_id from cdascfg.study_user su inner join cdascfg.study_sponsor ss on ss.prot_id = su.prot_id inner join cdascfg.sponsor s on s.spnsr_id = ss.spnsr_id where su.usr_id=$1`;
  const dep = [userId];
  const res = await DB.executeQuery(searchQuery, dep);
  if (res.rowCount > 0) {
    return res.rows[0].tenant_id;
  }
  return "";
}

exports.getSettingsList = function (req, res) {
  try {
    const searchQuery = `SELECT config_id,tenant_id,"name",value from ${schemaName}.cdas_config order by config_id asc`;
    Logger.info({
      message: "settingsList",
    });

    DB.executeQuery(searchQuery)
      .then((response) => {
        const settings = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: settings,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :settingsList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.searchSettingsList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT config_id,tenant_id,"name",value from ${schemaName}.cdas_config 
              WHERE LOWER(name) LIKE $1 OR 
              LOWER(value) LIKE $2
              `;
    Logger.info({
      message: "settingsList",
    });

    DB.executeQuery(searchQuery, [`%${searchParam}%`, `%${searchParam}%`])
      .then((response) => {
        const settings = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          records: settings,
          totalSize: response.rowCount,
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :settingsList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateSettingsData = async function (req, res) {
  try {
    const values = req.body;
    const userId = values.userId || req.headers["userid"];
    const tenantId = await getTenantId(userId);
    const isExist = await checkSettingsExists(
      values.name,
      tenantId,
      values.config_id
    );
    if (isExist > 0) {
      return apiResponse.ErrorResponse(
        res,
        "No duplicate settings are allowed"
      );
    }
    const body = [
      values.name || null,
      values.value || null,
      tenantId || null,
      userId || null,
      new Date(),
      values.config_id,
    ];
    const searchQuery = `UPDATE ${schemaName}.cdas_config set name=$1, value=$2, tenant_id=$3, updated_by=$4, updated_on=$5 where config_id=$6`;
    Logger.info({
      message: "updateSettings",
    });
    DB.executeQuery(searchQuery, body)
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          true
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateSettings");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.saveSettingsData = async function (req, res) {
  try {
    const values = req.body;
    const userId = values.userId || req.headers["userid"];
    const tenantId = await getTenantId(userId);
    const isExist = await checkSettingsExists(values.name, tenantId);
    if (isExist > 0) {
      return apiResponse.ErrorResponse(
        res,
        "No duplicate settings are allowed"
      );
    }
    const body = [
      values.name || null,
      values.value || null,
      tenantId || null,
      userId || null,
      new Date(),
      userId || null,
      new Date(),
    ];
    console.log(body, "body");
    const searchQuery = `INSERT into ${schemaName}.cdas_config (name, value, tenant_id, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7)`;
    Logger.info({
      message: "storesettings",
    });
    DB.executeQuery(searchQuery, body)
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          true
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :storesettings");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
