const { createLogger, format, transports } = require("winston");
const { combine, timestamp, json } = format;

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: "cdi-server.log" }),
  ],
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json()
  ),
});

module.exports = logger;
