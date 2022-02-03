import { checkRequired, removeUndefined, checkMaxLength } from "./validators";

const validate = ({
  vendor,
  description,
  dataflowType,
  firstFileDate,
  dataStructure,
  locationName,
}) =>
  removeUndefined({
    vendor: checkRequired(vendor),
    description: checkRequired(description) || checkMaxLength(description),
    dataflowType: checkRequired(dataflowType),
    firstFileDate: checkRequired(firstFileDate),
    dataStructure: checkRequired(dataStructure),
    locationName: checkRequired(locationName),
  });

export const locationModalValidate = ({
  locationName,
  locationType,
  dataStructure,
  externalSytemName,
  ipServer,
}) =>
  removeUndefined({
    locationName: checkRequired(locationName),
    locationType: checkRequired(locationType),
    dataStructure: checkRequired(dataStructure),
    externalSytemName: checkRequired(externalSytemName),
    ipServer: checkRequired(ipServer),
  });

export default validate;
