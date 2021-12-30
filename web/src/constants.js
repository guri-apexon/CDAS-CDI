export const PATH = "Path";
export const Success = "success";
export const Warning = "warning";
export const Info = "info";
export const Error = "error";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";

export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAILURE = "AUTH_FAILURE";

export const STUDYBOARD_DATA = "STUDYBOARD_DATA";
export const STUDYBOARD_FETCH_SUCCESS = "STUDYBOARD_FETCH_SUCCESS";
export const STUDYBOARD_FETCH_FAILURE = "STUDYBOARD_FETCH_FAILURE";

export const STUDY_NOTONBOARDED_STATUS = "STUDY_NOTONBOARDED_STATUS";
export const STUDY_NOTONBOARDED_SUCCESS = "STUDY_NOTONBOARDED_SUCCESS";
export const STUDY_NOTONBOARDED_FAILURE = "STUDY_NOTONBOARDED_FAILURE";

export const PACKAGES_LIST = "PACKAGES_LIST";
export const PACKAGES_LIST_SUCCESS = "PACKAGES_LIST_SUCCESS";
export const PACKAGES_LIST_FAILURE = "PACKAGES_LIST_FAILURE";
export const ADD_DATA_PACKAGE = "ADD_DATA_PACKAGE";
export const ADD_PACKAGE_SUCCESS = "ADD_PACKAGE_SUCCESS";
export const ADD_PACKAGE_FAILURE = "ADD_PACKAGE_FAILURE";

export const UPDATE_DATA_PACKAGE = "UPDATE_DATA_PACKAGE";
export const UPDATE_DATA_PACKAGE_SUCCESS = "UPDATE_DATA_PACKAGE_SUCCESS";
export const UPDATE_DATA_PACKAGE_FAILURE = "UPDATE_DATA_PACKAGE_FAILURE";

// API URLS

export const STUDYBOARD_DATA_FETCH = "v1/api/study/list";
export const STUDYSEARCH = "v1/api/study/search-study";
export const PACKAGES_SEARCH = "v1/api/data-package/search";
export const ADD_PACKAGE = "v1/api/data-package/add";
export const DELETE_PACKAGE = "v1/api/data-package/delete";
export const UPDATE_PACKAGE = "v1/api/data-package/update-status";
export const NOT_ONBOARDED_FETCH = "v1/api/study/notonboarded-studies-stat";
export const baseURL = process.env.API_URL || "http://localhost:4001";
