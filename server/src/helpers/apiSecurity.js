const apiResponse = require("../helpers/apiResponse");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { getJWTokenFromHeader } = require("./customFunctions");
const { findUserByEmailAndId } = require("./userHelper");
const vaultEndpoint = process.env.VAULT_END_POINT || "";
const vaultToken = process.env.ROOT_TOKEN || "";
const vaultApiVersion = "v1";

const vault = require("node-vault")({
  apiVersion: vaultApiVersion,
  endpoint: vaultEndpoint,
  token: vaultToken,
});

const securedPaths = [
  {
    url: "/dataflow/create",
    methods: ["post"],
  },
  {
    url: "/dataflow/create-dataflow",
    methods: ["post"],
  },
  {
    url: "/dataflow/update-config",
    methods: ["post"],
  },
  {
    url: "/vendor/create",
    methods: ["post"],
  },
  {
    url: "/vendor/list",
    methods: ["get"],
  },
  {
    url: "/datakind/create",
    methods: ["post"],
  },
  {
    url: "/datakind/table/list",
    methods: ["get"],
  },
  {
    url: "/location/create",
    methods: ["post"],
  },
  {
    url: "/location/list",
    methods: ["get"],
  },
];

exports.secureApi = async (req, res, next) => {
  try {
    const { path, headers, method } = req;

    const pathIndex = securedPaths.findIndex(
      (s) =>
        path.trim().toLowerCase().startsWith(s.url) &&
        (s.methods.includes("all") ||
          s.methods.includes(method.trim().toLowerCase()))
    );

    if (pathIndex === -1) return next();

    const api_key = headers["api-key"];
    const sys_name = headers["sys-name"];
    const token_type = headers["token-type"];
    const access_token = headers["access-token"];
    const jwt_token = getJWTokenFromHeader(req);

    if (!api_key)
      return apiResponse.unauthorizedResponse(
        res,
        "Authentication failed - Invalid Api Key"
      );

    if (!token_type)
      return apiResponse.unauthorizedResponse(
        res,
        "Authentication failed - Invalid Token Type"
      );

    if (!access_token)
      return apiResponse.unauthorizedResponse(
        res,
        "Authentication failed - Invalid Token"
      );

    if (!sys_name)
      return apiResponse.unauthorizedResponse(
        res,
        "Authentication failed - Invalid External System Name"
      );

    /* if (!jwt_token) {
      return apiResponse.unauthorizedResponse(
        res,
        "Authorization failed - Invalid Authorization"
      );
    } */

    const decodeJWToken = () => {
      const decodedValue = jwt.decode(jwt_token) || {};
      return decodedValue;
    };

    const validateUserInDataBase = async () => {
      let isUserExist = false;
      if (jwt_token) {
        const { userid, email } = decodeJWToken();
        isUserExist = await findUserByEmailAndId(userid, email);
      }
      return isUserExist;
    };

    const bytes = CryptoJS.AES.decrypt(
      api_key,
      process.env.ENCRYPTION_KEY || ""
    );

    const original_api_key = bytes.toString(CryptoJS.enc.Utf8);

    try {
      if (token_type === "JWT") {
        const isValidUser = await validateUserInDataBase();
        // console.log("valid user found in db=======>", isValidUser);
      }
      const vaultData = await vault.read(`kv/API-KEYS/${sys_name}`);
      if (vaultData && original_api_key === vaultData?.data?.api_key) {
        return next();
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }

    return apiResponse.unauthorizedResponse(res, "Unauthorized Access");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
};
