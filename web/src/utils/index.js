import moment from "moment";

/* eslint-disable no-prototype-builtins */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */

export const getCookie = (key) => {
  const b = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return b ? b.pop() : "";
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
  const localDate = moment.unix(currentLogin).local();
  return localDate.format("DD-MMM-YYYY hh:mm A");
}

export function deleteAllCookies() {
  const cookies = document.cookie.split(";");

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    // eslint-disable-next-line prefer-template
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  return true;
}

export function getUserInfo() {
  return {
    fullName: `${getCookie("user.first_name")} ${getCookie("user.last_name")}`,
    userEmail: decodeURIComponent(getCookie("user.email")),
    lastLogin: getLastLogin(),
    user_id: getCookie("user.id"),
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

export const toast = (text = "", type = "success") => {
  const customEvent = new CustomEvent("toast", { detail: { text, type } });
  document.dispatchEvent(customEvent);
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
