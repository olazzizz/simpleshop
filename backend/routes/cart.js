const express = require('express');
const router = express.Router();
const db = require('../db/database');

const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
const getCartItems = db.prepare('SELECT product_id, quantity FROM cart_items WHERE session_id = ?');
const upsertCartItem = db.prepare(`
  INSERT INTO cart_items (session_id, product_id, quantity)
  VALUES (?, ?, ?)
  ON CONFLICT(session_id, product_id) DO UPDATE SET quantity = excluded.quantity
`);
const deleteCartItem = db.prepare('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?');
const clearCart = db.prepare('DELETE FROM cart_items WHERE session_id = ?');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

function buildCartResponse(sessionId) {
  const rows = getCartItems.all(sessionId);
  const items = rows.map(row => {
    const product = getProduct.get(row.product_id);
    if (!product) return null;
    const unitPrice = discountedPrice(product);
    return { product, quantity: row.quantity, unitPrice, subtotal: unitPrice * row.quantity };
  }).filter(Boolean);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.subtotal, 0);
  return { items, count, total };
}

router.get('/', (req, res) => {
  res.json(buildCartResponse(req.session.id));
});

router.post('/', (req, res) => {
  const { productId } = req.body;
  const product = getProduct.get(+productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = db.prepare('SELECT quantity FROM cart_items WHERE session_id = ? AND product_id = ?')
    .get(req.session.id, +productId);
  const newQty = (existing ? existing.quantity : 0) + 1;
  upsertCartItem.run(req.session.id, +productId, newQty);

  res.json(buildCartResponse(req.session.id));
});

router.put('/:productId', (req, res) => {
  const productId = +req.params.productId;
  const { quantity } = req.body;

  if (quantity <= 0) {
    deleteCartItem.run(req.session.id, productId);
  } else {
    upsertCartItem.run(req.session.id, productId, quantity);
  }

  res.json(buildCartResponse(req.session.id));
});

router.delete('/:productId', (req, res) => {
  deleteCartItem.run(req.session.id, +req.params.productId);
  res.json(buildCartResponse(req.session.id));
});

router.delete('/', (req, res) => {
  clearCart.run(req.session.id);
  res.json(buildCartResponse(req.session.id));
});

module.exports = router;
