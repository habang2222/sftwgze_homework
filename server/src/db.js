const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Create server/.env (copy from server/.env.example) and set DATABASE_URL.');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => console.error('[pg] idle client error', err));

module.exports = { pool, query: (text, params) => pool.query(text, params) };
