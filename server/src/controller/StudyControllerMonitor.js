const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

exports.getDatasetIngestionMonitorDetail = async function (req, res) {
  try {
    const userId = req.params.userId;
    const testFlag = req.query.testFlag || 9;
    const summaryQuery = `select * from fn_get_all_study_summary('${userId}', ${testFlag})`;
    const summaryCount = await DB.executeQuery(summaryQuery);
    const summary = summaryCount?.rows ? summaryCount.rows[0] : {};
    Logger.info({
      message: "getDatasetIngestionMonitorDetail",
      userId,
    });
    return apiResponse.successResponseWithData(res, "Operation success", {
      summary: summary,
      datasets: [],
      totalSize: 11, //response.rowCount,
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "eerre");
    Logger.error("catch :getDatasetIngestionMonitorDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
