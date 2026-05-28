const express = require('express');
const { query } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM menus ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, description, price, stock } = req.body;
  if (!name || price == null) return res.status(400).json({ error: '이름과 가격은 필수입니다' });
  try {
    const { rows } = await query(
      'INSERT INTO menus (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '간단한 설명...', price, stock ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const { rows } = await query(
      `UPDATE menus SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock)
      WHERE id = $5 RETURNING *`,
      [name, description, price, stock, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/stock', async (req, res) => {
  const { stock } = req.body;
  if (stock == null || stock < 0) return res.status(400).json({ error: '유효한 재고가 필요합니다' });
  try {
    const { rows } = await query('UPDATE menus SET stock = $1 WHERE id = $2 RETURNING *', [stock, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM menus WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' });
    res.json({ message: '삭제되었습니다' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
