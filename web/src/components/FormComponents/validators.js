/* eslint-disable no-useless-escape */
/* eslint-disable consistent-return */

export const checkRequired = (value) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "Required";
  }
  return false;
};

export const checkValidQuery = (value) => {
  if (!value) {
    return "Please add your query to proceed.";
  }
  if (value !== "" && value?.toLowerCase().trim().indexOf("select *") > -1) {
    return "Custom SQL query should not contain select *";
  }
  return false;
};

export const checkfilterCondition = (value) => {
  if (!value) {
    return false;
  }
  if (!value?.toLowerCase().trim().startsWith("where")) {
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
    msg = "Only .txt formats are supported";
  }
  return msg;
};

export const checkAlphaNumeric = (value, key = "") => {
  const regexp = key === "values" ? /^[a-zA-Z0-9~_\s]+$/ : /\w+$/;
  if (key === "format") {
    return false;
  }
  if (value && value.toString().search(regexp) === -1) {
    return "Only alphanumeric format values are allowed";
  }
  return false;
};

export const hasSpecialCHar = (str = "") => {
  return /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(str);
};

export const checkAlphaNumericFileName = (value) => {
  const regexp = /^[A-Za-z0-9-_.%@&()!#~;+,{}<>[\] \b]+$/;
  const regexp2 = /[^hmsdyinx_%/-\s]/gi;
  const regexp1 = /\<(.*?)\>/g;
  const matched = value.match(regexp1);

  const regYear = /y/g;
  const regDay = /d/g;
  const regSecond = /s/g;
  const regMin = /i/g;
  const regMonth = /m/g;

  const inValid = (element) => element === true;

  if (matched?.length > 0) {
    const allValidation = matched.map((e) => {
      const ele = e.substr(1, e.length - 2).toLowerCase();
      if (
        !ele ||
        ele === "-" ||
        (ele.includes("%") && !ele.endsWith("%")) ||
        (ele.includes("d") && ele.match(regDay)?.length !== 2) ||
        (ele.includes("y") && ele.match(regYear)?.length !== 4) ||
        (ele.includes("s") && ele.match(regSecond)?.length !== 2) ||
        (ele.includes("i") &&
          (ele.match(regMin)?.length !== 1 ||
            ele.match(regMonth)?.length !== 1))
        // ||
        // (ele.includes("m") &&
        //   (ele.match(regMonth)?.length !== 2 ||
        //     ele.match(regMonth)?.length !== 3))
      ) {
        return true;
      }
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
    const regexp = /([$]|\\|\s)/gm;
    if (value !== "" && regexp.test(value)) {
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
  if (dataType === "Date" && key === "format") {
    if (value.includes("$") || String.raw`${value}`.includes("\\")) {
      return "\\ and $ are not allowed";
    }
    if (value && value.length > 0) {
      const allowedSymbols = [
        "SSSSSS",
        "MONTH",
        "YYYY",
        "yyyy",
        "SSSZ",
        "SSS",
        "DAY",
        "EEE",
        "MMM",
        "MM",
        "mm",
        "YY",
        "yy",
        "HH",
        "hh",
        "KK",
        "kk",
        "MI",
        "mi",
        "ss",
        "dd",
        "DD",
      ];

      const invalidFormat = /<(.*)?>/;
      const regexPattern = new RegExp(invalidFormat, "g");
      if (!regexPattern.test(value)) {
        return "Not a valid date format.";
      }

      const invalidFormatChars = /<[aGzZ].>|<>|>>|<</;
      const regexPatternChars = new RegExp(invalidFormatChars, "gm");
      if (regexPatternChars.test(value)) {
        return "Not a valid date format.";
      }

      const invalidFormatSpace =
        /<[aGzZ].>|<\s+.*\s+>|<\s+.*>|<.*\s+>|<.*?\s\s+.*?>/;

      const regexPatternSpace = new RegExp(invalidFormatSpace, "gm");
      if (regexPatternSpace.test(value)) {
        return "Not a valid date format.";
      }

      const invalidFormatDuplicate =
        /<[!@#^*&+=._:/,\s-]+?>|<.*[!@#^*&+=._:/,\s-]+>|<[!@#^*&+=._:/,\s-]+.*>/;
      const regexPatternDuplicate = new RegExp(invalidFormatDuplicate, "gm");
      if (regexPatternDuplicate.test(value)) {
        return "Not a valid date format.";
      }

      const regPattern = /<(.*?)>/g;
      let result;
      let invalidDateFormat = false;
      // eslint-disable-next-line no-cond-assign
      while ((result = regPattern.exec(value)) !== null) {
        let matchedToken = result[0];
        if (
          /(>|<)|([!@#^*&+=._:/,\s-][!@#^*&+=._:/,\s-])|[dm]y|[my]d|[dy]m|(\wmonth\w?|\w?month\w)/gi.test(
            result[1]
          )
        ) {
          invalidDateFormat = true;
          break;
        }
        const timeFormat = /(HH|hh)\W((MI|mi|mm)\W)?((ss)(Z|z))?/;
        const timePattern = new RegExp(timeFormat, "g");
        matchedToken = matchedToken.replace(timePattern, "");

        const singleDateFormats = /<[z|Z|%|a|G]>/;
        const singlePattern = new RegExp(singleDateFormats, "g");
        matchedToken = matchedToken.replace(singlePattern, "");

        allowedSymbols.forEach((item) => {
          const find = `<${item}>`;
          const re = new RegExp(find, "g");
          matchedToken = matchedToken.replace(re, "");
        });

        allowedSymbols.forEach((item) => {
          const find = `<(.*?)${item}(.*?)>`;
          const re = new RegExp(find, "g");
          matchedToken = matchedToken.replace(re, "<$1$2>");
        });

        const find = /<[!@#^*&+=._:/,\s-]*?>/;
        const findRegex = new RegExp(find, "g");
        matchedToken = matchedToken.replace(findRegex, "");

        const regex = `<(.*)?>`;
        const pattern = new RegExp(regex, "g");
        if (pattern.test(matchedToken)) {
          invalidDateFormat = true;
          break;
        }
      }

      if (invalidDateFormat) {
        return "Not a valid date format.";
      }
    }

    // const optionArr = [
    //   "Date:<dd><MM><yyyy>Time:<hh>:<mm>:<ss>",
    //   "Date:<dd><MM><yyyy>",
    //   "<dd><MM><yyyy>",
    // ];
    // if (!optionArr.includes(value.replace(/ /g, ""))) {
    //   return "Only date format values are allowed for date data type.";
    // }
    // const regexp = /^[Y]{4}[M]{2}[D]{2}$/;
    // if (value !== "" && !regexp.test(value)) {
    //   return (
    //     key === "format" &&
    //     "Only date format (YYYYMMDD) values are allowed for date data type. \\ and $ are not allowed"
    //   );
    // }
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
  const { minLength, maxLength, dataType, columnName, format } = row;

  const min = Number.parseInt(minLength, 10);
  const max = Number.parseInt(maxLength, 10);
  if (
    !dataType ||
    !columnName ||
    // (columnName && hasSpecialCHar(columnName)) ||
    (dataType && format && checkFormat(format, "format", dataType)) ||
    ((minLength || maxLength) &&
      (Number.isNaN(min) ||
        Number.isNaN(max) ||
        !(!Number.isNaN(min) && !Number.isNaN(max) && min <= max)))
  ) {
    return false;
  }
  return true;
};
