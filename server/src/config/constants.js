module.exports = Object.freeze({
  DB_SCHEMA_NAME: process.env.DB_SCHEMA_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_PORT: process.env.DB_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  FSR_ENCRYPTION_KEY: process.env.FSR_ENCRYPTION_KEY,
  FSR_ENCRYPTION_IV: process.env.FSR_ENCRYPTION_IV,
  FSR_HEADERS: {
    ClientId: process.env.FSR_CLIENT_ID,
    ClientSecret: process.env.FSR_CLIENT_SECRET,
    "Content-Type": process.env.FSR_CONTENT_TYPE,
  },
  FSR_API_URI: process.env.FSR_API_URI,
});
