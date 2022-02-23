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
  userName,
  port,
  dbName,
  password,
}) =>
  removeUndefined({
    locationName: checkRequired(locationName),
    locationType: checkRequired(locationType),
    dataStructure: checkRequired(dataStructure),
    externalSytemName: checkRequired(externalSytemName),
    ipServer: checkRequired(ipServer),
    userName: checkRequired(userName),
    port: checkRequired(port),
    dbName: checkRequired(dbName),
    password:
      checkRequired(password) &&
      locationType?.toLowerCase() !== "sftp" &&
      locationType?.toLowerCase() !== "ftps"
        ? "Required"
        : "",
  });

export default validate;
