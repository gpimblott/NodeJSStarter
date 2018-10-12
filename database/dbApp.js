require('dotenv').config({ path: 'process.env' });

const { Pool, Client } = require('pg')

let pgUsername = process.env.PGUSER;
let pgPassword = process.env.PGPASSWORD;
let pgHost = process.env.PGHOST;
let pgDatabase = process.env.PGDATABASE;
let pgPort = process.env.PGPORT;

console.log(pgUsername);
console.log(pgPassword);
console.log(pgHost);
console.log(pgDatabase);
console.log(pgPort);

// pools will use environment variables
// for connection information
const pool = new Pool({
    user: pgUsername,
    host: pgHost,
    database: pgDatabase,
    password: pgPassword,
    port: pgPort
});

//const pool = new Pool();

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
})