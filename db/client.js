require("dotenv").config();
const { user, host, database, password, port } = process.env;

const { Pool } = require("pg");

// const connectionString =
//   process.env.DATABASE_URL || "https://localhost:5432/fitness-dev";

const client = new Pool({
  user: user,
  host: host,
  database: database,
  password: password,
  port: port,
});

module.exports = client;
