// eslint-disable-next-line import/prefer-default-export
export const packageComprTypes = [
  { text: "Not Compressed", value: "" },
  { text: "Zip", value: "ZIP" },
  { text: "7Z", value: "7Z" },
  { text: "SAS XPT", value: "SAS" },
  { text: "RAR", value: "RAR" },
];
export const packageTypes = [
  { text: "Regular", value: "Regular" },
  { text: "Raw", value: "Raw" },
  { text: "All", value: "All" },
];
export const DATA_TYPES = {
  alphanumeric: [
    "RAW",
    "ANYDATA",
    "VARCHAR2",
    "BFILE",
    "BINARY",
    "BLOB",
    "BOOL",
    "BOOLEAN",
    "CHAR",
    "CHARACTER",
    "CHARACTER VARYING",
    "CLOB",
    "DATETIMEOFFSET",
    "ENUM",
    "JSON",
    "LOB",
    "NCHAR",
    "NCLOB",
    "NTEXT",
    "NVARCHAR",
    "NVARCHAR2",
    "SET",
    "STRING",
    "TEXT",
    "TIME",
    "VARBINARY",
    "VARCHAR",
    "YEAR",
  ],
  numeric: [
    "BIGINT",
    "BINARY_DOUBLE",
    "BIT",
    "DECIMAL",
    "DOUBLE",
    "FLOAT",
    "INT",
    "INTEGER",
    "LONG",
    "LONG RAW",
    "NUMBER",
    "NUMERIC",
    "PRECISION",
    "REAL",
    "SMALLINT",
    "TINYINT",
  ],
  date: [
    "TIMESTAMP",
    "DATE",
    "TIME",
    "DATETIME",
    "DATETIME2",
    "SMALLDATETIME",
    "TIMESTAMP WITH TIME ZONE",
    "TIMESTAMP WITHOUT TIME ZONE",
    "TIMESTAMP(3)",
    "TIMESTAMP(6)",
  ],
};
export const IDLE_LOGOUT_TIME = 1800000;
