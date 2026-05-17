const express = require('express');
const router = express.Router();
const db = require('../db/database');

const getCartItems    = db.prepare('SELECT product_id, quantity FROM cart_items WHERE user_id = ?');
const getProduct      = db.prepare('SELECT * FROM products WHERE id = ?');
const insertOrder     = db.prepare('INSERT INTO orders (user_id, total) VALUES (?, ?)');
const insertOrderItem = db.prepare(
  'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
);
const clearCart = db.prepare('DELETE FROM cart_items WHERE user_id = ?');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

router.post('/', (req, res) => {
  const userId = req.session.userId;
  const rows = getCartItems.all(userId);

  if (rows.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let total = 0;
  const lineItems = rows.map(row => {
    const product = getProduct.get(row.product_id);
    if (!product) return null;
    const unitPrice = discountedPrice(product);
    total += unitPrice * row.quantity;
    return { productId: row.product_id, quantity: row.quantity, unitPrice };
  }).filter(Boolean);

  const placeOrder = db.transaction(() => {
    const { lastInsertRowid: orderId } = insertOrder.run(userId, total);
    for (const item of lineItems) {
      insertOrderItem.run(orderId, item.productId, item.quantity, item.unitPrice);
    }
    clearCart.run(userId);
    return orderId;
  });

  const orderId = placeOrder();
  res.json({ success: true, orderId, total });
});

module.exports = router;
