const pgp = require('pg-promise')();

// Database connection settings
const db = pgp({
    host: 'db.zkcolxrwvwsgxrnitvys.supabase.co',
    port: '5432',
    database: 'postgres',
    user: 'postgres',
    password: 'IamnumbeR4Ladmin01',
});

module.exports = db;
