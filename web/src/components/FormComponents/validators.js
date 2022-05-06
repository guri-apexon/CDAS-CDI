/* eslint-disable no-useless-escape */
/* eslint-disable consistent-return */
import { includes, isEmpty } from "lodash";

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
  const regexp = /^[\d]+$/;
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
    msg = "Only .xlsx and .xls excel formats are supported";
  } else if (
    value !== "" &&
    !regexpSAS.test(value.toLowerCase()) &&
    fileType.toLowerCase() === "sas"
  ) {
    msg = "Only .sas7bdat formats are supported";
  } else if (
    value !== "" &&
    !regexpDelimited.test(value.toLowerCase()) &&
    fileType.toLowerCase() === "delimited"
  ) {
    msg = "Only .csv or .txt formats are supported";
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
    return "Only alphanumeric format values are allowed";
  }
  return false;
};

export const checkAlphaNumericFileName = (value) => {
  const regexp = /^[A-Za-z0-9-_.%@&()!#~;+,{}<>[\] \b]+$/;
  const regexp2 = /[^hmsdyinx%-\s]/gi;
  const regexp1 = /\<(.*?)\>/g;
  const matched = value.match(regexp1);

  const inValid = (element) => element === true;

  if (matched?.length > 0) {
    const allValidation = matched.map((e) => {
      const ele = e.substr(1, e.length - 2).toLowerCase();
      return !!(ele && ele.match(regexp2));
    });
    if (allValidation.some(inValid)) {
      return "Incorrect format entered file name";
    }
  }

  if (value && value.search(regexp) === -1) {
    return "Special characters are not allowed";
  }
  return false;
};

export const checkAlphaNumericMnemonic = (value) => {
  const regexp = /^[\w]+$/;
  if (value && value.search(regexp) === -1) {
    return "Only alphanumeric format values are allowed";
  }
  return false;
};

export const checkExecptSpace = (value) => {
  const regexp = /^[A-Za-z0-9_<.>!@#/|$%&*()+]+$/;
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
    "Columns with primary keys with value Y should also have required value Y"
  );
};

export const checkCharacterLength = (value, key, minLength, maxLength) => {
  return (
    (key === "minLength" || key === "maxLength") &&
    // eslint-disable-next-line no-undef
    parseInt(minLength, 10) > parseInt(maxLength, 10) &&
    "Max length should be greater than or equal to min length"
  );
};

export const checkFormat = (value, key = "", dataType = "") => {
  if (dataType === "Alphanumeric") {
    const regexp = /^[a-zA-Z0-9-_]+$/;
    if (value !== "" && !regexp.test(value)) {
      return (
        key === "format" &&
        "Only alphanumeric format values are allowed for alphanumeric data type"
      );
    }
  }
  if (dataType === "Numeric") {
    const regexp = /^[nN0-9.<>%]+$/;
    if (value !== "" && !regexp.test(value)) {
      return (
        key === "format" &&
        "Only numeric format values are allowed for numeric data type"
      );
    }
  }
  if (dataType === "Date") {
    const regexp = /^[Y]{4}[M]{2}[D]{2}$/;
    if (value !== "" && !regexp.test(value)) {
      return (
        key === "format" &&
        "Only date format (YYYYMMDD) values are allowed for date data type "
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

export const checkMaxLength = (value, length = 30) => {
  if (value && value.length > length) {
    return `Must be ${length} characters or less`;
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

export const validateRow = (row) => {
  const {
    isHavingColumnName,
    minLength,
    maxLength,
    dataType,
    columnName,
    isNotValid,
  } = row;

  const min = Number.parseInt(minLength, 10);
  const max = Number.parseInt(maxLength, 10);

  // if (isNotValid) {
  //   return false;
  // }

  let check = isHavingColumnName;
  if (!dataType || !columnName) {
    check = false;
  } else if (
    (minLength || maxLength) &&
    (Number.isNaN(min) || Number.isNaN(max))
  ) {
    check = false;
  } else if (isHavingColumnName && !Number.isNaN(min) && !Number.isNaN(max)) {
    check = min < max;
  }
  return check;
};
