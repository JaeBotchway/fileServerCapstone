const Pool = require("pg").Pool;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "jackie",
  port: 5432,
  database: "fileserver"
});

module.exports = pool;