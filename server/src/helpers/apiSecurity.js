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

const decodeJWToken = (jwt_token) => {
  const decodedValue = jwt.decode(jwt_token) || {};
  return decodedValue;
};

const validateUserInDataBase = async (jwt_token) => {
  let isUserExist = false;
  if (jwt_token) {
    const { userid, email } = decodeJWToken(jwt_token);
    isUserExist = await findUserByEmailAndId(userid, email);
  }
  return isUserExist;
};

const decrypt = (api_key, iv) => {
  if (!process.env.ENCRYPTION_KEY || !api_key) return "";
  const key = iv
    ? CryptoJS.AES.decrypt(
        api_key,
        CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_KEY),
        { iv: CryptoJS.enc.Utf8.parse(iv) }
      ).toString(CryptoJS.enc.Utf8)
    : CryptoJS.AES.decrypt(api_key, process.env.ENCRYPTION_KEY).toString(
        CryptoJS.enc.Utf8
      );
  return key;
};

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

    const vaultData = await vault.read(`kv/API-KEYS/${sys_name}`);

    try {
      switch (token_type.toUpperCase()) {
        case "JWT":
          const isValidUser = await validateUserInDataBase(jwt_token);
          // console.log("valid user found in db=======>", isValidUser);
          return apiResponse.unauthorizedResponse(res, "JWT not supported");

        case "USER":
          const isUserExist = await findUserByEmailAndId(decrypt(access_token));
          if (!isUserExist)
            return apiResponse.unauthorizedResponse(res, "User ID not found");

          if (
            vaultData &&
            decrypt(api_key, vaultData?.data?.iv) ===
              vaultData?.data?.api_key &&
            isUserExist
          )
            return next();
          else
            return apiResponse.unauthorizedResponse(res, "Unauthorized Access");

        case "SAML":
          return apiResponse.unauthorizedResponse(res, "SAML not supported");

        default:
          return apiResponse.unauthorizedResponse(
            res,
            "Not authorized to perform this action"
          );
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
};
