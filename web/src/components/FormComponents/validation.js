const checkRequired = (value) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "Required";
  }
  return false;
};

const checkMaxLength = (value) => {
  if (value && value.length > 30) {
    return `Must be 30 characters or less`;
  }
  return false;
};

const removeUndefined = (arr) =>
  Object.keys(arr)
    .filter((key) => arr[key] !== undefined)
    .reduce((res, key) => {
      res[key] = arr[key];
      return res;
    }, {});

const validate = ({ vendor, description, dataflowType }) =>
  removeUndefined({
    vendor: checkRequired(vendor),
    description: checkRequired(description) || checkMaxLength(description),
    dataflowType: checkRequired(dataflowType),
  });

export default validate;
