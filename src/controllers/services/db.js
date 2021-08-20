const Pool = require("pg").Pool;

const pool = new Pool({
  host: "ec2-34-197-105-186.compute-1.amazonaws.com",
  user: "iercippqjforib",
  password: "f92f332ba0e9f9d5052227b72660d44cdcb46586a3289ce9fdda3ba62002ce9b",
  port: 5432,
  database: "d2p54rktoo09cd",

connectionString: "postgres://iercippqjforib:f92f332ba0e9f9d5052227b72660d44cdcb46586a3289ce9fdda3ba62002ce9b@ec2-34-197-105-186.compute-1.amazonaws.com:5432/d2p54rktoo09cd",
ssl: {
  require:true,
  rejectUnauthorized:false
}

});

module.exports = pool;