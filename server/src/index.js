const compression = require("compression");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();
dotenv.config();
const apiSecurity = require("./helpers/apiSecurity");
const PORT = process.env.PORT;
let dir = "./public/exports";
const apiRoutes = require("./route/apiRoutes");
const baseRoutes = require("./route/baseRoutes");

const Logger = require("./config/logger");

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

// saved for whitelisting domains for future purpose
// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTION"],
  allowedHeaders: [
    "Access-Control-Allow-Origin",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "api-key",
    "api-name",
    "sys-name",
    "token-type",
    "access-token",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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
// app.use("/v1/api/", apiSecurity.secureApi);
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

app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
  Logger.info({ message: `app started on port ${PORT}` });
});
