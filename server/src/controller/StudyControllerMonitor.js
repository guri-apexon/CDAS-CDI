const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.getDatasetIngestionMonitorDetail = async function (req, res) {
  try {
    const userId = req.params.userId;
    const testFlag = req.query.testFlag || 9; // default value 9
    const processStatus = req.query.processStatus || null;
    const limit = req.query.limit || 10; // default valu is 10
    const noOfDays = req.query.noOfDays || 10; // deafult value is 10
    const summaryCount = await DB.executeQuery(
      `select * from fn_get_study_summary('${userId}', null, ${testFlag})`
    );
    Logger.info({
      message: "getDatasetIngestionMonitorDetail",
      userId,
    });

    const response = await DB.executeQuery(
      `select * from fn_get_study_dataset_summary('${userId}', ${testFlag}, '', ${
        processStatus ? `'${processStatus}'` : null
      }, ${limit}, ${noOfDays})`
    );
    const dataSets = response.rows || [];
    const summary = summaryCount.rows ? summaryCount.rows[0] : {};
    return apiResponse.successResponseWithData(res, "Operation success", {
      summary: summary,
      datasets: dataSets,
      totalSize: summary.dataset_pipelines,
    });
  } catch (err) {
    console.log(err, "eerre");
    Logger.error("catch :getDatasetIngestionMonitorDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getIngestionMonitorDataSets = async function (req, res) {
  const userId = req.params.userId;
  const testFlag = req.query.testFlag || 9; // default value 9
  const processStatus = req.query.processStatus || null; // default value null
  const limit = req.query.limit || 500; // pass 0 if all records required
  const noOfDays = req.query.noOfDays || 3; // default value is 3
  try {
    const dataSetResult = await DB.executeQuery(
      `select * from fn_get_study_dataset_summary('${userId}', ${testFlag}, '', ${
        processStatus ? `'${processStatus}'` : null
      }, ${limit}, ${noOfDays})`
    );
    const datasets = dataSetResult?.rows || [];
    Logger.info({
      message: "getIngestionMonitorDataSets",
      userId: req.params.userId,
    });
    return apiResponse.successResponseWithData(res, "Operation success", {
      datasets: datasets,
      totalSize: dataSetResult.rowCount,
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "eerre");
    Logger.error("catch :getDatasetIngestionMonitorDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
