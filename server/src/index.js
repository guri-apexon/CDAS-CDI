const compression = require("compression");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: "http://ca2updb249vd:8200",
});

const app = express();
dotenv.config();
const PORT = process.env.PORT;
let dir = "./public/exports";
const apiRoutes = require("./route/apiRoutes");
const baseRoutes = require("./route/baseRoutes");

// const Logger = require("./config/logger");

const shouldCompress = (req, res) => {
  if (req.headers["x-no-compression"]) {
    // Will not compress responses, if this header is present
    return false;
  }
  // Resort to standard compression
  return compression.filter(req, res);
};
app.use(
  compression({
    filter: shouldCompress,
    threshold: 0,
  })
);
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "cdascdi",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json({ limit: "50mb" }));

//Route Prefixes
app.use("/", baseRoutes);
app.use("/v1/api/", apiRoutes);

app.use(
  express.urlencoded({
    extended: true,
    parameterLimit: 500000000,
  })
);

app.use("/public", express.static("public"));

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const roleId = process.env.ROLE_ID;
const secretId = process.env.SECRET_ID;

const run = async () => {
  const result = await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

  vault.token = result.auth.client_token;
  console.log(vault.token);
};
run();
app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
  // Logger.info({ message: `app started on port ${PORT}` });
});
