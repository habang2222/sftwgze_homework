const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.DATABASE_URL || 'sqlite:./data/cozy.db';
const dbPath = url.replace(/^sqlite:/, '');
const absPath = path.isAbsolute(dbPath) ? dbPath : path.join(__dirname, '..', dbPath);

fs.mkdirSync(path.dirname(absPath), { recursive: true });

const db = new Database(absPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function toPgParams(text, params = []) {
  let i = 0;
  const sql = text.replace(/\$(\d+)/g, () => {
    i += 1;
    return '?';
  });
  return { sql, params };
}

function query(text, params = []) {
  const { sql, params: bound } = toPgParams(text, params);
  const trimmed = sql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
    const stmt = db.prepare(sql);
    const rows = bound.length ? stmt.all(...bound) : stmt.all();
    return Promise.resolve({ rows, rowCount: rows.length });
  }

  const stmt = db.prepare(sql);
  const info = bound.length ? stmt.run(...bound) : stmt.run();
  let rows = [];
  if (trimmed.startsWith('INSERT') && sql.toUpperCase().includes('RETURNING')) {
    rows = db.prepare('SELECT * FROM ' + sql.match(/INTO\s+(\w+)/i)[1] + ' WHERE rowid = ?').all(info.lastInsertRowid);
  } else if (trimmed.startsWith('UPDATE') && sql.toUpperCase().includes('RETURNING')) {
    const id = bound[bound.length - 1];
    const table = sql.match(/UPDATE\s+(\w+)/i)[1];
    rows = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).all(id);
  }
  return Promise.resolve({ rows, rowCount: info.changes });
}

const pool = {
  connect: () =>
    Promise.resolve({
      query,
      release: () => {},
    }),
};

function getMenusWithOptions() {
  const menus = db.prepare('SELECT * FROM menus ORDER BY id').all();
  const optStmt = db.prepare(
    'SELECT id, name, price FROM menu_options WHERE menu_id = ? ORDER BY id'
  );
  return Promise.resolve(
    menus.map((menu) => ({
      ...menu,
      options: optStmt.all(menu.id),
    }))
  );
}

function getOrderStats() {
  const row = db
    .prepare(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS received,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) AS preparing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
      FROM orders WHERE status != 'cancelled'`
    )
    .get();
  return Promise.resolve(row);
}

module.exports = { pool, query, getMenusWithOptions, getOrderStats, db, kind: 'sqlite' };
