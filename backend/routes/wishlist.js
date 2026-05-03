const express = require('express');
const router = express.Router();
const PRODUCTS = require('../data/products');

router.get('/', (req, res) => {
  const ids = req.session.wishlist || [];
  const items = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  res.json(items);
});

router.post('/:productId', (req, res) => {
  const id = +req.params.productId;
  if (!PRODUCTS.find(p => p.id === id)) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!req.session.wishlist) req.session.wishlist = [];

  const idx = req.session.wishlist.indexOf(id);
  let inWishlist;
  if (idx === -1) {
    req.session.wishlist.push(id);
    inWishlist = true;
  } else {
    req.session.wishlist.splice(idx, 1);
    inWishlist = false;
  }

  res.json({ inWishlist, wishlistIds: req.session.wishlist });
});

module.exports = router;
