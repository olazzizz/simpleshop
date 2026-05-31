const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

async function buildCartResponse(userId) {
  const rows = (await query('SELECT product_id, quantity FROM cart_items WHERE user_id = $1', [userId])).rows;
  const items = (await Promise.all(rows.map(async row => {
    const product = (await query('SELECT * FROM products WHERE id = $1', [row.product_id])).rows[0];
    if (!product) return null;
    const unitPrice = discountedPrice(product);
    return { product, quantity: row.quantity, unitPrice, subtotal: unitPrice * row.quantity };
  }))).filter(Boolean);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.subtotal, 0);
  return { items, count, total };
}

router.get('/', async (req, res, next) => {
  try {
    res.json(await buildCartResponse(req.session.userId));
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = (await query('SELECT * FROM products WHERE id = $1', [+productId])).rows[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = (await query(
      'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.session.userId, +productId]
    )).rows[0];
    const newQty = (existing ? existing.quantity : 0) + 1;
    await query(`
      INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity
    `, [req.session.userId, +productId, newQty]);

    res.json(await buildCartResponse(req.session.userId));
  } catch (err) { next(err); }
});

router.put('/:productId', async (req, res, next) => {
  try {
    const productId = +req.params.productId;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.session.userId, productId]);
    } else {
      await query(`
        INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity
      `, [req.session.userId, productId, quantity]);
    }

    res.json(await buildCartResponse(req.session.userId));
  } catch (err) { next(err); }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.session.userId, +req.params.productId]);
    res.json(await buildCartResponse(req.session.userId));
  } catch (err) { next(err); }
});

router.delete('/', async (req, res, next) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.session.userId]);
    res.json(await buildCartResponse(req.session.userId));
  } catch (err) { next(err); }
});

module.exports = router;
