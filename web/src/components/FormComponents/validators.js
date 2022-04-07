export const checkRequired = (value) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "Required";
  }
  return false;
};

export const checkValidQuery = (value) => {
  if (value !== "" && value?.toLowerCase().trim().indexOf("select *") > -1) {
    return "Custom SQL Query should not contain select *";
  }
  return false;
};

export const checkfilterCondition = (value) => {
  if (!value?.toLowerCase().trim().startsWith("where")) {
    if (value === "" || value === undefined) {
      return false;
    }
    return "Filter condition should start with WHERE";
  }
  return false;
};

export const checkNumbers = (value) => {
  const regexp = /^[0-9\b]+$/;
  if (value && !regexp.test(value)) {
    return "Only number format values are allowed";
  }
  return false;
};

export const checkNumeric = (value) => {
  const regexp = /^[0-9]+$/;
  if (value !== "" && !regexp.test(value)) {
    return "Only numeric values are allowed";
  }
  return false;
};

export const checkExceSupport = (value, fileType) => {
  let msg = null;
  const regexpExcel = /(\.xlsx|\.xls)$/i;
  const regexpSAS = /(\.sas7bdat)$/i;
  const regexpDelimited = /(\.csv|\.txt)$/i;
  const regexpFixed = /(\.txt)$/i;
  if (
    value !== "" &&
    !regexpExcel.test(value.toLowerCase()) &&
    fileType.toLowerCase() === "excel"
  ) {
    msg = "Only .xlsx and .xls Excel formats are Supported";
  } else if (
    value !== "" &&
    !regexpSAS.test(value.toLowerCase()) &&
    fileType.toLowerCase() === "sas"
  ) {
    msg = "Only .sas7bdat formats are Supported";
  } else if (
    value !== "" &&
    !regexpDelimited.test(value.toLowerCase()) &&
    fileType.toLowerCase() === "delimited"
  ) {
    msg = "Only .csv or .txt formats are Supported";
  } else if (
    value !== "" &&
    !regexpFixed.test(value.toLowerCase()) &&
    fileType.toLowerCase() === "fixed width"
  ) {
    msg = "Only .txt formats are Supported";
  }
  return msg;
};

export const checkAlphaNumeric = (value, key = "") => {
  const regexp = key === "values" ? /^[a-zA-Z0-9~_\s]+$/ : /\w+$/;
  if (key === "format") {
    return false;
  }
  if (value && value.search(regexp) === -1) {
    return "Only Alphanumeric format values are allowed";
  }
  return false;
};

export const checkAlphaNumericFileName = (value) => {
  const regexp = /^[A-Za-z0-9_<.>]+$/;
  if (value && value.search(regexp) === -1) {
    return "Special characters are not allowed";
  }
  return false;
};

export const checkExecptSpace = (value) => {
  const regexp = /^[A-Za-z0-9_<.>@#/|$%&*()+]+$/;
  if (value && value.search(regexp) === -1) {
    return "Space is not allowed";
  }
  return false;
};

export const checkRequiredValue = (value, key = "", primary = "") => {
  return (
    value &&
    key === "required" &&
    value !== primary &&
    primary === "Yes" &&
    "Columns with primary keys with value Y should also have Required value Y"
  );
};

export const checkCharacterLength = (value, key, minLength, maxLength) => {
  return (
    (key === "minLength" || key === "maxLength") &&
    // eslint-disable-next-line no-undef
    parseInt(minLength, 10) >= parseInt(maxLength, 10) &&
    "Max length should be greater than the min length"
  );
};

export const checkFormat = (value, key = "", dataType = "") => {
  if (dataType === "Alphanumeric") {
    const regexp = /^[a-zA-Z0-9-_]+$/;
    if (value !== "" && !regexp.test(value)) {
      return (
        key === "format" &&
        "Only Alphanumeric format values are allowed for Alphanumeric Data Type"
      );
    }
  }
  if (dataType === "Numeric") {
    const regexp = /^[nN0-9.<>%]+$/;
    if (value !== "" && !regexp.test(value)) {
      return (
        key === "format" &&
        "Only numeric format values are allowed for Numeric Data Type"
      );
    }
  }
  if (dataType === "Date") {
    const regexp = /^[Y]{4}[M]{2}[D]{2}$/;
    if (value !== "" && !regexp.test(value)) {
      return (
        key === "format" &&
        "Only Date format (YYYYMMDD) values are allowed for Date Data Type "
      );
    }
  }
  return false;
};

export const checkMinLength = (value) => {
  if (value && value.length < 8) {
    return `Minimum 8 characters are required`;
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
