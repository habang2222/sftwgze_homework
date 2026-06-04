const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => console.error('[pg] idle client error', err));

async function query(text, params) {
  return pool.query(text, params);
}

async function getMenusWithOptions() {
  const { rows } = await query(`
    SELECT
      m.*,
      COALESCE(
        json_agg(
          json_build_object('id', o.id, 'name', o.name, 'price', o.price)
          ORDER BY o.id
        ) FILTER (WHERE o.id IS NOT NULL),
        '[]'::json
      ) AS options
    FROM menus m
    LEFT JOIN menu_options o ON o.menu_id = m.id
    GROUP BY m.id
    ORDER BY m.id
  `);
  return rows;
}

async function getOrderStats() {
  const { rows } = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS received,
      COUNT(*) FILTER (WHERE status = 'preparing')::int AS preparing,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed
    FROM orders WHERE status != 'cancelled'
  `);
  return rows[0];
}

module.exports = { pool, query, getMenusWithOptions, getOrderStats, kind: 'pg' };
