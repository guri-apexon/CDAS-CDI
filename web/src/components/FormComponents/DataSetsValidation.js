import {
  checkRequired,
  removeUndefined,
  checkAlphaNumeric,
  checkNumbers,
  checkExceSupport,
  checkAlphaNumericFileName,
  checkAlphaNumericMnemonic,
  checkValidQuery,
  checkfilterCondition,
  checkExecptSpace,
  checkMinLength,
} from "./validators";

const dataSetsValidation = ({
  datasetName,
  clinicalDataType,
  fileType,
  transferFrequency,
  fileNamingConvention,
  rowDecreaseAllowed,
  overrideStaleAlert,
  delimiter,
  headerRowNumber,
  footerRowNumber,
  isCustomSQL,
  sQLQuery,
  filterCondition,
  tableName,
  offsetColumn,
}) =>
  removeUndefined({
    datasetName:
      checkRequired(datasetName) || checkAlphaNumericMnemonic(datasetName),
    clinicalDataType: checkRequired(clinicalDataType),
    fileType: checkRequired(fileType),
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
    isCustomSQL: checkRequired(isCustomSQL),
    sQLQuery: checkValidQuery(sQLQuery),
    filterCondition: checkfilterCondition(filterCondition),
    tableName: checkRequired(tableName),
    offsetColumn: checkRequired(offsetColumn),
  });

export default dataSetsValidation;

export const passwordWarnings = ({ filePwd }) =>
  removeUndefined({
    filePwd: checkExecptSpace(filePwd) || checkMinLength(filePwd),
  });
