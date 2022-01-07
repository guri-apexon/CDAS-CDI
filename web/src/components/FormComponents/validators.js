export const checkRequired = (value) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "Required";
  }
  return false;
};

export const checkNumbers = (value) => {
  const regexp = /^[0-9\b]+$/;
  if (value !== "" && !regexp.test(value)) {
    return "Only number format values are allowed";
  }
  return false;
};

export const checkAlphaNumeric = (value) => {
  const regexp = /^[a-zA-Z0-9-_]+$/;
  if (value.search(regexp) === -1) {
    return "Only Alphanumeric format values are allowed";
  }
  return false;
};

export const checkMaxLength = (value) => {
  if (value && value.length > 30) {
    return `Must be 30 characters or less`;
  }
  return false;
};

export const removeUndefined = (arr) =>
  Object.keys(arr)
    .filter((key) => arr[key] !== undefined)
    .reduce((res, key) => {
      res[key] = arr[key];
      return res;
    }, {});
