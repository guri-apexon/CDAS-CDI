import { checkRequired, removeUndefined, checkMaxLength } from "./validators";

const validate = ({ vendor, description, dataflowType }) =>
  removeUndefined({
    vendor: checkRequired(vendor),
    description: checkRequired(description) || checkMaxLength(description),
    dataflowType: checkRequired(dataflowType),
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
