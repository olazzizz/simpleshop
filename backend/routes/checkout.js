const express = require('express');
const router = express.Router();
const PRODUCTS = require('../data/products');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

router.post('/', (req, res) => {
  const cart = req.session.cart || {};
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(p => p.id === +id);
    return p ? sum + discountedPrice(p) * qty : sum;
  }, 0);

  req.session.cart = {};
  res.json({ success: true, total });
});

module.exports = router;
