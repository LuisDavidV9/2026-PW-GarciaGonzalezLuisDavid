const mysql = require("mysql2/promise");

/**
 * Conexion a la base de datos local MySQL.
 * Si tu contrasena de MySQL no es n0m3l0, cambiala aqui.
 */
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "d4v1d",
  database: "cecyt9_local",
  dateStrings: true,
});

module.exports = pool;
