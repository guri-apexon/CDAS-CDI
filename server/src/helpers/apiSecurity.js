const apiResponse = require("../helpers/apiResponse");
const CryptoJS = require("crypto-js");
const vaultEndpoint = process.env.CDI_ACCESS_VAULT_END_POINT || "";
const vaultToken = process.env.CDI_ACCESS_VAULT_TOKEN || "";
const vaultApiVersion = "v1";

const vault = require("node-vault")({
  apiVersion: vaultApiVersion,
  endpoint: vaultEndpoint,
  token: vaultToken,
});

const securedPaths = [
  {
    url: "/dataflow/create-dataflow",
    methods: ["post"],
  },
  {
    url: "/dataflow/create",
    methods: ["post"],
  },
  {
    url: "/dataflow/update-config",
    methods: ["post"],
  },
  // {
  //   url: "/vendor/create",
  //   methods: ["post"],
  // },
  // {
  //   url: "/datakind/create",
  //   methods: ["post"],
  // },
  // {
  //   url: "/location/create",
  //   methods: ["post"],
  // },
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

    const { api_key, sys_name, token_type, access_token } = headers;

    if (!api_key || !process.env.ENCRYPTION_KEY || !sys_name)
      return apiResponse.unauthorizedResponse(res, "Unauthorized Access");

    const bytes = CryptoJS.AES.decrypt(
      api_key,
      process.env.ENCRYPTION_KEY || ""
    );

    const original_api_key = bytes.toString(CryptoJS.enc.Utf8);

    const vaultData = await vault.read(`kv/API-KEYS/${sys_name}`);

    if (vaultData && original_api_key === vaultData?.data?.api_key) {
      return next();
    } else {
      return apiResponse.unauthorizedResponse(res, "Unauthorized Access");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
};
