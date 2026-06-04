const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.DATABASE_URL || 'sqlite:./data/cozy.db';
const usePg = url.startsWith('postgresql://') || url.startsWith('postgres://');

const MENU_MEDIA = [
  ['아메리카노(ICE)', '진한 에스프레소에 시원한 얼음을 더한 아이스 아메리카노', 'images/americano-ice.png'],
  ['아메리카노(HOT)', '고소한 원두 향이 살아있는 따뜻한 아메리카노', 'images/americano-hot.png'],
  ['카페라떼', '부드러운 우유와 에스프레소의 조화', 'images/cafe-latte.png'],
];

async function seedMenuMedia(query) {
  for (const [name, description, imageUrl] of MENU_MEDIA) {
    await query('UPDATE menus SET description = $1, image_url = $2 WHERE name = $3', [
      description,
      imageUrl,
      name,
    ]);
  }
}

async function initPg() {
  const { pool } = require('./db-pg');
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
      if (err && err.code !== '42P04') throw err;
    } finally {
      await admin.end();
    }
  }

  const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    await seedMenuMedia((text, params) => pool.query(text, params));
    console.log('PostgreSQL DB 초기화 완료');
  } catch (err) {
    if (err && err.code === '3D000') {
      await ensureDatabaseExists();
      await pool.query(schema);
      await seedMenuMedia((text, params) => pool.query(text, params));
      console.log('PostgreSQL DB 초기화 완료');
    } else {
      throw err;
    }
  } finally {
    await pool.end();
  }
}

function initSqlite() {
  const { db } = require('./db-sqlite');
  const schema = fs.readFileSync(path.join(__dirname, '../schema-sqlite.sql'), 'utf8');
  db.exec(schema);
  const stmt = db.prepare('UPDATE menus SET description = ?, image_url = ? WHERE name = ?');
  for (const [name, description, imageUrl] of MENU_MEDIA) {
    stmt.run(description, imageUrl, name);
  }
  console.log('SQLite DB 초기화 완료:', db.name);
}

async function init() {
  if (usePg) await initPg();
  else initSqlite();
}

init().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
