const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");

async function checkNameExists (name) {
    const mnemonic = name.toLowerCase();
    const searchQuery = `SELECT mnemonic from cdascdi1d.cdascdi.dataset where LOWER(mnemonic) = $1`;
    const res = await DB.executeQuery(searchQuery, [mnemonic]);
    return res.rowCount;
}

exports.saveDatasetData = async (req, res) => {
  try {
    const values = req.body;
    const isExist = await checkNameExists(values.datasetName);
    if(isExist > 0) {
        return apiResponse.ErrorResponse(res, "Mnemonic is not unique.");
    }
    const datasetId = helper.generateUniqueID();
    const body = [
      datasetId,
      values.datasetName || null,
      values.fileType || null,
      values.encoding || null,
      values.delimiter || null,
      values.escapeCharacter || null,
      values.quote || null,
      values.headerRowNumber || null,
      values.footerRowNumber || null,
      values.active == true ? 1 : 0,
      values.fileNamingConvention || null,
      values.folderPath || null,
      values.clinicalDataType ?values.clinicalDataType[0]: null,
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || null,
      new Date(),
      new Date()
    ];
    const searchQuery = `INSERT into cdascdi1d.cdascdi.dataset (datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`;
    Logger.info({
      message: "storeDataset",
    });
    DB.executeQuery(searchQuery, body).then(() => {
        const hisBody = [datasetId+1, ...body];
        const hisQuery = `INSERT into cdascdi1d.cdascdi.dataset_history (dataset_vers_id,datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`;
        DB.executeQuery(hisQuery, hisBody).then(() => {
            return apiResponse.successResponseWithData(res, "Operation success", body);
        })
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};