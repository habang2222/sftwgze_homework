const express = require('express');
const { query, pool } = require('../db');

const router = express.Router();

const NEXT_STATUS = { pending: 'received', received: 'preparing', preparing: 'completed' };
const ACTION_LABELS = { pending: '주문 접수', received: '제조 시작', preparing: '제조 완료' };

async function getOrder(id) {
  const { rows: orders } = await query('SELECT * FROM orders WHERE id = $1', [id]);
  if (!orders.length) return null;
  const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
  return { ...orders[0], items };
}

router.get('/stats', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS received,
        COUNT(*) FILTER (WHERE status = 'preparing')::int AS preparing,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed
      FROM orders WHERE status != 'cancelled'
    `);
    res.json(rows[0]);
  } catch (err) {
    const message = err?.message || String(err);
    res.status(500).json({ error: message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    res.json(order);
  } catch (err) {
    const message = err?.message || String(err);
    res.status(500).json({ error: message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { rows: orders } = await query(
      `SELECT * FROM orders WHERE status != 'cancelled' ORDER BY created_at DESC`
    );
    const result = [];
    for (const order of orders) {
      const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      result.push({ ...order, items });
    }
    res.json(result);
  } catch (err) {
    const message = err?.message || String(err);
    res.status(500).json({ error: message });
  }
});

router.post('/', async (req, res) => {
  const { items } = req.body;
  if (!items?.length) return res.status(400).json({ error: '주문 항목이 필요합니다' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const { rows } = await client.query('SELECT * FROM menus WHERE id = $1', [item.menu_id]);
      if (!rows.length) throw new Error('메뉴를 찾을 수 없습니다');
      const menu = rows[0];
      const qty = item.quantity || 1;
      if (menu.stock < qty) throw new Error(`${menu.name} 재고가 부족합니다`);

      const optionIds = Array.isArray(item.options?.option_ids) ? item.options.option_ids : [];
      let optionTotal = 0;
      let optionDetails = [];
      if (optionIds.length) {
        const { rows: optRows } = await client.query(
          `SELECT id, name, price FROM menu_options WHERE menu_id = $1 AND id = ANY($2::int[]) ORDER BY id`,
          [menu.id, optionIds]
        );
        if (optRows.length !== optionIds.length) throw new Error('유효하지 않은 옵션이 포함되어 있습니다');
        optionDetails = optRows;
        optionTotal = optRows.reduce((sum, o) => sum + (o.price || 0), 0);
      }

      const unitPrice = menu.price + optionTotal;
      totalPrice += unitPrice * qty;

      await client.query('UPDATE menus SET stock = stock - $1 WHERE id = $2', [qty, menu.id]);
      orderItems.push({
        menu_id: menu.id,
        menu_name: menu.name,
        quantity: qty,
        unit_price: unitPrice,
        options: { option_ids: optionIds, option_details: optionDetails },
      });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (status, total_price) VALUES ('pending', $1) RETURNING *`,
      [totalPrice]
    );
    const order = orderRows[0];

    for (const oi of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, oi.menu_id, oi.menu_name, oi.quantity, oi.unit_price, JSON.stringify(oi.options)]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(await getOrder(order.id));
  } catch (err) {
    await client.query('ROLLBACK');
    const message = err?.message || String(err);
    res.status(400).json({ error: message });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다' });

  const next = NEXT_STATUS[order.status];
  if (!next) return res.status(400).json({ error: '더 이상 변경할 수 없습니다' });

  try {
    await query('UPDATE orders SET status = $1 WHERE id = $2', [next, req.params.id]);
    res.json(await getOrder(req.params.id));
  } catch (err) {
    const message = err?.message || String(err);
    res.status(500).json({ error: message });
  }
});

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다' });

    for (const item of order.items) {
      await client.query('UPDATE menus SET stock = stock + $1 WHERE id = $2', [item.quantity, item.menu_id]);
    }
    await client.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: '취소되었습니다' });
  } catch (err) {
    await client.query('ROLLBACK');
    const message = err?.message || String(err);
    res.status(500).json({ error: message });
  } finally {
    client.release();
  }
});

module.exports = router;
