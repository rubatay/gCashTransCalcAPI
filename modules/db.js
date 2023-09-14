const dotenv = require('dotenv').config();
const pgp = require('pg-promise')();

const dbConHost = process.env.DB_CON_HOST
const dbConPort = process.env.DB_CON_PORT
const dbConDatabase = process.env.DB_CON_DATABASE
const dbConUser = process.env.DB_CON_USER
const dbConPassword = process.env.DB_CON_PASSWORD

// Database connection settings
const db = pgp({
    host: dbConHost,
    port: dbConPort,
    database: dbConDatabase,
    user: dbConUser,
    password: dbConPassword,
});

module.exports = db;
