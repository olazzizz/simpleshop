const express = require('express');
const router = express.Router();
const PRODUCTS = require('../data/products');

function discountedPrice(p) {
  return p.price * (1 - p.discount / 100);
}

function buildCartResponse(sessionCart) {
  const raw = sessionCart || {};
  const items = Object.entries(raw)
    .filter(([, qty]) => qty > 0)
    .map(([id, quantity]) => {
      const product = PRODUCTS.find(p => p.id === +id);
      if (!product) return null;
      const unitPrice = discountedPrice(product);
      return { product, quantity, unitPrice, subtotal: unitPrice * quantity };
    })
    .filter(Boolean);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.subtotal, 0);
  return { items, count, total };
}

router.get('/', (req, res) => {
  res.json(buildCartResponse(req.session.cart));
});

router.post('/', (req, res) => {
  const { productId } = req.body;
  const product = PRODUCTS.find(p => p.id === +productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (!req.session.cart) req.session.cart = {};
  req.session.cart[productId] = (req.session.cart[productId] || 0) + 1;

  res.json(buildCartResponse(req.session.cart));
});

router.put('/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!req.session.cart) req.session.cart = {};

  if (quantity <= 0) {
    delete req.session.cart[productId];
  } else {
    req.session.cart[productId] = quantity;
  }

  res.json(buildCartResponse(req.session.cart));
});

router.delete('/:productId', (req, res) => {
  if (req.session.cart) delete req.session.cart[req.params.productId];
  res.json(buildCartResponse(req.session.cart));
});

router.delete('/', (req, res) => {
  req.session.cart = {};
  res.json(buildCartResponse(req.session.cart));
});

module.exports = router;
