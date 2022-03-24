import {
  checkRequired,
  removeUndefined,
  checkAlphaNumeric,
  checkNumbers,
  checkExceSupport,
  checkAlphaNumericFileName,
  checkValidQuery,
  checkfilterCondition,
  checkExecptSpace,
  checkMinLength,
} from "./validators";

const dataSetsValidation = ({
  datasetName,
  clinicalDataType,
  fileType,
  filePwd,
  transferFrequency,
  fileNamingConvention,
  rowDecreaseAllowed,
  overrideStaleAlert,
  delimiter,
  headerRowNumber,
  footerRowNumber,
  customSQLQuery,
  sQLQuery,
  filterCondition,
}) =>
  removeUndefined({
    datasetName: checkRequired(datasetName) || checkAlphaNumeric(datasetName),
    clinicalDataType: checkRequired(clinicalDataType),
    fileType: checkRequired(fileType),
    filePwd: checkExecptSpace(filePwd) || checkMinLength(filePwd),
    transferFrequency:
      checkRequired(transferFrequency) || checkNumbers(transferFrequency),
    fileNamingConvention:
      checkRequired(fileNamingConvention) ||
      checkExceSupport(fileNamingConvention, fileType) ||
      checkAlphaNumericFileName(fileNamingConvention),
    rowDecreaseAllowed: checkNumbers(rowDecreaseAllowed),
    overrideStaleAlert: checkNumbers(overrideStaleAlert),
    headerRowNumber: checkNumbers(headerRowNumber),
    footerRowNumber: checkNumbers(footerRowNumber),
    delimiter:
      checkRequired(delimiter) && fileType?.toLowerCase() === "delimited"
        ? "Required"
        : "",
    customSQLQuery: checkRequired(customSQLQuery),
    sQLQuery: checkValidQuery(sQLQuery),
    filterCondition: checkfilterCondition(filterCondition),
  });

export default dataSetsValidation;
