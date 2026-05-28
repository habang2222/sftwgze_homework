const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('DB 초기화 완료');
  await pool.end();
}

init().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
