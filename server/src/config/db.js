const { Pool, Client } = require("pg");

const dotenv = require("dotenv");
dotenv.config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  connectionLimit: 100,
  queueLimit: 0,
  waitForConnections: true,
  acquireTimeoutMillis: 60000,
  idleTimeoutMillis: 600000, // 10 minutes
  connectionTimeoutMillis: 20000,
});

pool.connect((err) => {
  if (err) {
    console.log("error connecting to db", err.stack);
    process.exit(1);
  }
  console.log("Connected to db...");
});

const executeQuery = (query, arrayParams) => {
  return new Promise((resolve, reject) => {
    try {
      pool.query(query, arrayParams, (err, data) => {
        if (err) {
          console.log("error executing the query");
          reject(err);
        }
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { executeQuery };
