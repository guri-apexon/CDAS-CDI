import {
  checkRequired,
  removeUndefined,
  checkAlphaNumeric,
  checkNumbers,
  checkExceSupport,
  checkAlphaNumericFileName,
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
}) =>
  removeUndefined({
    datasetName: checkRequired(datasetName) || checkAlphaNumeric(datasetName),
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
      checkRequired(delimiter) && fileType?.toLowerCase() === "delimited",
  });

export default dataSetsValidation;
