import {
  checkRequired,
  removeUndefined,
  checkAlphaNumeric,
  checkNumbers,
} from "./validators";

const dataSetsValidation = ({
  datasetName,
  clinicalDataType,
  fileType,
  transferFrequency,
  fileNamingConvention,
  rowDecreaseAllowed,
  overrideStaleAlert,
  headerRowNumber,
  footerRowNumber,
}) =>
  removeUndefined({
    datasetName: checkRequired(datasetName) || checkAlphaNumeric(datasetName),
    clinicalDataType: checkRequired(clinicalDataType),
    fileType: checkRequired(fileType),
    transferFrequency:
      checkRequired(transferFrequency) || checkNumbers(overrideStaleAlert),
    fileNamingConvention: checkRequired(fileNamingConvention),
    rowDecreaseAllowed: checkNumbers(rowDecreaseAllowed),
    overrideStaleAlert: checkNumbers(overrideStaleAlert),
    headerRowNumber: checkNumbers(headerRowNumber),
    footerRowNumber: checkNumbers(footerRowNumber),
  });

export default dataSetsValidation;
