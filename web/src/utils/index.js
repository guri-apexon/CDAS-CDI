/* eslint-disable prefer-destructuring */
/* eslint-disable eqeqeq */
import moment from "moment";
import React from "react";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import { TextField } from "apollo-react/components/TextField/TextField";
import { DATA_TYPES, IDLE_LOGOUT_TIME } from "./constants";
// import { hive2CDH, hive2CDP, impala, oracle, SQLServer } from "../constants";

export const getCookie = (key) => {
  const b = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return b ? b.pop() : "";
};

export const secondsToHms = (d) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);
  return `${h}h ${m}m ${s}s`;
};

// URL Related
export function getQueryParams(query) {
  const queryStrings = query.substr(1).split("&");
  const queryParams = {};
  queryStrings.forEach((element) => {
    const keyAndValue = element.split("=");
    // eslint-disable-next-line prefer-destructuring
    queryParams[keyAndValue[0]] = keyAndValue[1];
  });
  return queryParams;
}

export function getPathnameAndSearch(path) {
  const arr = path.split("?");
  return {
    pathname: arr[0],
    search: `?${arr[1]}`,
  };
}

export const getHeaderValue = (accessor) => {
  switch (accessor) {
    case "protocolnumber":
      return "Protocol Number";
    case "sponsorname":
      return "Sponsor Name";
    case "phase":
      return "Phase";
    case "protocolstatus":
      return "Protocol Status";
    case "dateadded":
      return "Date Added";
    case "dateedited":
      return "Date Edited";
    case "onboardingprogress":
      return "Onboarding Progress";
    case "assignmentcount":
      return "Assignment Count";
    case "therapeuticarea":
      return "Therapeutic Area";
    case "projectcode":
      return "Project Code";
    default:
      return "";
  }
};

export function getLastLogin() {
  const currentLogin = getCookie("user.last_login_ts");
  if (!currentLogin || currentLogin === "first_time") return null;
  return moment
    .utc(moment.unix(currentLogin))
    .local()
    .format("DD-MMM-YYYY hh:mm A");
}
const getDomainName = () => {
  const urlParts = window.location.hostname.split(".");
  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join(".");
};

export function deleteAllCookies() {
  const domain = getDomainName() || "";
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};domain=${domain}`);
  });
  return true;
}

export function getUserId(preventRedirect) {
  const userId = getCookie("user.id");
  if (!userId && !preventRedirect) {
    window.location.reload();
  }
  return userId;
}
export function getUserInfo() {
  return {
    fullName: decodeURIComponent(`${getCookie("user.first_name")} 
                                  ${getCookie("user.last_name")}`),
    firstName: getCookie("user.first_name"),
    lastName: getCookie("user.last_name"),
    userEmail: decodeURIComponent(getCookie("user.email")),
    lastLogin: getLastLogin(),
    userId: getUserId(),
  };
}

let timerId;
export const debounceFunction = (func, delay) => {
  // Cancels the setTimeout method execution
  clearTimeout(timerId);
  // Executes the func after delay time.
  timerId = setTimeout(func, delay);
};

export const titleCase = (str) => {
  const splitStr = str.toLowerCase().split(" ");
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
};

export const compareStrings = (accessor, sortOrder) => {
  return (rowA, rowB) => {
    if (!rowA[accessor]) {
      return 1;
    }
    if (!rowB[accessor]) {
      return -1;
    }
    const stringA = rowA[accessor].toString().toUpperCase();
    const stringB = rowB[accessor].toString().toUpperCase();
    if (sortOrder === "asc") {
      if (stringA < stringB) {
        return -1;
      }

      if (stringA > stringB) {
        return 1;
      }

      return 0;
    }
    if (stringA < stringB) {
      return 1;
    }

    if (stringA > stringB) {
      return -1;
    }

    return 0;
  };
};

export const compareNumbers = (accessor, sortOrder) => {
  return (rowA, rowB) => {
    if (!rowA[accessor]) {
      return 1;
    }
    if (!rowB[accessor]) {
      return -1;
    }
    const numberA = rowA[accessor];
    const numberB = rowB[accessor];

    if (sortOrder === "asc") {
      return numberA - numberB;
    }
    return numberB - numberA;
  };
};

/* eslint-disable react/display-name */
export const compareDates = (accessor, sortOrder) => {
  return (rowA, rowB) => {
    const dateA = rowA[accessor];
    const dateB = rowB[accessor];

    if (sortOrder === "asc") {
      if (moment(dateA).isBefore(dateB)) {
        return -1;
      }
      if (moment(dateB).isBefore(dateA)) {
        return 1;
      }
      return 0;
    }
    if (moment(dateA).isBefore(dateB)) {
      return 1;
    }
    if (moment(dateB).isBefore(dateA)) {
      return -1;
    }
    return 0;
  };
};

// eslint-disable-next-line consistent-return
export const inputAlphaNumericWithUnderScore = (e, callback) => {
  const value = e.target.value
    ? e.target.value.replace(/[^0-9a-zA-Z_]+/gi, "")
    : "";

  if (e.target.value !== value) {
    e.target.value = value;
  }

  if (typeof callback === "function") {
    return callback(value);
  }
};

export const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const ref = React.useRef();
    const [height, setHeight] = React.useState(0);
    const [isFocused, setIsFocused] = React.useState(false);
    const value = filters[accessor];

    React.useEffect(() => {
      const curHeight = ref?.current?.getBoundingClientRect().height;
      if (curHeight !== height) {
        setHeight(curHeight);
      }
    }, [value, isFocused, height]);

    return (
      <div
        style={{
          minWidth: 160,
          maxWidth: "100%",
          position: "relative",
          height,
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={
            value
              ? value.map((label) => {
                  if (label === "") {
                    return { label: "blanks" };
                  }
                  return { label };
                })
              : []
          }
          name={accessor}
          source={source}
          onChange={(event, value2) => {
            updateFilterValue({
              target: {
                name: accessor,
                value: value2.map(({ label }) => {
                  if (label === "blanks") {
                    return "";
                  }
                  return label;
                }),
              },
            });
          }}
          fullWidth
          multiple
          chipColor="white"
          size="small"
          forcePopupIcon
          showCheckboxes
          limitChips={1}
          filterSelectedOptions={false}
          enableVirtualization
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          matchFrom="any"
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
          noOptionsText="No matches"
        />
      </div>
    );
  };

export const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      fullWidth
      margin="none"
      size="small"
    />
  );
};

export const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      type="number"
      style={{ width: 74 }}
      margin="none"
      size="small"
    />
  );
};

export const DateFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <div style={{ minWidth: 230 }}>
      <div style={{ position: "absolute", top: 0, paddingRight: 4 }}>
        <DateRangePickerV2
          value={filters[accessor] || [null, null]}
          name={accessor}
          onChange={(value) =>
            updateFilterValue({
              target: { name: accessor, value },
            })
          }
          startLabel=""
          endLabel=""
          placeholder=""
          fullWidth
          margin="none"
          size="small"
        />
      </div>
    </div>
  );
};

export const createStringArraySearchFilter = (accessor) => {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
};

export const createStatusArraySearchFilter = (accessor) => {
  return (row, filters) => {
    return (
      !Array.isArray(filters[accessor]) ||
      filters[accessor].length === 0 ||
      filters[accessor].some((value) => {
        if (value == "Inactive" || value == 0) {
          return row[accessor] == 0 || row[accessor] == "inactive";
        }
        if (value == "Active" || value == 1) {
          return row[accessor] == 1 || row[accessor] == "active";
        }
        return false;
      })
    );
  };
};
export const toast = (text = "", type = "success") => {
  const customEvent = new CustomEvent("toast", { detail: { text, type } });
  document.dispatchEvent(customEvent);
};

export const columnObj = {
  variableLabel: "",
  columnName: "",
  position: "",
  format: "",
  dataType: "",
  primaryKey: "No",
  unique: "No",
  required: "No",
  minLength: "",
  maxLength: "",
  values: "",
  isInitLoad: true,
  isFormatLoad: true,
  isHavingColumnName: false,
  isEditMode: true,
};

export const getInitColumnObj = () => {
  return { ...columnObj };
};

export const checkHeaders = (data) => {
  const header = data[0];
  const validation =
    header.includes("Protocol") &&
    header.includes("Variable Label") &&
    header.includes("Column Name/Designator") &&
    header.includes("Format") &&
    header.includes("Data Type") &&
    header.includes("Primary(Y/N)") &&
    header.includes("Unique(Y/N)") &&
    header.includes("Required(Y/N)") &&
    header.includes("Min length") &&
    header.includes("Max length") &&
    header.includes("List of values");
  return validation;
};

const setYN = (d) => (d === "Y" ? "Yes" : "No");

export const formatDataNew = (incomingData, protNo) => {
  const data = incomingData.slice(1); // removing header
  let isAllDataMatch = false;
  if (data.length === 1) {
    isAllDataMatch = data[0][0].toString() === protNo.toString();
  } else if (data.length > 1) {
    isAllDataMatch = data
      .map((e) => e[0])
      .every((ele) => ele.toString() === protNo.toString()); // checking for protocol match
  }
  if (isAllDataMatch) {
    const newData =
      data.length > 0
        ? data.map((e, i) => {
            const newObj = {
              uniqueId: i + 1,
              variableLabel: e[1] || "",
              columnName: e[2] || "",
              position: "",
              format: e[3] || "",
              dataType: e[4] || "",
              primaryKey: setYN(e[5]),
              unique: setYN(e[6]),
              required: setYN(e[7]),
              minLength: e[8] || "",
              maxLength: e[9] || "",
              values: e[10] || "",
              isInitLoad: true,
              isHavingColumnName: true,
              isEditMode: true,
            };
            return newObj;
          })
        : [];
    return { headerNotMatching: false, data: newData };
  }
  return { headerNotMatching: !isAllDataMatch, data: [] };
};

export const formatData = (incomingData, protNo) => {
  const data = incomingData.slice(1); // removing header
  let isAllDataMatch = false;
  if (data.length === 1) {
    isAllDataMatch = data[0][0].toString() === protNo.toString();
  } else {
    isAllDataMatch = data
      .map((e) => e[0])
      .every((ele) => ele.toString() === protNo.toString()); // checking for protocol match
  }

  if (isAllDataMatch) {
    const newData =
      data.length > 0
        ? data.map((e, i) => {
            const newObj = {
              uniqueId: i + 1,
              variableLabel: e[1] || "",
              columnName: e[2] || "",
              position: "",
              format: e[3] || "",
              dataType: e[4] || "",
              primaryKey: setYN(e[5]),
              unique: setYN(e[6]),
              required: setYN(e[7]),
              minLength: e[8] || "",
              maxLength: e[9] || "",
              values: e[10] || "",
              isInitLoad: true,
              isHavingColumnName: true,
            };
            return newObj;
          })
        : [];
    return newData;
  }
  return [];
};

export const Capitalize = (str) => {
  // console.log(str, "stt");
  return str && str.charAt(0).toUpperCase() + str.slice(1);
};

export const createSourceFromKey = (tableRows, key) => {
  return Array.from(
    new Set(
      tableRows
        ?.map((r) => ({ label: Capitalize(r[key]) }))
        .map((item) => item.label)
    )
  )
    .map((label) => {
      return { label: label || "" };
    })
    .sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
};

export const dataStruct = [
  {
    value: "tabular",
    label: "Tabular",
  },
];

export const extSysName = [
  {
    value: "",
    label: "None",
  },
  {
    value: "CDR",
    label: "CDR",
  },
  {
    value: "GDMPM-DAS",
    label: "GDMPM-DAS",
  },
  {
    value: "IQB",
    label: "IQB",
  },
  {
    value: "TDSE",
    label: "TDSE",
  },
  {
    value: "Wingspan",
    label: "Wingspan",
  },
];

export const locationTypes = [
  "SFTP",
  "FTPS",
  "Hive CDP",
  "Hive CDH",
  "Impala",
  "MySQL",
  "Oracle",
  "PostgreSQL",
  "SQL Server",
];

export const fileTypes = ["SAS", "Excel", "Delimited", "Fixed Width"];
export const delimeters = ["COMMA", "TAB", "TILDE", "PIPE"];
export const loadTypes = ["Cumulative", "Incremental"];
export const YesNo = ["Yes", "No"];

export const truncateString = (str, length) => {
  if (str) {
    const ending = "...";
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    }
    return str;
  }
  return "";
};

export const generateConnectionURL = (locType, hostName, port, dbName) => {
  if (!locType || !hostName) {
    return "";
  }
  if (locType != "" && (locType === "SFTP" || locType === "FTPS")) {
    return hostName;
  }
  if (locType === "Hive CDP" || locType === "Hive CDH") {
    const transportMode = locType === "Hive CDP" ? "http" : "https";
    return port && dbName
      ? `jdbc:hive2://${hostName}:${port}/${dbName};transportMode=${transportMode};httpPath=cliservice;ssl=1;AllowSelfSignedCerts=1;AuthMech=3`
      : "";
  }
  if (locType === "Oracle") {
    return port && dbName
      ? `jdbc:oracle:thin:@${hostName}:${port}:${dbName}`
      : "";
  }
  if (locType === "MySQL") {
    return port && dbName ? `jdbc:mysql://${hostName}:${port}/${dbName}` : "";
  }
  if (locType === "SQL Server") {
    return port && dbName
      ? `jdbc:sqlserver://${hostName}:${port};databaseName=${dbName}`
      : "";
  }
  if (locType === "PostgreSQL") {
    return port && dbName
      ? `jdbc:postgresql://${hostName}:${port}/${dbName}`
      : "";
  }
  if (locType === "Impala") {
    return port
      ? `jdbc:impala://${hostName}:${port}/${dbName};ssl=1;AllowSelfSignedCerts=1;AuthMech=3`
      : "";
  }
  if (locType && hostName && port && dbName) {
    return `jdbc:${locType}://${hostName}:${port}/${dbName}`;
  }

  return "";
};

export const generatedBName = (locType) => {
  if (locType === "SQL Server") {
    return "MSSQLSERVER";
  }
  if (locType === "Hive CDP" || locType === "Hive CDH") {
    return "HIVE";
  }
  return locType.toUpperCase();
};

export const dateFilterCustom = (accessor) => (row, filters) => {
  if (!filters[accessor]) {
    return true;
  }
  if (!row[accessor]) {
    return false;
  }
  const date = moment(row[accessor]);

  const fromDate = moment(filters[accessor][0], "YYYY-MM-DD");

  const toDate = moment(filters[accessor][1], "YYYY-MM-DD").endOf("day");

  return (
    (!fromDate.isValid() || date.isAfter(fromDate)) &&
    (!toDate.isValid() || date.isBefore(toDate))
  );
};

export const isSftp = (str = "") => {
  return ["SFTP", "FTPS"].includes(str.toUpperCase());
};

export const validateFields = (name, ext) => {
  if (!name || !ext) return false;
  const fileExt = name.split(".").pop();
  if (ext === "sas") ext = "xpt";
  if (ext === fileExt.toLowerCase()) {
    return true;
  }
  return false;
};

export const goToCore = () => {
  if (process.env.REACT_APP_CORE_URL)
    window.location.href = process.env.REACT_APP_CORE_URL;
};

export const dateTypeForJDBC = (datatype) => {
  const type = datatype?.toUpperCase();
  if (DATA_TYPES.alphanumeric.includes(type)) {
    return "Alphanumeric";
  }
  if (DATA_TYPES.numeric.includes(type)) {
    return "Numeric";
  }
  if (DATA_TYPES.date.includes(type)) {
    return "Date";
  }
  return "Alphanumeric";
};
export const parseBool = (b) => {
  return !/^(false|0)$/i.test(b) && !!b;
};
export const setIdleLogout = (logout) => {
  let time;
  // DOM Events
  function resetTimer() {
    clearTimeout(time);
    time = setTimeout(() => {
      logout();
    }, IDLE_LOGOUT_TIME);
  }
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;
  window.onload = resetTimer;
};

export const scrollIntoView = () => {
  const body = document.querySelector("#root");
  body.scrollIntoView(
    {
      behavior: "smooth",
    },
    1500
  );
};

export const extractHostname = (url) => {
  let hostname;
  // find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  // find & remove port number
  hostname = hostname.split(":")[0];
  // find & remove "?"
  hostname = hostname.split("?")[0];
  return hostname;
};

export const convertLocalFormat = (time) => {
  return time
    ? moment.utc(time).local().format("DD-MMM-YYYY hh:mm A")
    : moment().local().format("DD-MMM-YYYY hh:mm A");
};
