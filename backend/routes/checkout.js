const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.session.userId;
    const rows = (await client.query('SELECT product_id, quantity FROM cart_items WHERE user_id = $1', [userId])).rows;

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    const lineItems = [];
    for (const row of rows) {
      const product = (await client.query('SELECT * FROM products WHERE id = $1', [row.product_id])).rows[0];
      if (!product) continue;
      const unitPrice = discountedPrice(product);
      total += unitPrice * row.quantity;
      lineItems.push({ productId: row.product_id, quantity: row.quantity, unitPrice });
    }

    await client.query('BEGIN');
    const orderId = (await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
      [userId, total]
    )).rows[0].id;
    for (const item of lineItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
    }
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    await client.query('COMMIT');

    res.json({ success: true, orderId, total });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
