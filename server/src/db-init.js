const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const { Client } = require('pg');

function withDatabase(connectionString, database) {
  const u = new URL(connectionString);
  u.pathname = `/${database}`;
  return u.toString();
}

async function ensureDatabaseExists() {
  const connectionString = process.env.DATABASE_URL;
  const u = new URL(connectionString);
  const dbName = u.pathname.replace(/^\//, '') || 'cozy_coffee';

  const admin = new Client({ connectionString: withDatabase(connectionString, 'postgres') });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`DB 생성 완료: ${dbName}`);
  } catch (err) {
    // 42P04 = duplicate_database
    if (err && err.code !== '42P04') throw err;
  } finally {
    await admin.end();
  }
}

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('DB 초기화 완료');
  } catch (err) {
    if (err && err.code === '3D000') {
      await ensureDatabaseExists();
      await pool.query(schema);
      console.log('DB 초기화 완료');
    } else {
      throw err;
    }
  } finally {
    await pool.end();
  }
}

init().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
