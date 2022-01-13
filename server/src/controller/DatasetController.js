const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const helper = require("../helpers/customFunctions");

async function checkNameExists(name) {
  const mnemonic = name.toLowerCase();
  const searchQuery = `SELECT mnemonic from cdascdi1d.cdascdi.dataset where LOWER(mnemonic) = $1`;
  const res = await DB.executeQuery(searchQuery, [mnemonic]);
  return res.rowCount;
}

exports.saveDatasetData = async (req, res) => {
  try {
    const values = req.body;
    const isExist = await checkNameExists(values.datasetName);
    if (isExist > 0) {
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
      values.clinicalDataType ? values.clinicalDataType[0] : null,
      values.transferFrequency || null,
      values.overrideStaleAlert || null,
      values.rowDecreaseAllowed || null,
      new Date(),
      new Date(),
    ];
    const searchQuery = `INSERT into cdascdi1d.cdascdi.dataset (datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`;
    Logger.info({
      message: "storeDataset",
    });
    DB.executeQuery(searchQuery, body).then(() => {
      const hisBody = [datasetId + 1, ...body];
      const hisQuery = `INSERT into cdascdi1d.cdascdi.dataset_history (dataset_vers_id,datasetid, mnemonic, type, charset, delimitier, escapecode, quote, headerrownumber, footerrownumber, active, naming_convention, path, datakindid, data_freq, ovrd_stale_alert, rowdecreaseallowed, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`;
      DB.executeQuery(hisQuery, hisBody).then(() => {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          {...values, datasetId: datasetId}
        );
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDataset");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.saveDatasetColumns = async (req, res) => {
  try {
    const values = req.body;
    const inserted = await values.map( async (value) => {
      const columnId = helper.generateUniqueID();
      const body = [
        columnId,
        value.variableLabel.trim() || null,
        value.datasetId || "a070E00000Fh5bHQAR",
        value.columnName.trim() || null,
        value.dataType.trim() || null,
        value.primary == "Yes" ? 1 : 0,
        value.required == "Yes" ? 1 : 0,
        value.unique == "Yes" ? 1 : 0,
        value.minLength.trim() || null,
        value.maxLength.trim() || null,
        value.position.trim() || null,
        value.format.trim() || null,
        value.lov.trim().replace(/(^\~+|\~+$)/, "") || null,
        new Date(),
        new Date(),
      ];
      const searchQuery = `INSERT into cdascdi1d.cdascdi.columndefinition (columnid, "VARIABLE", datasetid, name, datatype, primarykey, required, "UNIQUE", charactermin, charactermax, position, "FORMAT", lov, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
      Logger.info({
        message: "storeDatasetColumns",
      });
      const inserted =  await DB.executeQuery(searchQuery, body).then(() => {
        const hisBody = [columnId + 1, 1, ...body];
        const hisQuery = `INSERT into cdascdi1d.cdascdi.columndefinition_history (col_def_version_id,version, columnid, "VARIABLE", datasetid, name, datatype, primarykey, required, "UNIQUE", charactermin, charactermax, position, "FORMAT", lov, insrt_tm, updt_tm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`;
        return DB.executeQuery(hisQuery, hisBody).then(() => {
          return "SUCCESS"
        }).catch((err) => {
          console.log("innser err",  err);
          return err.message;
        });
      }).catch((err) => {
        console.log("outer err",  err);
        return err.message;
      });
      return inserted;
    });
    Promise.all(inserted).then((response) => {
       if(response[0] == "SUCCESS") {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          values
        );
       }  else {
        return apiResponse.ErrorResponse(res, response[0]);
      }
    })
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "err");
    Logger.error("catch :storeDatasetColumns");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
