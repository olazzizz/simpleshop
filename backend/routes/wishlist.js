const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

router.get('/', async (req, res, next) => {
  try {
    const rows = (await query('SELECT product_id FROM wishlist_items WHERE user_id = $1', [req.session.userId])).rows;
    const items = (await Promise.all(
      rows.map(r => query('SELECT * FROM products WHERE id = $1', [r.product_id]))
    )).map(r => r.rows[0]).filter(Boolean);
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/:productId', async (req, res, next) => {
  try {
    const id = +req.params.productId;
    if (!(await query('SELECT id FROM products WHERE id = $1', [id])).rows[0]) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const inWl = (await query(
      'SELECT 1 FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [req.session.userId, id]
    )).rows[0];

    let inWishlist;
    if (inWl) {
      await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [req.session.userId, id]);
      inWishlist = false;
    } else {
      await query(
        'INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.session.userId, id]
      );
      inWishlist = true;
    }

    const wishlistIds = (await query(
      'SELECT product_id FROM wishlist_items WHERE user_id = $1', [req.session.userId]
    )).rows.map(r => r.product_id);
    res.json({ inWishlist, wishlistIds });
  } catch (err) { next(err); }
});

module.exports = router;
