const express = require('express');
const router = express.Router();
const db = require('../db/database');

const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
const getWishlist = db.prepare('SELECT product_id FROM wishlist_items WHERE session_id = ?');
const addToWishlist = db.prepare('INSERT OR IGNORE INTO wishlist_items (session_id, product_id) VALUES (?, ?)');
const removeFromWishlist = db.prepare('DELETE FROM wishlist_items WHERE session_id = ? AND product_id = ?');
const isInWishlist = db.prepare('SELECT 1 FROM wishlist_items WHERE session_id = ? AND product_id = ?');

router.get('/', (req, res) => {
  const rows = getWishlist.all(req.session.id);
  const items = rows.map(r => getProduct.get(r.product_id)).filter(Boolean);
  res.json(items);
});

router.post('/:productId', (req, res) => {
  const id = +req.params.productId;
  if (!getProduct.get(id)) {
    return res.status(404).json({ error: 'Product not found' });
  }

  let inWishlist;
  if (isInWishlist.get(req.session.id, id)) {
    removeFromWishlist.run(req.session.id, id);
    inWishlist = false;
  } else {
    addToWishlist.run(req.session.id, id);
    inWishlist = true;
  }

  const wishlistIds = getWishlist.all(req.session.id).map(r => r.product_id);
  res.json({ inWishlist, wishlistIds });
});

module.exports = router;
